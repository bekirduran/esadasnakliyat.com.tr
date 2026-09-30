import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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
        assert.ok(sql.includes('ORDER BY path'));
        return {
          all: async () => ({
            results: [
              record,
              {
                ...record,
                path: '/hizmetler/bolgeler/ankara/',
                title: 'Ankara nakliyat',
              },
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
  assert.equal(
    xml.match(/https:\/\/esadasnakliyat\.com\.tr\/hizmetler\/bolgeler\/ankara\//g)?.length,
    1,
  );
  assert.match(
    xml,
    /<loc>https:\/\/esadasnakliyat\.com\.tr\/hizmetler\/bolgeler\/ankara\/<\/loc><lastmod>2026-09-14<\/lastmod>/,
  );
  assert.ok(!xml.includes('/hizmetler/parca-esya-tasima/ankara/'));
  const preview = await worker.fetch(
    new Request('https://preview.workers.dev/sitemap.xml'),
    env as any,
  );
  assert.ok(!(await preview.text()).includes('<url>'));
});

test('Robots policy permits search crawling, protects private routes and rejects training crawlers', async () => {
  const { default: worker } = await import('../worker/index');
  const env = {
    ENVIRONMENT: 'production',
    SITE_URL: 'https://esadasnakliyat.com.tr',
  };
  const response = await worker.fetch(new Request(env.SITE_URL + '/robots.txt'), env as any);
  const body = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /^text\/plain/);
  assert.match(body, /User-agent: \*\nAllow: \/\nDisallow: \/admin\/\nDisallow: \/api\//);
  assert.match(body, /User-agent: GPTBot\nDisallow: \//);
  assert.match(body, /User-agent: Google-Extended\nDisallow: \//);
  assert.match(body, /Sitemap: https:\/\/esadasnakliyat\.com\.tr\/sitemap\.xml/);
});

test('Legacy sitemap index redirects to the canonical sitemap', async () => {
  const { default: worker } = await import('../worker/index');
  const env = {
    ENVIRONMENT: 'production',
    SITE_URL: 'https://esadasnakliyat.com.tr',
  };
  const response = await worker.fetch(
    new Request(env.SITE_URL + '/sitemap_index.xml', { redirect: 'manual' }),
    env as any,
  );
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), env.SITE_URL + '/sitemap.xml');
});

test('Legacy search URLs redirect to relevant indexable service pages', async () => {
  const { default: worker } = await import('../worker/index');
  const origin = 'https://esadasnakliyat.com.tr';
  const env = {
    ENVIRONMENT: 'production',
    SITE_URL: origin,
    DB: {
      prepare() {
        return { bind: () => ({ first: async () => null }) };
      },
    },
  };
  const mappings = {
    '/cankaya-esya-depolama/': '/esya-depolama/',
    '/mamak-esya-depolama/': serviceRegionPath('esya-depolama', 'ankara', 'mamak'),
    '/parca-esya-tasima-nakliye/': '/parca-esya-tasima/',
    '/hizmetlerimiz/': '/hizmetler/',
    '/ankara-istanbul-nakliye/': '/sehirler-arasi-nakliyat/',
    '/cankaya-evden-eve-nakliyat/': serviceRegionPath('evden-eve-nakliyat', 'ankara', 'cankaya'),
    '/mamak-evden-eve-nakliyat/': '/evden-eve-nakliyat/',
    '/dikmen-evden-eve-nakliyat/': '/evden-eve-nakliyat/',
    '/cayyolu-evden-eve-nakliyat/': '/evden-eve-nakliyat/',
  };
  for (const [oldPath, newPath] of Object.entries(mappings)) {
    const response = await worker.fetch(
      new Request(origin + oldPath + '?source=search', { redirect: 'manual' }),
      env as any,
    );
    assert.equal(response.status, 301, oldPath);
    assert.equal(response.headers.get('location'), origin + newPath + '?source=search');
  }
});

test('Legacy district URL uses a verified published local page when available', async () => {
  const { default: worker } = await import('../worker/index');
  const origin = 'https://esadasnakliyat.com.tr';
  const target = serviceRegionPath('evden-eve-nakliyat', 'ankara', 'mamak');
  const record = {
    path: target,
    title: 'Mamak evden eve nakliyat',
    description: 'yerel '.repeat(110),
    local_details: 'erişim '.repeat(60),
    evidence_url: 'https://example.com/reference',
    service_confirmed: 1,
    status: 'published',
  };
  const env = {
    ENVIRONMENT: 'production',
    SITE_URL: origin,
    DB: { prepare: () => ({ bind: () => ({ first: async () => record }) }) },
  };
  const response = await worker.fetch(
    new Request(origin + '/mamak-evden-eve-nakliyat/', { redirect: 'manual' }),
    env as any,
  );
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), origin + target);
});

test('LLM guide links use the official site origins', async () => {
  const text = await readFile(new URL('../public/llms.txt', import.meta.url), 'utf8');
  const links = [...text.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((match) => match[1]);
  assert.ok(links.length > 0);
  assert.ok(
    links.every((link) => {
      const { origin } = new URL(link);
      return ['https://esadasnakliyat.com.tr', 'https://esadasankaraesyadepolama.com'].includes(
        origin,
      );
    }),
  );
});
