import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const base = 'http://localhost:8787';
const passwordFile = process.argv[2];
if (!passwordFile) throw Error('Private credential file path required');
const password = (await readFile(passwordFile, 'utf8')).match(/^Parola: (.+)$/m)?.[1];
if (!password) throw Error('Credential not found');
const req = async (path, method = 'GET', body, extra = {}) =>
  fetch(base + path, {
    method,
    headers: {
      Origin: base,
      ...(body && typeof body === 'object' && !ArrayBuffer.isView(body)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...extra,
    },
    body:
      body === undefined
        ? undefined
        : typeof body === 'string' || ArrayBuffer.isView(body)
          ? body
          : JSON.stringify(body),
    redirect: 'manual',
  });
assert.equal((await req('/api/admin/leads')).status, 401);
const login = await req('/api/admin/login', 'POST', { password });
assert.equal(login.status, 200, await login.clone().text());
const cookie = login.headers.get('set-cookie').split(';')[0];
assert.match(login.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Strict/);
const auth = { Cookie: cookie };
assert.equal(
  (await req('/api/admin/locations', 'PUT', {}, { ...auth, Origin: 'https://evil.example' }))
    .status,
  403,
);
const lead = {
  name: 'Yerel Test Müşteri',
  phone: '05000000000',
  service: 'evden-eve-nakliyat',
  origin: 'Ankara',
  destination: 'İstanbul',
  date: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
  details: 'Yalnızca yerel otomatik test kaydı.',
  consent: 'on',
};
assert.equal((await req('/api/leads', 'POST', { ...lead, consent: false })).status, 400);
assert.equal((await req('/api/leads', 'POST', lead)).status, 201);
assert.ok(
  (await (await req('/api/admin/leads', 'GET', undefined, auth)).json()).items.some(
    (l) => l.name === lead.name,
  ),
);
assert.equal(
  (
    await req(
      '/api/admin/media/hero?alt=Test%20g%C3%B6rseli',
      'PUT',
      '<svg onload="alert(1)"></svg>',
      { ...auth, 'Content-Type': 'image/svg+xml' },
    )
  ).status,
  400,
);
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j4l8AAAAASUVORK5CYII=',
  'base64',
);
assert.equal(
  (
    await req('/api/admin/media/partial?alt=Yerel%20test%20alternatif%20metni', 'PUT', png, {
      ...auth,
      'Content-Type': 'image/png',
    })
  ).status,
  200,
);
const media = await req('/media/partial');
assert.equal(media.headers.get('content-type'), 'image/png');
assert.equal((await media.arrayBuffer()).byteLength, png.length);
assert.match(await (await req('/parca-esya-tasima/')).text(), /alt="Yerel test alternatif metni"/);
const location = {
  path: '/hizmetler/evden-eve-nakliyat/ankara/cankaya/',
  title: 'Çankaya test taşıma planlaması',
  description: 'Eksik içerik',
  local_details: 'Yerel',
  evidence_url: 'https://example.com/test',
  service_confirmed: true,
  status: 'published',
};
assert.equal((await req('/api/admin/locations', 'PUT', location, auth)).status, 400);
const published = {
  ...location,
  description:
    'Bu yalnızca yerel test için kullanılan bir operasyon açıklamasıdır. Gerçek firma hizmeti veya saha deneyimi beyanı değildir. '.repeat(
      8,
    ) + '<script>window.testInjection=1</script>',
  local_details:
    'Bu yerel test ortamında bölgesel erişim bilgisinin şablona güvenli aktarılması kontrol edilir. '.repeat(
      7,
    ),
};
const save = await req('/api/admin/locations', 'PUT', published, auth);
assert.equal(save.status, 200, await save.clone().text());
const page = await req(location.path);
const html = await page.text();
assert.match(html, /&lt;script&gt;/);
assert.doesNotMatch(html, /<script>window.testInjection/);
assert.match(page.headers.get('x-robots-tag'), /noindex/);
assert.match(html, /Çankaya test taşıma planlaması/);
assert.equal(page.headers.get('etag'), null);
const conditional = await req(location.path, 'GET', undefined, {
  'If-None-Match': '\"old-static-tag\"',
});
assert.equal(conditional.status, 200);
assert.equal(
  (
    await req(
      '/api/admin/locations',
      'PUT',
      { ...published, path: '/hizmetler/bolgeler/ankara/mamak/' },
      auth,
    )
  ).status,
  409,
);
const sitemap = await (await req('/sitemap.xml')).text();
assert.doesNotMatch(sitemap, /<url>/);
assert.equal((await req('/iletisim-2/')).status, 301);
assert.equal((await req('/this-page-does-not-exist/')).status, 404);
assert.equal(
  (await req('/api/admin/locations', 'PUT', { ...published, status: 'draft' }, auth)).status,
  200,
);
assert.doesNotMatch(await (await req(location.path)).text(), /Çankaya test taşıma planlaması/);
const logout = await req('/api/admin/logout', 'POST', undefined, auth);
assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
console.log(
  'PASS: auth, CSRF, lead validation/persistence, image validation/R2, live alt text, publication gate, XSS escaping, duplicate guard, draft rollback, staging noindex/sitemap, redirects and 404. Local data only.',
);
