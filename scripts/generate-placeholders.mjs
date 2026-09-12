import { writeFile } from 'node:fs/promises';
const palettes = {
  hero: ['#dce8e3', '#a7beb6', '#b98d5c'],
  moving: ['#e9e3d8', '#d0bfab', '#b18859'],
  lift: ['#d9e4ea', '#a6bdcd', '#cba165'],
  intercity: ['#d7e5e9', '#96b4c3', '#d3a873'],
  storage: ['#dce6df', '#a0b8a8', '#bf996c'],
  office: ['#e4e4df', '#b9beb7', '#b8956e'],
  partial: ['#ece4d9', '#d5c2a8', '#bb9463'],
  team: ['#dce6e5', '#aec8c4', '#c49b6c'],
};
const box = (x, y, w, h, color) =>
  `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${color}"/><path d="M${x + w / 2} ${y}v${h}" stroke="#e4caaa" stroke-width="18"/><path d="M${x + 12} ${y + h - 25}h28m-14-14v27" stroke="#7c6244" stroke-width="3"/><path d="M${x} ${y}l18-20h${w}l-18 20z" fill="#d6b993"/></g>`;
for (const [slot, [wall, accent, cardboard]] of Object.entries(palettes)) {
  const truck = ['intercity', 'lift'].includes(slot);
  const scene = truck
    ? `<path d="M0 650h1200v250H0" fill="#a8b9b9"/><path d="M0 780h1200" stroke="#fff9" stroke-width="8" stroke-dasharray="100 65"/><g fill="${accent}"><rect x="50" y="100" width="180" height="450"/><rect x="850" y="70" width="250" height="490"/></g><g fill="#f8f8ecaa">${[0, 1, 2, 3].map((i) => `<rect x="85" y="${150 + i * 85}" width="40" height="50"/><rect x="155" y="${150 + i * 85}" width="40" height="50"/><rect x="900" y="${130 + i * 90}" width="65" height="55"/>`).join('')}</g><rect x="190" y="345" width="540" height="280" rx="15" fill="#f6f5ef"/><path d="M730 440h120l100 110v90H730" fill="#2865dc"/><path d="M755 465h80l66 78H755" fill="#a9cedc"/><rect x="160" y="617" width="810" height="24" rx="6" fill="#102c3c"/><circle cx="340" cy="650" r="63" fill="#243c49"/><circle cx="820" cy="650" r="63" fill="#243c49"/><circle cx="340" cy="650" r="27" fill="#b7c7c9"/><circle cx="820" cy="650" r="27" fill="#b7c7c9"/><text x="310" y="490" fill="#2865dc" font-family="Arial" font-size="60" font-weight="bold">ESADAŞ</text><text x="355" y="530" fill="#536c79" font-family="Arial" font-size="18" letter-spacing="4">NAKLİYAT</text>${slot === 'lift' ? '<path d="M170 340L650 100" stroke="#e1b15e" stroke-width="30"/><path d="M170 340L650 100" stroke="#f6dfb0" stroke-width="10"/>' : ''}`
    : `<rect x="0" y="0" width="1200" height="900" fill="${wall}"/><path d="M0 690h1200v210H0" fill="#c7cec3"/><path d="M0 690h1200" stroke="#92a79b" stroke-width="10"/><rect x="720" y="100" width="330" height="440" fill="${accent}" rx="100"/><rect x="745" y="120" width="280" height="397" rx="85" fill="#eff2e7"/><path d="M885 122v395m-140-190h280" stroke="${accent}" stroke-width="13"/><path d="M910 530l290 230v140H980L770 610" fill="#f6f3d888"/><ellipse cx="540" cy="765" rx="390" ry="60" fill="#71867525"/>${slot === 'storage' ? '<g stroke="#56766c" stroke-width="18"><path d="M140 150v600m410-600v600m-410-400h410m-410 210h410m-410 190h410"/></g>' : ''}${box(150, slot === 'storage' ? 250 : 570, 250, 190, cardboard)}${box(415, 535, 245, 235, '#cea878')}${box(435, 385, 205, 135, '#b58c5c')}${box(680, 640, 160, 120, '#d1b48b')}<path d="M180 170h280v160H180z" fill="#f1eee3"/><path d="M200 306l70-85 50 58 38-43 82 70" fill="${accent}"/><circle cx="398" cy="207" r="22" fill="#cfb581"/><g><path d="M949 702V500" stroke="#527867" stroke-width="11"/><path d="M948 604q-140-30-103-130 118 22 103 130M950 567q117-45 88-131-103 28-88 131M950 521q-78-40-36-108 77 51 36 108" fill="#678c70"/><path d="M895 675h110l-16 110h-78z" fill="#e9e4d7"/></g>${slot === 'office' ? '<rect x="150" y="390" width="320" height="20" fill="#687b75"/><rect x="290" y="240" width="155" height="120" rx="9" fill="#294851"/><path d="M365 360v30" stroke="#294851" stroke-width="14"/>' : ''}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-label="Temsili taşıma illüstrasyonu"><rect width="1200" height="900" fill="${wall}"/>${scene}<text x="45" y="860" font-family="Arial" font-size="15" letter-spacing="3" fill="#49655b">ESADAŞ · TEMSİLİ GÖRSEL</text></svg>`;
  await writeFile(`public/images/${slot}.svg`, svg);
}
