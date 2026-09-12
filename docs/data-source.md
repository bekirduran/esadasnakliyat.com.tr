# Coğrafi veri

Kaynak: https://api.turkiyeapi.dev/v1/provinces
Dokümantasyon: https://docs.turkiyeapi.dev/en/v1/guide/welcome
Proje: https://github.com/ubeydeozdmr/turkiye-api

81 il ve 973 ilçe içeren anlık görüntü `src/data/geography.json` dosyasındadır. Bunlar idari bölgelerdir; firmanın şube, depo veya kesin hizmet noktası beyanı değildir.

TurkiyeAPI kendisini MIT lisanslı açık kaynak proje olarak tanımlar. Kaynak veri güncellemelerinde lisans ve idari kapsam yeniden kontrol edilmelidir. Veri, canlı sayfa isteği sırasında üçüncü taraftan alınmaz. `npm run geo:sync` doğrulama sonrası sürümlü dosyayı günceller. İl sayısı 81 değilse, ilçe sayısı 900'ün altındaysa veya çakışan URL varsa güncelleme durur.

Merkez ilçeleri kaynak sınıflandırmasına göre dahil edilmiştir. SEO ağı bu snapshot'ın il/ilçe ilişkilerinden üretilir; yeni sayfalar varsayılan olarak noindex'tir.
