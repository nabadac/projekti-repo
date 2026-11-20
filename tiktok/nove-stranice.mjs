#!/usr/bin/env node
// Koje su stranice nove u ovom pushu? Nova stranica = dodan sites/<mapa>/index.html.
// Ručno pokretanje: STRANICE="batak,zdd-zagreb" (zarezom odvojene mape).
// Izlaz: stranice=["batak",...] (JSON) u $GITHUB_OUTPUT.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, citajRaspored, izlaz } from './lib.mjs';

const git = (...args) => {
  const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
};

let mape;
if (process.env.STRANICE?.trim()) {
  mape = process.env.STRANICE.split(',').map((s) => s.trim().replace(/^sites\//, '').replace(/\/$/, '')).filter(Boolean);
} else {
  const poslije = process.env.POSLIJE || 'HEAD';
  let prije = process.env.PRIJE;
  // novi branch ili prepisana povijest: usporedi s prethodnim commitom
  if (!prije || /^0+$/.test(prije) || git('cat-file', '-e', `${prije}^{commit}`) === null) prije = `${poslije}^`;
  const diff = git('diff', '--name-only', '--diff-filter=A', prije, poslije, '--', 'sites/*/index.html') ?? '';
  mape = diff.split('\n').filter(Boolean).map((f) => f.split('/')[1]);
}

const vecURasporedu = new Set(citajRaspored().videi.filter((v) => v.status !== 'greška').map((v) => v.stranica));
const nove = [...new Set(mape)].filter((m) => {
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(m)) { console.log(`Preskačem „${m}”: neispravan naziv mape`); return false; }
  if (!fs.existsSync(path.join(ROOT, 'sites', m, 'index.html'))) { console.log(`Preskačem ${m}: nema sites/${m}/index.html`); return false; }
  if (vecURasporedu.has(m) && !process.env.STRANICE) { console.log(`Preskačem ${m}: već je u rasporedu`); return false; }
  return true;
});

console.log(nove.length ? `Nove stranice: ${nove.join(', ')}` : 'Nema novih stranica.');
izlaz('stranice', JSON.stringify(nove));
