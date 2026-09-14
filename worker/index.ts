import { keywordBrief } from '../src/data/keywords';
import { mediaSlots, basePaths, site, services } from '../src/data/site';
import { findRegion, provinces, regionPath } from '../src/data/geo';
import {
  InputError,
  authenticated,
  sessionToken,
  verifyPassword,
  sameOrigin,
  readJson,
  readBytes,
  imageMime,
  digest,
  escapeHtml as esc,
  type Secrets,
} from './security';
import { validateLead, validateLocation, publicationErrors, type LocationRecord } from './content';
type AppEnv = Env & Secrets;
type MediaRecord = {
  slot: string;
  object_key: string;
  alt: string;
  mime: string;
  updated_at: string;
};
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const isSlot = (slot: string) => mediaSlots.some((s) => s === slot);
async function limited(request: Request, env: AppEnv, scope: string, max: number, seconds: number) {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'local';
  const hash = await digest(scope + ':' + ip);
  const now = Math.floor(Date.now() / 1000);
  const window = Math.floor(now / seconds);
  const key = `${scope}:${hash}:${window}`;
  const row = await env.DB.prepare(
    'INSERT INTO rate_limits(key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count',
  )
    .bind(key, (window + 1) * seconds)
    .first<{ count: number }>();
  return !row || row.count > max;
}
async function handleApi(request: Request, env: AppEnv, path: string) {
  if (!['GET', 'POST', 'PUT'].includes(request.method))
    return json({ error: 'Yöntem desteklenmiyor.' }, 405);
  if (request.method !== 'GET' && !sameOrigin(request))
    return json({ error: 'Geçersiz istek kaynağı.' }, 403);
  if (path === '/api/health') return json({ ok: true, environment: env.ENVIRONMENT });
  if (path === '/api/admin/session' && request.method === 'GET')
    return json({ authenticated: await authenticated(request, env), environment: env.ENVIRONMENT });
  if (path === '/api/admin/login' && request.method === 'POST') {
    if (!env.ADMIN_PASSWORD_HASH || !env.SESSION_SECRET || env.SESSION_SECRET.length < 32)
      return json({ error: 'Yönetici erişimi henüz yapılandırılmadı.' }, 503);
    if (await limited(request, env, 'login', 5, 900))
      return json({ error: 'Çok fazla deneme. 15 dakika sonra tekrar deneyin.' }, 429);
    const input = await readJson(request, 2000);
    if (
      typeof input.password !== 'string' ||
      !(await verifyPassword(input.password, env.ADMIN_PASSWORD_HASH))
    )
      return json({ error: 'Parola geçersiz.' }, 401);
    const token = await sessionToken(env.SESSION_SECRET);
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Set-Cookie': `esadas_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`,
      },
    });
  }
  if (path === '/api/admin/logout' && request.method === 'POST')
    return new Response('{}', {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Set-Cookie': 'esadas_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
      },
    });
  if (path === '/api/leads' && request.method === 'POST') {
    if (await limited(request, env, 'lead', 5, 3600))
      return json({ error: 'Talep sınırına ulaştınız. Telefonla ulaşabilirsiniz.' }, 429);
    const input = await readJson(request);
    if (input.website) return json({ error: 'Talep doğrulanamadı.' }, 400);
    const lead = validateLead(input);
    const id = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO leads(id,name,phone,service,origin,destination,date,details) VALUES(?,?,?,?,?,?,?,?)',
    )
      .bind(
        id,
        lead.name,
        lead.phone,
        lead.service,
        lead.origin,
        lead.destination,
        lead.date,
        lead.details,
      )
      .run();
    return json({ ok: true, id }, 201);
  }
  if (!path.startsWith('/api/admin/')) return json({ error: 'Bulunamadı.' }, 404);
  if (!(await authenticated(request, env)))
    return json({ error: 'Yönetici oturumu gerekli.' }, 401);
  if (path === '/api/admin/media' && request.method === 'GET')
    return json({
      items: (await env.DB.prepare('SELECT * FROM media').all<MediaRecord>()).results,
      slots: mediaSlots,
    });
  if (path.startsWith('/api/admin/media/') && request.method === 'PUT') {
    const slot = path.split('/').pop()!;
    if (!isSlot(slot)) return json({ error: 'Geçersiz görsel alanı.' }, 400);
    const alt = new URL(request.url).searchParams.get('alt')?.trim() ?? '';
    if (alt.length < 8 || alt.length > 240)
      return json({ error: 'Görsel açıklaması 8–240 karakter olmalı.' }, 400);
    const bytes = await readBytes(request, 8 * 1024 * 1024);
    const mime = imageMime(bytes);
    if (!mime) return json({ error: 'Yalnızca JPEG, PNG veya WebP yükleyin.' }, 400);
    const key = `${slot}/${crypto.randomUUID()}.${mime === 'image/jpeg' ? 'jpg' : mime === 'image/png' ? 'png' : 'webp'}`;
    await env.MEDIA.put(key, bytes, {
      httpMetadata: { contentType: mime },
      customMetadata: { alt },
    });
    await env.DB.prepare(
      'INSERT INTO media(slot,object_key,alt,mime) VALUES(?,?,?,?) ON CONFLICT(slot) DO UPDATE SET object_key=excluded.object_key,alt=excluded.alt,mime=excluded.mime,updated_at=CURRENT_TIMESTAMP',
    )
      .bind(slot, key, alt, mime)
      .run();
    return json({ ok: true, url: `/media/${slot}`, alt });
  }
  if (path === '/api/admin/locations' && request.method === 'GET') {
    const records = (
      await env.DB.prepare(
        'SELECT path,title,status,updated_at FROM locations ORDER BY updated_at DESC',
      ).all()
    ).results;
    const requested = new URL(request.url).searchParams.get('path');
    return json({
      records,
      provinces,
      brief: requested ? keywordBrief(requested) : null,
      location: requested
        ? await env.DB.prepare('SELECT * FROM locations WHERE path=?').bind(requested).first()
        : null,
    });
  }
  if (path === '/api/admin/locations' && request.method === 'PUT') {
    const value = validateLocation(await readJson(request, 22000));
    const normalized = (value.description + ' ' + value.local_details)
      .toLocaleLowerCase('tr')
      .replace(/\s+/g, ' ')
      .trim();
    const content_hash = await digest(normalized);
    if (value.status === 'published') {
      const duplicate = await env.DB.prepare(
        "SELECT path FROM locations WHERE content_hash=? AND path<>? AND status='published'",
      )
        .bind(content_hash, value.path)
        .first();
      if (duplicate)
        return json(
          { error: 'Aynı içerik başka bir bölgede yayınlanmış. Bölgeye özgü bilgi ekleyin.' },
          409,
        );
    }
    await env.DB.prepare(
      'INSERT INTO locations(path,title,description,local_details,evidence_url,service_confirmed,status,content_hash) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(path) DO UPDATE SET title=excluded.title,description=excluded.description,local_details=excluded.local_details,evidence_url=excluded.evidence_url,service_confirmed=excluded.service_confirmed,status=excluded.status,content_hash=excluded.content_hash,updated_at=CURRENT_TIMESTAMP',
    )
      .bind(
        value.path,
        value.title,
        value.description,
        value.local_details,
        value.evidence_url,
        value.service_confirmed,
        value.status,
        content_hash,
      )
      .run();
    return json({ ok: true, status: value.status });
  }
  if (path === '/api/admin/leads' && request.method === 'GET')
    return json({
      items: (await env.DB.prepare('SELECT * FROM leads ORDER BY created_at DESC LIMIT 200').all())
        .results,
    });
  if (path.startsWith('/api/admin/leads/') && request.method === 'PUT') {
    const id = path.split('/').pop()!;
    const input = await readJson(request);
    if (!['new', 'contacted', 'completed'].includes(String(input.status)))
      return json({ error: 'Geçersiz durum.' }, 400);
    const result = await env.DB.prepare('UPDATE leads SET status=? WHERE id=?')
      .bind(String(input.status), id)
      .run();
    return result.meta.changes ? json({ ok: true }) : json({ error: 'Talep bulunamadı.' }, 404);
  }
  if (path === '/api/admin/audits' && request.method === 'GET')
    return json({
      items: (
        await env.DB.prepare('SELECT * FROM audit_runs ORDER BY created_at DESC LIMIT 10').all()
      ).results,
    });
  return json({ error: 'Bulunamadı.' }, 404);
}
async function sitemap(env: AppEnv, production: boolean) {
  const records = production
    ? (
        await env.DB.prepare(
          "SELECT * FROM locations WHERE status='published'",
        ).all<LocationRecord>()
      ).results.filter((r) => findRegion(r.path) && publicationErrors(r).length === 0)
    : [];
  const paths = production ? basePaths.filter((p) => !['/teklif/', '/gizlilik/'].includes(p)) : [];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${esc(env.SITE_URL + path)}</loc></url>`).join('')}${records.map((r) => `<url><loc>${esc(env.SITE_URL + r.path)}</loc><lastmod>${r.updated_at.slice(0, 10)}</lastmod></url>`).join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-cache' } },
  );
}
const redirects: Record<string, string> = {
  '/iletisim-2/': '/iletisim/',
  '/esya-depolama-2/': '/esya-depolama/',
  '/ankara-esya-depolama/': '/esya-depolama/',
  '/sehirici-nakliyat/': '/evden-eve-nakliyat/',
  '/kurumsal-nakliye/': '/hakkimizda/',
  '/vizyon-ve-hedeflerimiz/': '/hakkimizda/',
  '/kadromuz/': '/hakkimizda/',
  '/ankara-sehirici-tasima/': '/hizmetler/bolgeler/ankara/',
  '/category/blog/': '/rehber/',
  '/ankara-istanbul-nakliye/': '/hizmetler/bolgeler/istanbul/',
  '/5346707469/': '/iletisim/',
};
async function route(request: Request, env: AppEnv) {
  const url = new URL(request.url);
  const path = url.pathname;
  const canonicalHost = new URL(env.SITE_URL).hostname;
  if (
    env.ENVIRONMENT === 'production' &&
    (url.hostname === `www.${canonicalHost}` ||
      (url.hostname === canonicalHost && url.protocol !== 'https:'))
  ) {
    url.hostname = canonicalHost;
    url.protocol = 'https:';
    return Response.redirect(url.href, 308);
  }
  const production =
    env.ENVIRONMENT === 'production' && url.hostname === new URL(env.SITE_URL).hostname;
  if (path === '/hizmetler.json' && ['GET', 'HEAD'].includes(request.method))
    return json({
      name: site.name,
      url: site.url,
      telephone: site.tel,
      services: services.map((s) => ({
        name: s.name,
        url: site.url + '/' + s.slug + '/',
        description: s.summary,
      })),
      requestQuote: site.url + '/teklif/',
      regions: site.url + '/hizmetler/bolgeler/',
      serviceAvailability: 'Güzergâh, tarih ve operasyon koşulları teklif sırasında doğrulanır.',
    });
  if (path.startsWith('/api/')) return handleApi(request, env, path.replace(/\/$/, ''));
  if (!['GET', 'HEAD'].includes(request.method))
    return new Response('Method not allowed', { status: 405 });
  if (path === '/robots.txt')
    return new Response(
      `User-agent: *\n${production ? 'Allow: /\nDisallow: /admin/\nDisallow: /api/' : 'Disallow: /'}\nSitemap: ${url.origin}/sitemap.xml\n`,
      { headers: { 'Content-Type': 'text/plain' } },
    );
  if (path === '/sitemap.xml' || path === '/sitemap_index.xml') return sitemap(env, production);
  if (path.startsWith('/media/')) {
    const slot = path.split('/')[2];
    if (!slot || !isSlot(slot) || path.split('/').filter(Boolean).length !== 2)
      return new Response('Not found', { status: 404 });
    const media = await env.DB.prepare('SELECT * FROM media WHERE slot=?')
      .bind(slot)
      .first<MediaRecord>();
    if (media) {
      const object = await env.MEDIA.get(media.object_key);
      if (object) {
        const headers = new Headers({
          'Content-Type': media.mime,
          'Cache-Control': 'no-cache',
          ETag: object.httpEtag,
          'X-Content-Type-Options': 'nosniff',
        });
        if (request.headers.get('If-None-Match') === object.httpEtag)
          return new Response(null, { status: 304, headers });
        return new Response(request.method === 'HEAD' ? null : object.body, { headers });
      }
    }
    return env.ASSETS.fetch(
      new Request(new URL(`/images/${slot}.svg`, url), { method: request.method }),
    );
  }
  const normalized = path.endsWith('/') ? path : path + '/';
  let redirect = redirects[normalized];
  if (normalized.startsWith('/hizmetler/esya-depolama-2/')) {
    const target = normalized.replace('/hizmetler/esya-depolama-2/', '/hizmetler/esya-depolama/');
    if (findRegion(target)) redirect = target;
  }
  const oldDistrict = normalized.match(/^\/([a-z-]+)-evden-eve-nakliyat\/$/);
  if (oldDistrict) {
    const city = provinces.find((p) => p.id === 6)!;
    const district = city.districts.find((d) => d.slug === oldDistrict[1]);
    if (district) redirect = regionPath(city.slug, district.slug);
  }
  if (redirect) return Response.redirect(new URL(redirect + url.search, url).href, 301);
  const assetHeaders = new Headers(request.headers);
  if (!path.includes('.') || path.endsWith('.html')) {
    assetHeaders.delete('If-None-Match');
    assetHeaders.delete('If-Modified-Since');
  }
  const response = await env.ASSETS.fetch(new Request(request, { headers: assetHeaders }));
  if (!response.headers.get('Content-Type')?.includes('text/html')) return response;
  const pageStatus = ['/404/', '/404', '/404.html'].includes(path) ? 404 : response.status;
  const records = (
    await env.DB.prepare('SELECT slot,alt FROM media').all<{ slot: string; alt: string }>()
  ).results;
  const rewriter = new HTMLRewriter().on('img[data-media-slot]', {
    element(element) {
      const media = records.find((m) => m.slot === element.getAttribute('data-media-slot'));
      if (media) element.setAttribute('alt', media.alt);
    },
  });
  if (records.some((r) => r.slot === 'hero'))
    rewriter.on('.image-caption', {
      element(e) {
        e.remove();
      },
    });
  const region = findRegion(path);
  let indexable =
    production &&
    pageStatus === 200 &&
    !path.startsWith('/admin') &&
    !['/teklif/', '/gizlilik/'].includes(path);
  if (region) {
    const record = await env.DB.prepare('SELECT * FROM locations WHERE path=?')
      .bind(path)
      .first<LocationRecord>();
    const ready = record?.status === 'published' && publicationErrors(record).length === 0;
    indexable = Boolean(production && ready);
    if (record && ready) {
      const paragraphs = (text: string) =>
        text
          .split(/\n\s*\n/)
          .map((p) => `<p>${esc(p)}</p>`)
          .join('');
      rewriter
        .on('#local-content', {
          element(e) {
            e.setInnerContent(
              `<h2>${esc(record.title)}</h2>${paragraphs(record.description)}<h2>Bölgeye özel taşıma bilgileri</h2>${paragraphs(record.local_details)}<p><a href="${esc(record.evidence_url)}" rel="noopener">Hizmet örneği ve ayrıntılar ↗</a></p>`,
              { html: true },
            );
          },
        })
        .on('title', {
          element(e) {
            e.setInnerContent(esc(record.title) + ' | Esadaş Nakliyat', { html: true });
          },
        })
        .on('meta[name="description"],meta[property="og:description"]', {
          element(e) {
            e.setAttribute('content', record.description.slice(0, 160));
          },
        })
        .on('meta[property="og:title"]', {
          element(e) {
            e.setAttribute('content', record.title);
          },
        });
    }
  }
  rewriter.on('meta[name="robots"]', {
    element(e) {
      e.setAttribute('content', indexable ? 'index,follow' : 'noindex,follow');
    },
  });
  const result = rewriter.transform(response);
  const headers = new Headers(result.headers);
  headers.set('Cache-Control', 'no-cache');
  headers.delete('ETag');
  headers.delete('Last-Modified');
  if (!indexable) headers.set('X-Robots-Tag', 'noindex, follow');
  if (path.startsWith('/admin')) headers.set('Cache-Control', 'no-store');
  return new Response(result.body, { status: pageStatus, headers });
}
export default {
  async fetch(request: Request, env: AppEnv): Promise<Response> {
    let response: Response;
    try {
      response = await route(request, env);
    } catch (error) {
      if (
        (error instanceof SyntaxError || error instanceof InputError) &&
        new URL(request.url).pathname.startsWith('/api/')
      )
        response = json(
          { error: error instanceof SyntaxError ? 'Geçersiz JSON.' : error.message },
          400,
        );
      else {
        console.error(
          JSON.stringify({ event: 'request_failed', path: new URL(request.url).pathname }),
        );
        response = json({ error: 'Geçici bir hata oluştu. Lütfen tekrar deneyin.' }, 503);
      }
    }
    const headers = new Headers(response.headers);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    );
    const url = new URL(request.url);
    if (env.ENVIRONMENT !== 'production' || url.hostname !== new URL(env.SITE_URL).hostname)
      headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(request.method === 'HEAD' ? null : response.body, {
      status: response.status,
      headers,
    });
  },
  async scheduled(_event: ScheduledController, env: AppEnv, ctx: ExecutionContext) {
    ctx.waitUntil(
      (async () => {
        const published = (
          await env.DB.prepare(
            "SELECT * FROM locations WHERE status='published'",
          ).all<LocationRecord>()
        ).results;
        const invalid = published.filter(
          (r) => !findRegion(r.path) || publicationErrors(r).length > 0,
        );
        for (const row of invalid)
          await env.DB.prepare("UPDATE locations SET status='draft' WHERE path=?")
            .bind(row.path)
            .run();
        const cutoff = Math.floor(Date.now() / 1000);
        await env.DB.batch([
          env.DB.prepare('DELETE FROM rate_limits WHERE expires<?').bind(cutoff),
          env.DB.prepare("DELETE FROM leads WHERE created_at<datetime('now','-90 days')"),
          env.DB.prepare("DELETE FROM audit_runs WHERE created_at<datetime('now','-30 days')"),
        ]);
        await env.DB.prepare('INSERT INTO audit_runs(id,result) VALUES(?,?)')
          .bind(
            crypto.randomUUID(),
            JSON.stringify({
              provinces: provinces.length,
              districts: provinces.reduce((n, p) => n + p.districts.length, 0),
              published: published.length - invalid.length,
              returnedToDraft: invalid.map((r) => r.path),
              checkedAt: new Date().toISOString(),
            }),
          )
          .run();
      })(),
    );
  },
} satisfies ExportedHandler<AppEnv>;
