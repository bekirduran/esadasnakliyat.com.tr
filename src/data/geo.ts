import data from './geography.json';
import { services } from './site';
export type Province = {
  id: number;
  name: string;
  slug: string;
  districts: { id: number; name: string; slug: string }[];
};
export const provinces: Province[] = data.provinces;
export function regionPath(city: string, district?: string) {
  return `/hizmetler/bolgeler/${city}/${district ? district + '/' : ''}`;
}
export function findRegion(path: string) {
  const parts = path.split('/').filter(Boolean);
  if (
    parts[0] !== 'hizmetler' ||
    (parts[1] !== 'bolgeler' && !services.some((s) => s.slug === parts[1])) ||
    parts.length < 3 ||
    parts.length > 4
  )
    return;
  const city = provinces.find((p) => p.slug === parts[2]);
  if (!city) return;
  const district = parts[3] ? city.districts.find((d) => d.slug === parts[3]) : undefined;
  if (parts[3] && !district) return;
  const service = services.find((s) => s.slug === parts[1]);
  const canonical = service
    ? serviceRegionPath(service.slug, city.slug, district?.slug)
    : regionPath(city.slug, district?.slug);
  if (path !== canonical) return;
  return { city, district, service, label: district ? `${city.name} ${district.name}` : city.name };
}

export function serviceRegionPath(service: string, city: string, district?: string) {
  return `/hizmetler/${service}/${city}/${district ? district + '/' : ''}`;
}
