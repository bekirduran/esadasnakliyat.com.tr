const env = process.argv[2];
if (!['staging', 'production'].includes(env)) throw Error('Invalid environment');
const config = JSON.parse(
  await (await import('node:fs/promises')).readFile('deployment-urls.json', 'utf8'),
);
const base = config[env];
if (!base) throw Error('Deployment URL is not configured');
const health = await fetch(base + '/api/health');
if (!health.ok || (await health.json()).environment !== env)
  throw Error('Wrong deployment environment');
const page = await fetch(base);
if (!page.ok) throw Error('Homepage failed');
if (!page.headers.get('x-robots-tag')?.includes('noindex'))
  throw Error('Preview host must not be indexed');
const media = await fetch(base + '/media/hero');
if (!media.ok || !media.headers.get('content-type')?.startsWith('image/'))
  throw Error('Media unavailable');
const admin = await fetch(base + '/api/admin/leads');
if (admin.status !== 401) throw Error('Admin API must require authentication');
console.log(`${env}: homepage, media, noindex, health and admin protection verified`);

if (env === 'production') {
  const canonical = 'https://esadasnakliyat.com.tr';
  const live = await fetch(canonical);
  const html = await live.text();
  if (
    !live.ok ||
    live.headers.get('x-robots-tag')?.includes('noindex') ||
    /<meta[^>]+content="noindex/i.test(html)
  )
    throw Error('Production domain must be indexable');
  const liveHealth = await fetch(canonical + '/api/health');
  if (!liveHealth.ok || (await liveHealth.json()).environment !== 'production')
    throw Error('Production domain must reach the production Worker');
  const www = await fetch('https://www.esadasnakliyat.com.tr/hakkimizda/?source=smoke', {
    redirect: 'manual',
  });
  if (www.status !== 308 || www.headers.get('location') !== canonical + '/hakkimizda/?source=smoke')
    throw Error('WWW must redirect to canonical HTTPS preserving path and query');
  console.log('Production domain: health, indexing and canonical redirect verified');
}

const contact = await fetch(base + '/iletisim/');
if (!contact.ok) throw Error('Contact page unavailable');
const legacy = await fetch(base + '/iletisim-2/?source=smoke', { redirect: 'manual' });
if (legacy.status !== 301 || legacy.headers.get('location') !== base + '/iletisim/?source=smoke')
  throw Error('Legacy contact URL must permanently redirect');
const missing = await fetch(base + '/404/');
if (missing.status !== 404 || !missing.headers.get('x-robots-tag')?.includes('noindex'))
  throw Error('Error page must return 404 and noindex');
if (env === 'production') {
  const sitemap = await (await fetch('https://esadasnakliyat.com.tr/sitemap.xml')).text();
  if (
    !sitemap.includes('<loc>https://esadasnakliyat.com.tr/iletisim/</loc>') ||
    sitemap.includes('/iletisim-2/')
  )
    throw Error('Sitemap must use the canonical contact URL');
}
console.log('Contact migration, sitemap and error page indexing verified');
