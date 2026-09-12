import { findRegion, regionPath } from './geo';
export function keywordBrief(path: string) {
  const region = findRegion(path);
  if (!region) return null;
  const label = region.label;
  return {
    primary: `${label} evden eve nakliyat`,
    related: [
      `${label} asansörlü nakliyat`,
      `${label} şehirler arası nakliyat`,
      `${label} ofis taşımacılığı`,
      `${label} parça eşya taşıma`,
      ...(region.city.id === 6 ? [`${label} eşya depolama`] : []),
    ],
    parent: region.district ? regionPath(region.city.slug) : '/hizmetler/bolgeler/',
    intent:
      'Bölgeden veya bölgeye taşınmak isteyen kişiye hizmet kapsamı, erişim koşulları ve teklif sürecini açıklayın.',
    evidenceNeeded: [
      'Gerçek güzergâh ve tarih uygunluğu',
      'Bölgeye özel bina/araç erişimi bilgisi',
      'Doğrulanabilir hizmet örneği',
    ],
  };
}
