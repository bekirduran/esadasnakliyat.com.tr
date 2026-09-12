import { SignJWT, jwtVerify } from 'jose';
export class InputError extends Error {}
export type Secrets = { ADMIN_PASSWORD_HASH?: string; SESSION_SECRET?: string };
export const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
export async function digest(text: string) {
  return Buffer.from(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)),
  ).toString('hex');
}
export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash || password.length > 256) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' },
    key,
    256,
  );
  const actual = Buffer.from(bits);
  const expected = Buffer.from(hash, 'hex');
  return actual.length === expected.length && crypto.subtle.timingSafeEqual(actual, expected);
}
export async function sessionToken(secret: string) {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('admin')
    .setIssuer('esadas-admin')
    .setAudience('esadas-admin')
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(new TextEncoder().encode(secret));
}
export async function authenticated(request: Request, env: Secrets) {
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) return false;
  const token = request.headers
    .get('Cookie')
    ?.split(';')
    .map((v) => v.trim())
    .find((v) => v.startsWith('esadas_session='))
    ?.slice('esadas_session='.length);
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(env.SESSION_SECRET), {
      algorithms: ['HS256'],
      issuer: 'esadas-admin',
      audience: 'esadas-admin',
    });
    return payload.role === 'admin' && payload.sub === 'admin';
  } catch {
    return false;
  }
}
export function sameOrigin(request: Request) {
  return request.headers.get('Origin') === new URL(request.url).origin;
}
export async function readJson(request: Request, max = 12000): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.includes('application/json'))
    throw new InputError('JSON bekleniyor.');
  const data = await readBytes(request, max);
  const value = JSON.parse(new TextDecoder().decode(data));
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new InputError('Geçersiz veri.');
  return value;
}
export async function readBytes(request: Request, max: number) {
  if (Number(request.headers.get('content-length')) > max)
    throw new InputError('Dosya veya istek çok büyük.');
  const reader = request.body?.getReader();
  if (!reader) throw new InputError('Boş istek.');
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > max) {
        await reader.cancel();
        throw new InputError('Dosya veya istek çok büyük.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.length;
  }
  return bytes;
}
export function imageMime(bytes: Uint8Array) {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)) return 'image/png';
  if (
    new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' &&
    new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP'
  )
    return 'image/webp';
  return null;
}
