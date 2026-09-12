import data from './geography.json';
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
  if (parts[0] !== 'hizmetler' || parts[1] !== 'bolgeler' || parts.length < 3 || parts.length > 4)
    return;
  const city = provinces.find((p) => p.slug === parts[2]);
  if (!city) return;
  const district = parts[3] ? city.districts.find((d) => d.slug === parts[3]) : undefined;
  if (parts[3] && !district) return;
  return { city, district, label: district ? `${city.name} ${district.name}` : city.name };
}
