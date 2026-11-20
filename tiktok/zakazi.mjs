#!/usr/bin/env node
// Upisuje snimljeni video u prvi slobodan termin u tiktok/raspored.json.
//   node tiktok/zakazi.mjs <mapa> <oznaka-izdanja> [--out tiktok/out]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, citajRaspored, spremiRaspored, sljedeciTermin, opisTermina, sazetak } from './lib.mjs';

const [mapa, izdanje] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!mapa || !izdanje) { console.error('Upotreba: node tiktok/zakazi.mjs <mapa> <oznaka-izdanja>'); process.exit(1); }
const outDir = path.resolve(ROOT, process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'tiktok/out');
const meta = JSON.parse(fs.readFileSync(path.join(outDir, `${mapa}.json`), 'utf8'));

const r = citajRaspored();
// ponovno snimanje iste stranice: stari unos koji još nije poslan zamijeni novim
r.videi = r.videi.filter((v) => !(v.stranica === mapa && v.status === 'čeka'));
const termin = sljedeciTermin(r);
const lokalno = opisTermina(r.termini.zona, termin);
r.videi.push({
  stranica: mapa,
  naslov: meta.naslov,
  opis: meta.opis,
  izdanje,
  datoteka: `${mapa}.mp4`,
  termin: termin.toISOString(),
  terminLokalno: lokalno,
  status: 'čeka',
  publishId: null,
  poslano: null,
});
r.videi.sort((a, b) => a.termin.localeCompare(b.termin));
spremiRaspored(r);
sazetak(`- **${mapa}** zakazan za **${lokalno}** (izdanje \`${izdanje}\`)`);
