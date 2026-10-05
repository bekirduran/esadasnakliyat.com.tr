# SEO/GEO iyileştirme ilerlemesi — 30 Eylül–5 Ekim 2026

Bu dosya, çalışma kesilirse devam edilecek noktayı kaydeder. Kaynaklar: `esadasnakliyat.com.tr-Performance-on-Search-2026-09-30.zip` ve `esadasnakliyat.com.tr-Coverage-2026-09-30.zip` Search Console dışa aktarımları (kullanıcının Downloads klasöründe). Performans dönemi 11–27 Eylül 2026; 3.178 gösterim, 26 tıklama. Coverage özeti 35 dizine eklenen, 34 eklenmeyen sayfa gösteriyor. Coverage ZIP içinde örnek URL listesi yok.

Çalışma dalı: `codex/seo-geo-improvements`. İlk beş adım `46405a5` commit'inde kayıtlıdır. Kullanıcının açık onayından sonra dal `https://github.com/bekirduran/esadasnakliyat.com.tr.git` deposuna ve ardından `dev` dalına push edildi.

PR #1 `dev` dalına, PR #3 `main` dalına birleştirildi. Production Worker yeni içerikle yanıt veriyor. Production CI dağıtım doğrulaması, eski Çankaya depolama URL'sinin hedefini `workers.dev` önizleme alanında `noindex` gördüğü için hata verdi; adım 11'deki test düzeltmesi bu yanlış alarmı gideriyor.

Canlıya alma işlemi başlangıçta ertelenmişti; daha sonra kullanıcı GitHub üzerinden `main` birleştirmesini yaptı. Bu dosyadaki önceki adımların "canlıya dağıtılmadı" notları o adımların yazıldığı andaki durumu gösterir.

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

## Tamamlanan adım 6: Eski hizmet-bölge depolama URL'leri

- `/hizmetler/esya-depolama-2/.../` ailesindeki geçerli eski URL'ler artık otomatik olarak `noindex` taslağa yönlenmiyor. Statik olarak indekslenebilir veya doğrulanmış yayın kaydı olan yerel hedef kullanılıyor; diğerleri `/esya-depolama/` sayfasına gidiyor.
- Eski ilçe evden eve URL'leriyle aynı iş kuralı tek yardımcı fonksiyonda toplandı. Sorgu parametreleri korunuyor. Çankaya taslak, Mamak statik ve yayınlanmış Çankaya kayıtları test edildi.
- Dağıtım smoke kontrolü hedefin canlıda indekslenebilir olduğunu sınayacak şekilde güncellendi. `npm test`: 18/18, `npm run check`: 0 hata/uyarı, Wrangler staging kuru çalıştırması başarılı. Canlıya dağıtılmadı.

## Tamamlanan adım 7: Search Console eski URL envanteri kontrolü

- Performans dışa aktarımındaki 36 sayfa URL'si mevcut Worker yönlendirme mantığı ve üretilmiş HTML ile yerel olarak eşleştirildi. Altı URL güncel ana/hizmet sayfası; 30 URL eski adres. Eski adreslerden 28'i indekslenebilir hedefe 301 gidiyor. Yalnızca `/galeri/` (24 gösterim, 1 tıklama) ve `/yetki-belgelerimiz/` (9 gösterim) için doğrulanmış yeni içerik bulunmadığından eşleme yapılmadı.
- Kontrol üretim veritabanında yayınlanmış ek bölgesel içerik yokmuş gibi yapıldı. Üretimde yayınlı yerel içerik varsa bazı eski adreslerin hedefi daha özel indekslenebilir sayfa olabilir. Canlı HTTP davranışı dağıtım yapılmadan doğrulanamaz.

## Tamamlanan adım 8: Yerel işletme adresi ve görsel yükü

- Google Maps bağlantısındaki Çankaya/Ankara adresine göre görünür adres ilçe adıyla tamamlandı. `MovingCompany` yapısal verisinde sokak, ilçe ve il ayrı alanlara yazıldı; sokak metni tek kaynakta tutuluyor.
- 13 Eylül denetiminde belirtilen 766 KiB logo yükü artık geçerli değil: mevcut PNG yaklaşık 30 KiB, başlık WebP görseli yaklaşık 1,8 KiB. Yeni bir görsel dönüşümü yapılmadı.
- İki üçüncü taraf işletme dizini ([Eveusta](https://eveusta.com/nakliyat-firmalari/cankaya/esadas-evden-eve-nakliyat/), [Servis Merkez Listesi](https://servismerkezilisteleri.com.tr/ankara/cankaya/nakliyat/esadas-evden-eve-nakliyat.html)) `0535 679 74 69` numarasını gösteriyor. Kullanıcı 5 Ekim'de kullanılacak doğru numarayı `+90 534 670 74 69` olarak doğruladı. Sitenin telefon, arama bağlantısı, WhatsApp ve `llms.txt` alanları zaten bu numarayı kullanıyor; kod değişikliği gerekmedi. Üçüncü taraf kayıtları ve Google İşletme Profili bu numarayla karşılaştırılmalı.
- Doğrulama: `npm run check` 0 hata/uyarı; `npm run build` 7.394 sayfa; `python3 scripts/audit-seo.py` 0 bulgu. Üretilen ana sayfa JSON-LD adres alanları ayrıca ayrıştırılarak kontrol edildi. Üretime dağıtılmadı.

## Tamamlanan adım 9: İletişim hatlarının doğrulanması

- Kullanıcı `+90 535 679 74 69` numarasının ikincil hat, `0312 481 98 39` numarasının aktif sabit hat olarak ayrıca gösterilmesini doğruladı. Ana hat ve WhatsApp `+90 534 670 74 69` olarak kaldı.
- İletişim sayfası, site alt bilgisi, `MovingCompany` telefon listesi, hizmet JSON kataloğu ve `llms.txt` bu üç rolü yansıtıyor. Eski üçüncü taraf dizinlerinde görülen `0535` numarası artık doğrulanmış ikincil hat; tek başına yanlış kayıt sayılmıyor.
- `npm test`: 18/18, `npm run check`: 0 hata/uyarı, `npm run build`: 7.394 sayfa, `python3 scripts/audit-seo.py`: 0 bulgu. Üretilen iletişim HTML'indeki üç `tel:` bağlantısı ve JSON-LD telefonları ile Worker hizmet kataloğundaki üç telefon alanı ayrıca kontrol edildi. Canlıya dağıtılmadı.

## Tamamlanan adım 10: Alt bilgi tasarım bağlantısı

- Kullanıcının isteğiyle telif satırına `Tasarım: BT Masasi` bağlantısı eklendi; hedef `https://btmasasi.com/`. Bağlantı yeni sekmede güvenli dış bağlantı olarak açılıyor. Alt bilgi bağlantısının telif metniyle aynı satırda kalması için küçük bir stil kuralı eklendi.
- `npm run check` 0 hata/uyarı ve `npm run build` 7.394 sayfa başarılı. Üretilen ana sayfa HTML'inde bağlantı hedefi ve yeni sekme nitelikleri doğrulandı. Dış hedefin ağ erişimi bu ortamda doğrulanamadı.

## Tamamlanan adım 11: Production smoke testindeki yanlış noindex hatası

- Eski Çankaya depolama URL'sinin hedefi canlı ana alan adında `index,follow`; `workers.dev` önizleme alanı ise bilinçli olarak `noindex`. Smoke testi hedefin önizleme kopyasını kontrol ettiği için dağıtım doğrulaması yanlış alarm verdi.
- Smoke testi 301 hedefinin yolunu koruyup indekslemeyi kanonik üretim alan adında kontrol edecek şekilde düzeltildi. Yalnızca başlık/durum için kullanılan HTTP yanıtlarının gövdeleri de serbest bırakıldı; böylece başarılı test süreci açık kalmıyor.
- Düzeltme sonrası `node scripts/smoke-deployment.mjs production` ve `... staging` canlı ortamlarda `0` çıkış koduyla geçti. `npm test`: 18/18; JavaScript sözdizimi ve biçimlendirme kontrolü başarılı. Bu değişiklik Worker davranışını değiştirmiyor, yalnızca dağıtım kontrolünü düzeltiyor.

## Sıradaki işler

1. Düzeltilmiş production CI kontrolünün GitHub'da geçtiğini doğrula; ardından Search Console'da yeni sitemap, eski URL yönlendirmeleri ve URL denetimini izle.
2. Depolama sitesindeki yer tutucu telefon numarasını doğrulanan `+90 534 670 74 69` ile düzelt. Bu depo sitesinin kodu bu çalışma alanında değildir.
3. Google İşletme Profili ve üçüncü taraf dizinlerdeki numaraların doğrulanmış üç hattan biri olduğunu kontrol et; yanlış kayıtları düzelt. Yetki belgeleri doğrulanmadan belge iddiası ekleme.

## Bilinçli olarak açık kalan eski URL'ler

Kullanıcı 5 Ekim'de `/galeri/` ve `/yetki-belgelerimiz/` sayfalarının şimdilik eklenmemesini istedi. Bu adresler 404 olarak kalacak; ilgisiz bir sayfaya yönlendirilmeyecek ve sitemap'e alınmayacak. Yeniden ele alınmaları için kullanıcıdan açık istek ve doğrulanmış içerik beklenmeli. Eski URL envanterinin tamamı için backlink ve Search Console URL örnekleri ayrıca incelenmeli.
