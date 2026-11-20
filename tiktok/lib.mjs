// Zajedničke pomoćne funkcije: raspored (tiktok/raspored.json) i vrijeme po zoni.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const RASPORED = path.join(ROOT, 'tiktok', 'raspored.json');

export function citajRaspored() {
  return JSON.parse(fs.readFileSync(RASPORED, 'utf8'));
}

export function spremiRaspored(r) {
  fs.writeFileSync(RASPORED, JSON.stringify(r, null, 2) + '\n');
}

// Pomak zone u minutama za zadani trenutak, npr. Europe/Zagreb zimi = +60
function pomak(zona, datum) {
  const s = new Intl.DateTimeFormat('en-US', { timeZone: zona, timeZoneName: 'longOffset' })
    .formatToParts(datum).find((p) => p.type === 'timeZoneName').value; // "GMT+01:00" ili "GMT"
  const m = s.match(/([+-])(\d{2}):(\d{2})/);
  return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
}

// Lokalno vrijeme u zoni -> Date (UTC)
export function lokalnoUUtc(zona, god, mj, dan, sat, min) {
  const naivno = Date.UTC(god, mj - 1, dan, sat, min);
  let t = naivno - pomak(zona, new Date(naivno)) * 60000;
  t = naivno - pomak(zona, new Date(t)) * 60000; // druga iteracija za prijelaz ljetnog vremena
  return new Date(t);
}

// Dijelovi datuma u zoni
export function dijelovi(zona, datum) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: zona, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short',
  }).formatToParts(datum).map((x) => [x.type, x.value]));
  const dani = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { god: +p.year, mj: +p.month, dan: +p.day, tjedan: dani[p.weekday] };
}

export function opisTermina(zona, datum) {
  return new Intl.DateTimeFormat('hr-HR', {
    timeZone: zona, weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(datum);
}

// Prvi slobodan termin (dani u tjednu + vrijeme) nakon "od", koji nitko u rasporedu ne zauzima
export function sljedeciTermin(r, od = new Date()) {
  const { dani, vrijeme, zona } = r.termini;
  const [sat, min] = vrijeme.split(':').map(Number);
  const zauzeto = new Set(r.videi.filter((v) => v.status !== 'greška').map((v) => v.termin));
  const najranije = new Date(od.getTime() + 30 * 60000); // barem pola sata unaprijed
  for (let i = 0; i < 400; i++) {
    const d = dijelovi(zona, new Date(od.getTime() + i * 86400000));
    if (!dani.includes(d.tjedan)) continue;
    const t = lokalnoUUtc(zona, d.god, d.mj, d.dan, sat, min);
    if (t < najranije || zauzeto.has(t.toISOString())) continue;
    return t;
  }
  throw new Error('Nema slobodnog termina u sljedećih 400 dana');
}

export function izlaz(ime, vrijednost) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${ime}=${vrijednost}\n`);
  else console.log(`${ime}=${vrijednost}`);
}

export function sazetak(tekst) {
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, tekst + '\n');
  console.log(tekst);
}
