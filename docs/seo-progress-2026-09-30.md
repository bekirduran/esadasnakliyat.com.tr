# SEO/GEO iyileştirme ilerlemesi — 30 Eylül 2026

Bu dosya, çalışma kesilirse devam edilecek noktayı kaydeder. Kaynaklar: `esadasnakliyat.com.tr-Performance-on-Search-2026-09-30.zip` ve `esadasnakliyat.com.tr-Coverage-2026-09-30.zip` Search Console dışa aktarımları (kullanıcının Downloads klasöründe). Performans dönemi 11–27 Eylül 2026; 3.178 gösterim, 26 tıklama. Coverage özeti 35 dizine eklenen, 34 eklenmeyen sayfa gösteriyor. Coverage ZIP içinde örnek URL listesi yok.

Çalışma dalı: `codex/seo-geo-improvements`. İlk beş adım `46405a5` commit'inde yerel olarak kayıtlıdır. İlk uzak push denemesi otomatik onay incelemesi tarafından reddedildi; kullanıcı daha sonra `https://github.com/bekirduran/esadasnakliyat.com.tr.git` deposundaki bu dalın push edilmesini açıkça onayladı. Staging dağıtımı `CLOUDFLARE_API_TOKEN` bulunmadığı için yapılmadı. Kuru çalıştırma başarılıdır; canlı ortam henüz değişmedi.

## Tamamlanan adım 1: Eski URL yönlendirmeleri

- Search Console'da performansı görülen ve canlıda 404 dönen eski depolama, parça eşya ve hizmet listesi URL'lerine içerik niyetine uygun 301 eşlemeleri eklendi.
- Ankara–İstanbul eski URL'si indekslenmeyen İstanbul taslağı yerine mevcut şehirler arası hizmet sayfasına yönlendirildi. Kurumsal nakliye, hakkımızda yerine ofis taşıma hizmetine eşlendi.
- Eski Ankara ilçe evden eve nakliyat URL'leri artık yalnızca doğrulanmış, yayınlanmış ilçe hizmet sayfasına gider; bu yoksa indekslenebilir genel evden eve hizmet sayfasına gider. Sorgu parametreleri korunur.
- `npm test`: 17/17 başarılı. `npm run check`: 0 hata/uyarı.
- Bu değişiklikler yerel dosyalara kaydedildi; canlıya dağıtılmadı.

## Tamamlanan adım 2: Çankaya evden eve nakliyat hedef sayfası

- `/hizmetler/evden-eve-nakliyat/ankara/cankaya/` için ayrı, taşınma planlamasına odaklı içerik yazıldı. Doğrulanmamış şube, depo ve sigorta iddiası eklenmedi.
- Sayfa `index,follow` olarak üretildi ve statik sitemap listesine alındı. Eski `/cankaya-evden-eve-nakliyat/` artık doğrudan bu sayfaya 301 döner.
- Diğer eski Ankara ilçe URL'leri için doğrulanmış yayın yoksa indekslenebilir genel evden eve sayfası hedef olmaya devam eder.
- `npm test`: 17/17; `npm run check`: 0 hata/uyarı; `npm run build`: 7.394 sayfa; `python3 scripts/audit-seo.py`: 0 bulgu.
- Yerel dosyalara kaydedildi; üretime dağıtılmadı.

## Tamamlanan adım 3: Arama sonucu başlıkları ve hizmet içeriği

- Ana hizmet sayfalarının Ankara evden eve ve Ankara eşya depolama başlık/meta açıklamaları Search Console'da görülen ticari sorgulara göre netleştirildi.
- Depolama teklifinin kapsamı ve taşınma hazırlığı hakkında doğrulanabilir, kullanıcıya yararlı açıklamalar eklendi. Çankaya hedef sayfasına ana evden eve sayfasından bağlantı verildi.
- Bu düzenlemeler sıralama veya tıklama artışı garantisi değildir; yayından sonra aynı sorgu/sayfa grupları karşılaştırılmalı.

## Tamamlanan adım 4: Taslak bölge bağlantıları

- Altı ana hizmet sayfasında, her biri 81 adet `noindex` hizmet-il sayfasına giden toplu bağlantılar kaldırıldı. İndekslenebilir Ankara rehberi ve bölge dizini üzerinden il/ilçe seçimi ve teklif akışı sürüyor.
- Bölge dizinindeki kullanıcı navigasyonu ve taslak sayfa üretimi bu adımda değiştirilmedi; CMS'de doğrulanmış bölge içeriği yayınlanabilmesi korunuyor.
- Adım 3–4 sonrası `npm test`: 17/17; `npm run check`: 0 hata/uyarı; `npm run build`: 7.394 sayfa; `python3 scripts/audit-seo.py`: 0 bulgu.
- Son diff incelemesinde semt adlarının ilçe verisinde bulunmadığı görüldü. Batıkent, Çayyolu, Dikmen ve Ümitköy eski URL'leri için ayrıca indekslenebilir genel hizmet hedefine 301 eklendi.

## Tamamlanan adım 5: Doğrulanmış depo bölgeleri ve Mamak hedef sayfası

- Kullanıcı aktif depo bölgelerini Mamak, Eryaman ve Küçük Kayaş olarak doğruladı ve kaynak olarak `https://esadasankaraesyadepolama.com/depolar` adresini verdi. Sayfa ve Mamak tesis ayrıntısı tarayıcıda incelendi.
- Ankara eşya depolama sayfasında bu üç bölge görünür hâle getirildi ve aynı firmanın tesis sayfasına bağlandı.
- `/hizmetler/esya-depolama/ankara/mamak/` için Mamak'a özgü içerik, tesis ayrıntısına bağlantı, indeksleme ve sitemap kaydı eklendi. Eski `/mamak-esya-depolama/` adresi bu sayfaya 301 yönlendirilir.
- İddialar kaynak sayfayla sınırlı tutuldu. Mamak tesis ayrıntı sayfasında görünen `+90 532 000 00 00` telefon numarası yer tutucu göründüğünden buraya aktarılmadı; depo sitesinde ayrıca düzeltilmesi gerekiyor. Mamak adresi kaynak sayfanın görünür metninde ayrıntılı verilmediği için bu sitede de açık adres yazılmadı.
- Yeni depo içerikleri için test ve canlı smoke kontrolü eklendi. Yerel dosyalara kaydedildi; üretime dağıtılmadı.
- Son doğrulama: `npm test` 17/17; `npm run check` 0 hata/uyarı; `npm run build` 7.394 sayfa; `python3 scripts/audit-seo.py` 0 bulgu; `npx wrangler deploy --dry-run --env staging` başarılı. Üretilmiş Çankaya evden eve ve Mamak depolama HTML'lerinde `index,follow` ve kendine canonical doğrulandı; taslak Çankaya depolama `noindex,follow` kaldı.

## Sıradaki işler

1. `codex/seo-geo-improvements` dalını kullanıcının açıkça onayladığı GitHub remote'una gönder ve sonucu kaydet.
2. Staging/üretim dağıtımı için Cloudflare API token'ı veya yetkili CI akışı sağlanmalı. Dağıtımdan sonra canlı eski URL, robots, canonical ve sitemap kontrollerini yap. Search Console'da yeni sitemap ve URL denetimini izle.
3. Depolama sitesindeki yer tutucu telefon numarasını düzelt. Bu depo sitesinin kodu bu çalışma alanında değildir.
4. Yetki belgeleri ve Google Business Profile bilgileri doğrulanmadan bunlara ilişkin yeni iddialar ekleme.

## Bilinçli olarak açık kalan eski URL'ler

`/galeri/` için yeni gerçek galeri içeriği, `/yetki-belgelerimiz/` için doğrulanmış belgeler yok. Bunlar alakasız bir sayfaya yönlendirilmedi. Bu adreslerin içerikleri temin edilirse uygun sayfalar oluşturulmalı. Eski URL envanterinin tamamı için backlink ve Search Console URL örnekleri ayrıca incelenmeli.
