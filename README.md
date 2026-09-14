# Esadaş Nakliyat

Ankara merkezli nakliyat ve depolama sitesi. Astro + Cloudflare Workers, D1 ve R2. 81 il / 973 ilçe ağı, görsel yönetimi, bölgesel içerik editörü ve teklif paneli içerir.

## Branch ve dağıtım

| Branch | GitHub environment | Cloudflare Worker | Veri         |
| ------ | ------------------ | ----------------- | ------------ |
| `dev`  | staging            | esadas-staging    | Ayrı D1 + R2 |
| `main` | production         | esadas-production | Ayrı D1 + R2 |

Geliştirmeler `dev` üzerinde yapılır. Push → typecheck, test, build, dry-run → ilgili ortam migrasyonu → deploy → smoke test. PR'larda doğrulama yapılır, deploy yapılmaz. Production'a geçiş: `dev` değişikliklerini `main` ile birleştirip push edin. Aynı branch dağıtımları sıraya alınır.

**CI/CD aktivasyonu:** GitHub repo Settings → Secrets and variables → Actions altında `CLOUDFLARE_API_TOKEN` ekleyin. `7b3ba6e92f9637e04a00500d703f1b91` hesabının Workers Scripts:Edit, D1:Edit ve Workers R2 Storage:Edit yetkileri gerekir. Özel alan adı/route yönetimi eklendiğinde ilgili zone yetkileri de gerekir. Token yokken workflow doğrulamaları çalışır, deploy adımı uyarıyla atlanır; otomatik dağıtım yapılmış sayılmaz. Token ekledikten sonra son workflow'u yeniden çalıştırın veya ilgili branch'e push edin.

Cloudflare account ID ve kaynak ID'leri secret değildir; `wrangler.jsonc` içinde sürümlenir. `ADMIN_PASSWORD_HASH` ve `SESSION_SECRET` Cloudflare secret olarak ayrı ayrı yüklenmiştir. Bunlar GitHub'a gönderilmez.

## Yerel çalışma

Node.js 22.12+:

```sh
npm ci
npm run types
npm run db:local
npm run dev
```

Site ve admin: http://localhost:8787. `npm run dev` ilk build sonrası yerel Worker başlatır. Astro sayfası değiştiğinde başka terminalde `npm run build` çalıştırın; Worker asset değişikliğini algılar. Worker kaynak değişiklikleri otomatik yüklenir. Yerel D1/R2 canlı veriyi kullanmaz.

Yerel yönetim için `.dev.vars.staging` dosyasına iki secret gerekir. Güvenli bir dış klasörde yeni anahtarlar üretmek için `node scripts/create-admin-secrets.mjs /private/tmp/esadas-new-secrets` kullanın. Komut hedef dosyalar varsa üzerine yazmaz. Oluşan JSON'u `wrangler secret bulk ... --env staging` ile göndermek mevcut ortamın yönetici parolasını değiştirir ve oturumları geçersiz kılar; bunu sadece bilinçli parola yenilemede yapın.

## Admin

Her ortamın `/admin/` yolu ayrı parolaya sahiptir. İlk kurulum erişim dosyaları yerel `.local/admin/` klasörüne, Git dışında kaydedilir. Parolaları parola yöneticinize alın.

- **Görseller:** Sekiz görsel alanına JPEG, PNG veya WebP yükleyin. Alternatif metin dahil güncellemeler yeni deploy olmadan görünür. En fazla 8 MB; önerilen boyut 1600px civarı, sıkıştırılmış WebP. Kendi fotoğraflarınızı kullanın.
- **İl/ilçe:** Bölge seçin, açıklama, yerel bilgiler ve kanıt URL'si ekleyin. Yayın kontrolü yetersiz içeriği reddeder. Taslaklar indekslenmez. Yayın koşulları ve sitemap otomatik yönetilir.
- **Teklifler:** Talepleri okuyun ve durumunu değiştirin. E-posta/WhatsApp bildirimi gönderilmez; panelden takip edilir. 90 gün sonra otomatik silinir.
- **Otomasyon:** Günlük denetim sonuçlarını inceleyin.

## Kontroller

```sh
npm run check
npm test
npm run build
npx wrangler deploy --dry-run --env staging
node scripts/integration-local.mjs /path/to/private/staging-admin.txt
```

Entegrasyon testi yalnızca localhost:8787 üzerinde test kayıtları oluşturur. Canlı veritabanına çalışmaz. Birim testleri coğrafi bütünlük, yayın kontrolü, form doğrulama, oturum ve dosya güvenliğini kapsar.

## Alan adı bağlantısı

Production, `esadasnakliyat.com.tr/*` ve `www.esadasnakliyat.com.tr/*` Worker route’ları üzerinden çalışır. DNS ve e-posta kayıtları değiştirilmez; mevcut hosting kaynakları korunur. www ve HTTP istekleri HTTPS ana adrese 308 ile yönlendirilir. Worker, D1 ve R2 hesabı `7b3ba6e92f9637e04a00500d703f1b91` olarak sabittir.

Production API token’ına ayrıca Zone → Zone → Read ve Zone → Workers Routes → Edit yetkileri, yalnızca `esadasnakliyat.com.tr` bölgesi için verilmelidir. Staging token’ında zone yetkisi gerekmez.

Ana alan adında ana sayfa ve hizmetler indekslemeye açıktır; taslak bölgesel sayfalar ve admin kapalıdır. Staging ve workers.dev adresleri indekslemeye kapalı kalır. Gerçek şirket görselleri ve doğrulanmış bölgesel içerikler admin panelinden güncellenir.

Geri dönüş: Cloudflare’de bu iki Worker route’unu kaldırmak mevcut DNS hedefindeki eski hosting’i yeniden devreye alır. Sonraki dağıtımın route’ları tekrar oluşturmaması için `production.routes` ayarı da geri alınmalıdır. Önce eski hosting’in çalıştığını doğrulayın.

Mimari: [docs/architecture.md](docs/architecture.md). Coğrafi veri: [docs/data-source.md](docs/data-source.md). Ortam adresleri: [deployment-urls.json](deployment-urls.json).

## Hizmet × bölge ağı

Altı hizmet × (81 il + 973 ilçe) = 6.324 hizmet-bölge sayfası otomatik üretilir. Genel bölge sayfaları korunur; toplam 7.394 HTML sayfası oluşur. Örnek: `/hizmetler/evden-eve-nakliyat/ankara/cankaya/`. Hizmet slug’ları `src/data/site.ts` kaynağından gelir; depolama slug’ı `esya-depolama` olarak kullanılır; eski `esya-depolama-2` adresleri 301 ile yönlendirilir.

Admin → İl/ilçe bölümünde hizmeti, ili ve ilçeyi seçin. Her URL için bağımsız içerik ve yayın durumu kaydedilir. Genel bölge içeriğinin yayınlanması altı hizmet sayfasını otomatik yayınlamaz. Doğrulanmış hizmet ve yerel açıklama, kanıt bağlantısı ve yayın durumu koşulları karşılandığında production sitemap’ine otomatik eklenir; taslağa dönüşte çıkar. Google’ın indekslemesi ve sıralaması garanti değildir.

Hizmet sayfaları il sayfalarına, il sayfaları ilçelerine, bölge sayfaları da ilgili altı hizmete bağlanır. Teklif bağlantısı seçilen hizmet ve bölgeyi forma taşır. Ankara dışındaki depolama sayfaları yerel depo iddiasında bulunmaz; Ankara bağlantılı taşıma ve saklama uygunluğu ayrıca doğrulanır.

Büyük varlık ağacında macOS yerel dosya izleyicisi sınırına ulaşılabilir. Entegrasyon doğrulaması için gerekli sayfaların geçici bir alt kümesi `wrangler dev --assets <geçici-klasör>` ile kullanılabilir; CI ve üretim derlemesi tüm sayfaları içerir.
