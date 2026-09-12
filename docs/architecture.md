# Esadaş mimarisi

Astro statik HTML üretir. Workers Static Assets sunar. Worker, D1'deki onaylı bölge içeriklerini ve gerçek görsel alt metinlerini HTMLRewriter ile sunucuda işler. Kullanıcı ve arama/AI botları aynı HTML'i alır. JavaScript olmadan hizmet ve bölge içerikleri okunabilir.

## Bölgesel içerik ağı

- Hizmet merkezi → hizmet detayları → bölge merkezi → 81 il → 973 ilçe.
- Her il kendi ilçelerine, her ilçe üst iline ve ilgili hizmetlere bağlanır. Kardeş ilçe bağlantıları sınırlıdır.
- Başlangıçta 1.054 bölge sayfası kullanıcıya açık, `noindex,follow` ve sitemap dışındadır. İl listesi indekslenebilir.
- Admin hizmet uygunluğunu teyit eder, 100+ kelimelik açıklama, 50+ kelimelik yerel bilgi ve HTTPS kanıt URL'si girer. Bunlar temel tamamlanma eşikleridir; sıralama veya özgünlük garantisi değildir.
- Aynı normalize edilmiş metnin birebir tekrar yayını engellenir. Yakın kopyaları ve kanıtın gerçekliğini editör incelemelidir.
- Onaylanan içerik deploy gerektirmeden HTML'e, title/description'a ve production sitemap'e yansır. Draft'a dönüşte index işareti ve sitemap kaydı kaldırılır.
- Günlük cron yayın koşullarını denetler, geçersiz kayıtları taslağa çeker ve denetim kaydı oluşturur. İdari veri değişiklikleri sürümlü ve kontrollü güncellenir.
- Otomasyon şehir adı değiştirerek yüzlerce yayın, sahte yerel ofis, referans veya fiyat üretmez.

## Yönetim ve veri

Parola PBKDF2-SHA256 ile hashlenir; 100.000 iterasyon. Oturum HS256 imzalı, 8 saatlik, HttpOnly/Secure/SameSite=Strict çerezdir. Ortamlar farklı anahtarlarla ayrılır. Giriş IP başına 15 dakikada 5 deneme; teklifler saatte 5 istekle sınırlıdır. Değiştirici API istekleri aynı Origin gerektirir. Secret eksikse giriş kapalıdır.

R2 yalnızca doğrulanmış JPEG/PNG/WebP imzası olan en fazla 8 MB yüklemeleri kabul eder. Dosya isimlerini sunucu üretir. Görsellerin hakları ve içerikleri editör tarafından doğrulanmalıdır. Önceki nesneler geri kazanım için tutulur; admin yalnızca güncel slot işaretçisini değiştirir. Uzun vadede arşiv yaşam döngüsü belirlenmelidir.

Teklifler D1'e kaydedilir; harici mesaj/e-posta gönderilmez. Admin son 200 kaydı görür ve durum günceller. 90 günlük otomatik saklama süresi cron ile uygulanır. Production alan adı geçişinden önce KVKK metnindeki resmi şirket detayları tamamlanmalıdır.

## SEO ve geçiş

Canonical production alan adıdır. Staging ve workers.dev adresleri header + meta ile noindex'tir; robots taramayı kapatır, sitemap boştur. Production özel alan adı aktif olduğunda temel sayfalar indekslenebilir; bölgesel sayfalar kalite kapısından geçer. Admin ve teklif/gizlilik sayfaları indeks dışıdır.

Eski URL eşlemeleri Worker içinde tek adımlı 301'dir. Bilinmeyen sayfa gerçek 404 döner. Geçişten önce eski sitenin tam URL/medya envanteri, Search Console kayıtları, belge ve blog içerikleri alınmalıdır; mevcut eşleme tam site göçü değildir. Alan adı bağlanmadan önce eski hostingin yedeği, DNS/MX kayıtları ve geri dönüş planı hazırlanmalıdır.

Kaynaklar: https://developers.google.com/search/docs/appearance/ai-features · https://developers.google.com/search/docs/essentials/spam-policies · https://developers.cloudflare.com/workers/static-assets/
