#!/usr/bin/env node
// Jednokratna prijava u TikTok: daje refresh token za tajnu TIKTOK_REFRESH_TOKEN.
//
// 1) node tiktok/prijava.mjs
//    → ispiše poveznicu; otvori je, prijavi se i odobri pristup.
// 2) TikTok te vrati na redirect adresu s ?code=... u adresnoj traci. Kopiraj cijelu adresu i:
//    node tiktok/prijava.mjs "<cijela adresa ili samo code>"
//    → ispiše refresh token (vrijedi 365 dana).
//
// Env: TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI
//      (redirect mora biti upisan u TikTok developer aplikaciji, npr. https://nabadac.github.io/projekti-repo/)
const { TIKTOK_CLIENT_KEY: key, TIKTOK_CLIENT_SECRET: secret, TIKTOK_REDIRECT_URI: redirect } = process.env;
if (!key || !secret || !redirect) {
  console.error('Postavi TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET i TIKTOK_REDIRECT_URI.');
  process.exit(1);
}
const ulaz = process.argv[2];

if (!ulaz) {
  const u = new URL('https://www.tiktok.com/v2/auth/authorize/');
  u.search = new URLSearchParams({
    client_key: key, response_type: 'code', scope: 'user.info.basic,video.upload',
    redirect_uri: redirect, state: Math.random().toString(36).slice(2),
  });
  console.log('Otvori ovu poveznicu, prijavi se i odobri pristup:\n\n' + u + '\n');
  console.log('Zatim pokreni: node tiktok/prijava.mjs "<adresa na koju te TikTok vratio>"');
  process.exit(0);
}

const code = ulaz.includes('code=') ? new URL(ulaz).searchParams.get('code') : decodeURIComponent(ulaz);
const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ client_key: key, client_secret: secret, code, grant_type: 'authorization_code', redirect_uri: redirect }),
});
const j = await res.json();
if (!j.refresh_token) { console.error('Greška:', JSON.stringify(j)); process.exit(1); }
console.log(`Scope: ${j.scope}`);
console.log(`Refresh token vrijedi ${Math.round(j.refresh_expires_in / 86400)} dana. Spremi ga u GitHub tajnu TIKTOK_REFRESH_TOKEN:\n`);
console.log(j.refresh_token);
