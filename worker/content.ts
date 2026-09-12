import { InputError } from './security';
import { findRegion } from '../src/data/geo';
import { services } from '../src/data/site';
export type LocationRecord = {
  path: string;
  title: string;
  description: string;
  local_details: string;
  evidence_url: string;
  service_confirmed: number;
  status: 'draft' | 'published';
  content_hash: string;
  updated_at: string;
};
export function publicationErrors(
  value: Pick<
    LocationRecord,
    'title' | 'description' | 'local_details' | 'evidence_url' | 'service_confirmed'
  >,
) {
  const errors: string[] = [];
  if (!value.service_confirmed) errors.push('Bölgedeki hizmet uygunluğunu doğrulayın.');
  if (value.title.trim().length < 15) errors.push('Açıklayıcı bir başlık girin.');
  if (value.description.trim().split(/\s+/).length < 100)
    errors.push('Hizmet açıklamasını en az 100 kelimeyle tamamlayın.');
  if (value.local_details.trim().split(/\s+/).length < 50)
    errors.push('En az 50 kelimelik bölgeye özel erişim, güzergâh veya iş örneği ekleyin.');
  try {
    const url = new URL(value.evidence_url);
    if (url.protocol !== 'https:') throw new InputError();
  } catch {
    errors.push('Doğrulanabilir bir iş örneği veya hizmet kanıtı için HTTPS bağlantısı girin.');
  }
  return errors;
}
export function validateLocation(input: Record<string, unknown>) {
  const path = String(input.path ?? '');
  if (!findRegion(path) || !path.endsWith('/')) throw new InputError('Geçersiz bölge.');
  const result = {
    path,
    title: String(input.title ?? '').trim(),
    description: String(input.description ?? '').trim(),
    local_details: String(input.local_details ?? '').trim(),
    evidence_url: String(input.evidence_url ?? '').trim(),
    service_confirmed: input.service_confirmed === true ? 1 : 0,
    status: input.status === 'published' ? ('published' as const) : ('draft' as const),
  };
  if (
    result.title.length > 160 ||
    result.description.length > 10000 ||
    result.local_details.length > 8000 ||
    result.evidence_url.length > 1000
  )
    throw new InputError('Alan uzunluğu sınırı aşıldı.');
  if (result.status === 'published') {
    const errors = publicationErrors(result);
    if (errors.length) throw new InputError(errors.join(' '));
  }
  return result;
}
export function validateLead(input: Record<string, unknown>) {
  const fields = ['name', 'phone', 'service', 'origin', 'destination', 'date', 'details'] as const;
  const result = Object.fromEntries(
    fields.map((k) => [k, String(input[k] ?? '').trim()]),
  ) as Record<(typeof fields)[number], string>;
  if (result.name.length < 2 || result.name.length > 100)
    throw new InputError('Adınızı kontrol edin.');
  if (!/^\+?[\d\s()-]{10,25}$/.test(result.phone) || result.phone.replace(/\D/g, '').length < 10)
    throw new InputError('Geçerli bir telefon numarası girin.');
  if (!services.some((s) => s.slug === result.service))
    throw new InputError('Geçerli hizmet seçin.');
  if (
    !result.origin ||
    !result.destination ||
    result.origin.length > 200 ||
    result.destination.length > 200
  )
    throw new InputError('Çıkış ve varış bölgelerini kontrol edin.');
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(result.date) ||
    Number.isNaN(Date.parse(result.date)) ||
    new Date(result.date).toISOString().slice(0, 10) !== result.date ||
    result.date < new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' })
  )
    throw new InputError('Geçerli, geçmişte olmayan bir tarih seçin.');
  if (!result.details || result.details.length > 2000)
    throw new InputError('Eşya bilgilerini en fazla 2000 karakterle girin.');
  if (input.consent !== 'on') throw new InputError('İletişim talebinizi onaylayın.');
  return result;
}
