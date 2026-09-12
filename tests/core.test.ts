import { test } from 'node:test';
import assert from 'node:assert/strict';
import { provinces, regionPath, findRegion } from '../src/data/geo';
import { publicationErrors, validateLocation, validateLead } from '../worker/content';
import {
  authenticated,
  sessionToken,
  sameOrigin,
  escapeHtml,
  imageMime,
  readBytes,
} from '../worker/security';
test('Geography snapshot has complete unique routes and parent relationships', () => {
  assert.equal(provinces.length, 81);
  const paths = provinces.flatMap((p) => [
    regionPath(p.slug),
    ...p.districts.map((d) => regionPath(p.slug, d.slug)),
  ]);
  assert.equal(paths.length, 1054);
  assert.equal(new Set(paths).size, paths.length);
  for (const path of paths) assert.ok(findRegion(path));
  assert.equal(findRegion('/hizmetler/bolgeler/ankara/invalid/'), undefined);
  assert.equal(findRegion('/hizmetler/bolgeler/ankara/cankaya/extra/'), undefined);
});
test('Thin, unverified location pages cannot be published', () => {
  const value = {
    path: regionPath('ankara', 'cankaya'),
    title: 'Çankaya nakliyat',
    description: 'İyi hizmet',
    local_details: 'Yerel bilgi',
    evidence_url: 'javascript:alert(1)',
    service_confirmed: true,
    status: 'published',
  };
  assert.throws(() => validateLocation(value));
  assert.ok(publicationErrors({ ...value, service_confirmed: 0 }).length >= 3);
  assert.equal(validateLocation({ ...value, status: 'draft' }).status, 'draft');
});
test('Invalid locations and oversize content are rejected', () => {
  assert.throws(() => validateLocation({ path: '/hizmetler/bolgeler/unknown/' }));
  assert.throws(() =>
    validateLocation({ path: regionPath('ankara'), description: 'a'.repeat(10001) }),
  );
});
test('Lead validation rejects missing consent, unknown services and invalid date', () => {
  const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const valid = {
    name: 'Test Müşteri',
    phone: '05346707469',
    service: 'evden-eve-nakliyat',
    origin: 'Ankara',
    destination: 'İstanbul',
    date,
    details: '2+1 eşya',
    consent: 'on',
  };
  assert.equal(validateLead(valid).origin, 'Ankara');
  assert.throws(() => validateLead({ ...valid, consent: false }));
  assert.throws(() => validateLead({ ...valid, service: 'fake' }));
  assert.throws(() => validateLead({ ...valid, date: '2026-02-30' }));
  assert.throws(() => validateLead({ ...valid, phone: '12' }));
});
test('Sessions fail closed and cannot cross environment secrets', async () => {
  const secret = 's'.repeat(48);
  const token = await sessionToken(secret);
  const request = new Request('https://example.com/api/admin/leads', {
    headers: { Cookie: 'esadas_session=' + token },
  });
  assert.equal(await authenticated(request, { SESSION_SECRET: secret }), true);
  assert.equal(await authenticated(request, { SESSION_SECRET: 'x'.repeat(48) }), false);
  assert.equal(await authenticated(request, {}), false);
  assert.equal(
    await authenticated(new Request('https://example.com'), { SESSION_SECRET: secret }),
    false,
  );
});
test('Cross-origin mutations are rejected', () => {
  assert.equal(
    sameOrigin(new Request('https://example.com/api', { headers: { Origin: 'https://evil.com' } })),
    false,
  );
  assert.equal(
    sameOrigin(
      new Request('https://example.com/api', { headers: { Origin: 'https://example.com' } }),
    ),
    true,
  );
});
test('Media rejects executable SVG and validates supported signatures', () => {
  assert.equal(imageMime(new TextEncoder().encode('<svg onload="alert(1)">')), null);
  assert.equal(
    imageMime(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0])),
    'image/png',
  );
  assert.equal(imageMime(new Uint8Array([255, 216, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0])), 'image/jpeg');
});
test('Bounded readers reject large bodies even without content-length', async () => {
  await assert.rejects(
    readBytes(new Request('https://example.com', { method: 'POST', body: '123456789' }), 4),
  );
});
test('Stored content is escaped before HTML insertion', () => {
  assert.equal(escapeHtml('<script>"&'), '&lt;script&gt;&quot;&amp;');
});
