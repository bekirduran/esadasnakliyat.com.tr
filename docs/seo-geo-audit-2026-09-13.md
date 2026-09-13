# SEO / GEO denetimi — 13 Eylül 2026

## Kapsam ve yöntem

Üretilen 1.070 HTML dosyası scripts/audit-seo.py ile tarandı: başlık benzersizliği, tek H1, meta açıklaması, canonical URL, JSON-LD ayrıştırılması, görsel alt nitelikleri ve yerel bağlantı hedefleri. Canlı sitemap içindeki 12 URL, robots.txt, hizmet JSON kataloğu, eksik URL ve Ankara bölge örneği kontrol edildi. Tüm 1.054 bölgesel URL canlıdan istenmedi; statik dosyaları topluca, dinamik yayın mekanizması örnek üzerinden kontrol edildi. Bu çalışma Search Console sıralama/veri analizi veya Core Web Vitals ölçümü değildir.

## Düzeltilenler

- İletişim sayfası /iletisim/ adresine taşındı. /iletisim-2/ 301 ile yeni adrese yönlenir; sorgu parametreleri korunur. Menü, hakkımızda bağlantısı, sitemap ve canonical aynı yeni URL’yi kullanır.
- /404/ doğrudan istendiğinde 200 dönüyordu. Artık 404 ve noindex döner; hatalı sayfanın indekslenmesi önlenir.
- Open Graph görseli temsili SVG yerine resmî PNG logo oldu. Site adı ve görsel açıklaması eklendi. Bu, paylaşım uyumluluğu iyileştirmesidir; sıralama vaadi değildir.
- Kullanıcının onayladığı Google Maps bağlantısı ortak firma verisine taşındı, MovingCompany hasMap alanına eklendi. Görünür bağlantı ve makinece okunabilir bilgi aynı kaynağı kullanır.
- Statik SEO taraması CI doğrulamasına eklendi. Canlı kontroller iletişim 301’i, yeni sitemap adresi ve 404 durumunu kapsayacak şekilde genişletildi.

## Doğrulanan mevcut davranışlar

- Sitemap’teki canlı sayfalar 200 yanıtlı ve kendilerine canonical veriyor.
- Eksik URL 404 döndürüyor; admin ve taslak bölgesel içerikler noindex.
- Staging ve workers.dev adresleri indekslemeye kapalı.
- HTTPS / www canonical yönlendirmesi mevcut.
- 1.070 dosyalık taramada yinelenen title, eksik H1/meta/canonical/alt veya kırık iç bağlantı bulunmadı. Bu sonuç içeriklerin anlamsal kalitesine ya da Google zengin sonuç uygunluğuna dair sertifika değildir.

## Kalan riskler ve sonraki işler

1. **Gerçek içerik:** Temsili görseller halen kullanılıyor. Firma araçları, ekibi ve izinli hizmet fotoğraflarıyla değiştirilmeli. Yerel referanslar kullanıcı tarafından doğrulanmalı; otomatik uydurulmamalı. Taslak bölge sayfalarının noindex kalması bilinçli kalite korumasıdır.
2. **Cloudflare bot politikası:** Canlı robots.txt Cloudflare Managed Content ekliyor; GPTBot, ClaudeBot, Google-Extended ve bazı diğer botlara Disallow var. Googlebot için genel arama erişimi açık. Eğitim botunu engellemek tüm AI arama görünürlüğünü engellemekle aynı değildir. Google AI özellikleri için Googlebot ve indekslenebilirlik önemlidir. WAF/AI Crawl Control kurallarının gerçek bot günlükleri bu denetimde okunmadı; uygulama düzeyindeki robots.txt değişikliği Cloudflare politikasını tek başına değiştirmez. Koruma topluca kapatılmadı.
3. **Ölçüm:** Search Console URL Denetimi, sitemap gönderimi, kapsam ve arama sorguları bu oturumda erişilebilir değildi. Yeni /iletisim/ için yeniden tarama istenmeli; eski URL yönlendirmesi korunmalı. Google Business Profile ad/adres/telefon bilgileri firma tarafından doğrulanmalı.
4. **Görsel boyutu:** Resmî PNG yaklaşık 766 KiB; favicon ve header aynı orijinali kullanıyor. Marka görselini değiştirmeden standart küçük boyut türevleri üretmek ileride aktarımı azaltabilir. Bu turda görsel dosyası değiştirilmedi.
5. **Eski URL envanteri:** Mevcut bilinen yönlendirmeler korundu. Eski sitenin tüm backlink/Search Console URL envanteri elimizde olmadığı için tüm tarihsel URL’lerin kapsandığı iddia edilemez.
6. **Depolama URL’si:** /esya-depolama-2/ çalışır ve canonical tutarlıdır. Sondaki -2 tek başına teknik SEO hatası değildir; bu turda gereksiz ikinci URL geçişi yapılmadı.

## Kaynaklar

- https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/appearance/ai-features

Google AI özellikleri için ayrı bir AI dosyası veya özel schema zorunlu değildir. Erişilebilir, indekslenebilir, yararlı ve doğrulanmış içerik temel gereksinimdir; teknik uygunluk sıralama veya indekslenme garantisi vermez.
