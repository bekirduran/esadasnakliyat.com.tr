import { writeFile, readFile } from 'node:fs/promises';
const url = 'https://api.turkiyeapi.dev/v1/provinces';
const input = process.argv[2];
const payload = input
  ? JSON.parse(await readFile(input, 'utf8'))
  : await fetch(url).then((r) => {
      if (!r.ok) throw Error('Geography source unavailable');
      return r.json();
    });
const slug = (s) =>
  s
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ş', 's')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const provinces = payload.data.map((p) => ({
  id: p.id,
  name: p.name,
  slug: slug(p.name),
  districts: p.districts.map((d) => ({ id: d.id, name: d.name, slug: slug(d.name) })),
}));
if (provinces.length !== 81 || provinces.reduce((a, p) => a + p.districts.length, 0) < 900)
  throw Error('Incomplete geography dataset; existing snapshot retained');
if (
  new Set(provinces.map((p) => p.slug)).size !== 81 ||
  provinces.some((p) => new Set(p.districts.map((d) => d.slug)).size !== p.districts.length)
)
  throw Error('Duplicate route');
await writeFile(
  'src/data/geography.json',
  JSON.stringify(
    {
      source: url,
      license: 'MIT; see docs/data-source.md',
      retrievedAt: new Date().toISOString(),
      provinces,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `Stored ${provinces.length} provinces / ${provinces.reduce((n, p) => n + p.districts.length, 0)} districts`,
);
