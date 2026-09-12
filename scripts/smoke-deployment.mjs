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
