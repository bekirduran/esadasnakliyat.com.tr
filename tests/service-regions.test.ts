import { test } from 'node:test';
import assert from 'node:assert/strict';
import { provinces, findRegion, serviceRegionPath } from '../src/data/geo';
import { services } from '../src/data/site';
import { keywordBrief } from '../src/data/keywords';
import { validateLocation } from '../worker/content';

test('Six services cover every province and district with distinct canonical routes', () => {
  assert.equal(services.length, 6);
  const paths = services.flatMap((s) =>
    provinces.flatMap((c) => [
      serviceRegionPath(s.slug, c.slug),
      ...c.districts.map((d) => serviceRegionPath(s.slug, c.slug, d.slug)),
    ]),
  );
  assert.equal(paths.length, 6324);
  assert.equal(new Set(paths).size, 6324);
  for (const path of paths) {
    const region = findRegion(path)!;
    assert.ok(region?.service);
    assert.equal(
      serviceRegionPath(region.service!.slug, region.city.slug, region.district?.slug),
      path,
    );
    assert.ok(keywordBrief(path)?.primary.includes(region.service!.name));
    assert.equal(validateLocation({ path, status: 'draft' }).status, 'draft');
    assert.throws(() => validateLocation({ path, status: 'published', service_confirmed: true }));
  }
});
test('Reject unknown services, wrong city/district pairs and noncanonical variants', () => {
  for (const path of [
    '/hizmetler/unknown/ankara/',
    '/hizmetler/evden-eve-nakliyat/ankara/kadikoy/',
    '/hizmetler/evden-eve-nakliyat//ankara/',
    '/hizmetler/evden-eve-nakliyat/ankara/extra/extra/',
    '/hizmetler/evden-eve-nakliyat/ankara',
  ])
    assert.equal(findRegion(path), undefined);
});

test('Production sitemap includes validated service pages and excludes drafts, invalid content and preview hosts', async () => {
  const { default: worker } = await import('../worker/index');
  const path = serviceRegionPath('evden-eve-nakliyat', 'ankara', 'cankaya');
  const record = {
    path,
    title: 'Çankaya evden eve nakliyat',
    description: 'yerel '.repeat(110),
    local_details: 'erişim '.repeat(60),
    evidence_url: 'https://example.com/reference',
    service_confirmed: 1,
    status: 'published',
    updated_at: '2026-09-14 10:00:00',
  };
  const env = {
    ENVIRONMENT: 'production',
    SITE_URL: 'https://esadasnakliyat.com.tr',
    DB: {
      prepare(sql: string) {
        assert.ok(sql.includes("status='published'"));
        return {
          all: async () => ({
            results: [
              record,
              {
                ...record,
                path: serviceRegionPath('parca-esya-tasima', 'ankara'),
                service_confirmed: 0,
              },
            ],
          }),
        };
      },
    },
  };
  const response = await worker.fetch(new Request(env.SITE_URL + '/sitemap.xml'), env as any);
  const xml = await response.text();
  assert.equal(response.status, 200);
  assert.ok(xml.includes(env.SITE_URL + path));
  assert.ok(!xml.includes('/hizmetler/parca-esya-tasima/ankara/'));
  const preview = await worker.fetch(
    new Request('https://preview.workers.dev/sitemap.xml'),
    env as any,
  );
  assert.ok(!(await preview.text()).includes('<url>'));
});
