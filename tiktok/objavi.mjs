#!/usr/bin/env node
// Šalje dospjele videe iz tiktok/raspored.json u TikTok inbox kao skicu
// (Content Posting API, "Upload to inbox", scope video.upload).
// U aplikaciji dobiješ obavijest, dodaš zvuk i opis (opis je u sažetku i u izdanju) i objaviš.
//
// Env: TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REFRESH_TOKEN
//      --provjeri  samo javi ima li dospjelih videa (bez tajni, bez slanja)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ROOT, citajRaspored, spremiRaspored, izlaz, sazetak } from './lib.mjs';

const API = (process.env.TIKTOK_API_BASE || 'https://open.tiktokapis.com').replace(/\/$/, '');
const sad = new Date(process.env.SADA || Date.now());

const r = citajRaspored();
const dospjeli = r.videi.filter((v) => v.status === 'čeka' && new Date(v.termin) <= sad);

if (process.argv.includes('--provjeri')) {
  console.log(dospjeli.length ? `Dospjelo: ${dospjeli.map((v) => v.stranica).join(', ')}` : 'Ništa nije dospjelo.');
  izlaz('ima', dospjeli.length ? 'da' : 'ne');
  process.exit(0);
}
if (!dospjeli.length) { console.log('Ništa nije dospjelo.'); process.exit(0); }

for (const k of ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET', 'TIKTOK_REFRESH_TOKEN'])
  if (!process.env[k]) { console.error(`Nedostaje tajna ${k} (Settings → Secrets and variables → Actions).`); process.exit(1); }

async function tiktok(put, { token, body, form } = {}) {
  const res = await fetch(API + put, {
    method: 'POST',
    headers: form ? { 'Content-Type': 'application/x-www-form-urlencoded' }
      : { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body: form ? new URLSearchParams(form) : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  const greska = json.error && json.error.code && json.error.code !== 'ok' ? json.error : (json.error && typeof json.error === 'string' ? json : null);
  if (!res.ok || greska) throw new Error(`${put}: HTTP ${res.status} ${JSON.stringify(greska ?? json)}`);
  return json;
}

// 1. svjež access token iz refresh tokena
let tok;
try {
  tok = await tiktok('/v2/oauth/token/', { form: {
    client_key: process.env.TIKTOK_CLIENT_KEY,
    client_secret: process.env.TIKTOK_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: process.env.TIKTOK_REFRESH_TOKEN,
  } });
  if (!tok.access_token) throw new Error('TikTok nije vratio access_token');
} catch (e) {
  sazetak(`❌ TikTok prijava nije uspjela: ${e.message}\n\nProvjeri tajne TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET, ili ponovno pokreni \`node tiktok/prijava.mjs\` i spremi novi TIKTOK_REFRESH_TOKEN. Videi ostaju u rasporedu i šalju se čim prijava proradi.`);
  process.exit(1);
}
const token = tok.access_token;
if (tok.refresh_token && tok.refresh_token !== process.env.TIKTOK_REFRESH_TOKEN) {
  // pokušaj spremiti novi refresh token (treba PAT s pravom na secrets u GH_SECRETS_TOKEN)
  let spremljeno = false;
  if (process.env.GH_SECRETS_TOKEN) {
    const g = spawnSync('gh', ['secret', 'set', 'TIKTOK_REFRESH_TOKEN', '--body', tok.refresh_token],
      { env: { ...process.env, GH_TOKEN: process.env.GH_SECRETS_TOKEN }, stdio: 'inherit' });
    spremljeno = g.status === 0;
  }
  sazetak(spremljeno ? '- Novi TikTok refresh token je spremljen u tajne.'
    : '- ⚠️ TikTok je izdao novi refresh token, a nije ga bilo moguće spremiti. Ako sljedeće slanje javi grešku tokena, ponovno pokreni `node tiktok/prijava.mjs`.');
}

// 2. pošalji svaki dospjeli video
const MB = 1024 * 1024;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tiktok-'));
sazetak('### TikTok skice');
let greske = 0;
for (const v of dospjeli) {
  try {
    const file = path.join(tmp, v.datoteka);
    if (process.env.LOKALNI_VIDEI) fs.copyFileSync(path.join(process.env.LOKALNI_VIDEI, v.datoteka), file);
    else {
      const g = spawnSync('gh', ['release', 'download', v.izdanje, '--pattern', v.datoteka, '--dir', tmp, '--clobber'], { stdio: 'inherit', cwd: ROOT });
      if (g.status !== 0) throw new Error(`ne mogu preuzeti ${v.datoteka} iz izdanja ${v.izdanje}`);
    }
    const buf = fs.readFileSync(file);
    const size = buf.length;
    // do 64 MB ide u jednom komadu; veće u komadima od 10 MB (zadnji preuzima ostatak)
    const chunk = size <= 64 * MB ? size : 10 * MB;
    const count = size <= 64 * MB ? 1 : Math.floor(size / chunk);

    const init = await tiktok('/v2/post/publish/inbox/video/init/', { token, body: {
      source_info: { source: 'FILE_UPLOAD', video_size: size, chunk_size: chunk, total_chunk_count: count },
    } });
    const { publish_id, upload_url } = init.data;
    for (let i = 0; i < count; i++) {
      const a = i * chunk, b = i === count - 1 ? size : a + chunk;
      const up = await fetch(upload_url, { method: 'PUT', body: buf.subarray(a, b), headers: {
        'Content-Type': 'video/mp4', 'Content-Length': String(b - a), 'Content-Range': `bytes ${a}-${b - 1}/${size}`,
      } });
      if (!up.ok) throw new Error(`upload komada ${i + 1}/${count}: HTTP ${up.status} ${await up.text()}`);
    }

    // pričekaj da TikTok obradi video
    let stanje = 'PROCESSING_UPLOAD';
    for (let i = 0; i < 40 && /PROCESSING/.test(stanje); i++) {
      await new Promise((res) => setTimeout(res, 5000));
      const s = await tiktok('/v2/post/publish/status/fetch/', { token, body: { publish_id } });
      stanje = s.data?.status ?? stanje;
      if (stanje === 'FAILED') throw new Error(`TikTok obrada nije uspjela: ${s.data?.fail_reason ?? 'nepoznat razlog'}`);
    }
    v.status = 'poslano';
    v.publishId = publish_id;
    v.poslano = new Date().toISOString();
    v.stanjeTikTok = stanje;
    sazetak(`- ✅ **${v.stranica}** je u TikTok inboxu (${stanje}). Opis za objavu:\n\n\`\`\`\n${v.opis}\n\`\`\``);
  } catch (e) {
    greske++;
    v.zadnjaGreska = String(e.message ?? e).slice(0, 500);
    v.pokusaji = (v.pokusaji ?? 0) + 1;
    if (v.pokusaji >= 3) v.status = 'greška';
    sazetak(`- ❌ **${v.stranica}**: ${v.zadnjaGreska}${v.status === 'greška' ? ' (odustajem nakon 3 pokušaja)' : ' (pokušat ću ponovno za sat vremena)'}`);
  }
  spremiRaspored(r);
}
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(greske ? 1 : 0);
