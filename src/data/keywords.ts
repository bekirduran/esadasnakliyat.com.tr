import { findRegion, regionPath, serviceRegionPath } from './geo';
export function keywordBrief(path: string) {
  const region = findRegion(path);
  if (!region) return null;
  const label = region.label;
  return {
    primary: `${label} ${region.service?.name ?? 'evden eve nakliyat'}`,
    related: [
      `${label} asansörlü nakliyat`,
      `${label} şehirler arası nakliyat`,
      `${label} ofis taşımacılığı`,
      `${label} parça eşya taşıma`,
      ...(region.city.id === 6 ? [`${label} eşya depolama`] : []),
    ],
    parent: region.service
      ? region.district
        ? serviceRegionPath(region.service.slug, region.city.slug)
        : `/${region.service.slug}/`
      : region.district
        ? regionPath(region.city.slug)
        : '/hizmetler/bolgeler/',
    intent:
      'Bölgeden veya bölgeye taşınmak isteyen kişiye hizmet kapsamı, erişim koşulları ve teklif sürecini açıklayın.',
    evidenceNeeded: [
      'Gerçek güzergâh ve tarih uygunluğu',
      'Bölgeye özel bina/araç erişimi bilgisi',
      'Doğrulanabilir hizmet örneği',
    ],
  };
}
