export const site = {
  name: 'Esadaş Nakliyat',
  url: 'https://esadasnakliyat.com.tr',
  phone: '+90 534 670 74 69',
  tel: '+905346707469',
  whatsapp: '905346707469',
  email: 'info@esadasnakliyat.com.tr',
  address: 'İlk Adım Mah. Dikmen Cad. Atayolu Sok. 34/B, Ankara',
  storageUrl: 'https://esadasankaraesyadepolama.com/',
};
export const services = [
  {
    slug: 'evden-eve-nakliyat',
    name: 'Evden eve nakliyat',
    label: 'Yeni bir başlangıç',
    image: 'moving',
    summary:
      'Eşyalarınızın paketlenmesinden yeni evinizdeki montajına kadar, taşınmanın her adımını birlikte planlayalım.',
    details:
      'Taşınma planını eşya miktarı, iki adresin kat durumu ve erişim koşullarına göre hazırlıyoruz. Paketleme, mobilya sökümü ve montaj gibi ihtiyaçları teklif aşamasında netleştiriyoruz.',
    questions: [
      [
        'Fiyat nasıl belirlenir?',
        'Eşya miktarı, mesafe, katlar, bina erişimi ve talep edilen ek işlemler değerlendirilir. Kesin kapsam ve ücret teklif sırasında belirlenir.',
      ],
      [
        'Taşınma öncesinde ne hazırlamalıyım?',
        'Taşınacak eşya listenizi ve bina bilgilerini paylaşın. Değerli kişisel eşyalarınızı ve günlük ihtiyaçlarınızı ayrı hazırlayın.',
      ],
    ],
  },
  {
    slug: 'asansorlu-evden-eve-nakliyat',
    name: 'Asansörlü taşımacılık',
    label: 'Her kata bir çözüm',
    image: 'lift',
    summary:
      'Bina ve sokak koşullarına göre değerlendirilen dış cephe asansörüyle daha düzenli bir taşıma süreci.',
    details:
      'Asansör kullanımı her binada mümkün olmayabilir. Cephe erişimi, araç konumu, kat ve çevre koşulları önceden değerlendirilir. Uygun yöntem teklifin bir parçası olarak belirlenir.',
    questions: [
      [
        'Her binada asansör kullanılabilir mi?',
        'Hayır. Bina cephesi, sokak genişliği, elektrik hatları ve araç yerleşimi değerlendirilmelidir.',
      ],
      [
        'Asansör ücreti dahil mi?',
        'Asansör ihtiyacı ve ücreti teklif kapsamına açıkça yazılmalıdır. Teklif alırken iki adresin kat bilgisini paylaşın.',
      ],
    ],
  },
  {
    slug: 'sehirler-arasi-nakliyat',
    name: 'Şehirler arası nakliyat',
    label: 'Yolun sonunda eviniz var',
    image: 'intercity',
    summary:
      'Ankara çıkışlı veya varışlı taşınmalarda güzergâh, eşya hacmi ve teslimat planını önceden netleştirin.',
    details:
      'Şehirler arası taşınmada çıkış ve varış adresleri, teslimat zamanı, araç planı ve hizmet kapsamı birlikte değerlendirilir. Bölgesel sayfalarımızdan ilgili il ve ilçe için talep oluşturabilirsiniz.',
    questions: [
      [
        'Teslimat süresi ne kadar?',
        'Güzergâh, yükleme planı ve teslimat koşullarına göre değişir. Size özel zaman aralığı teklif sırasında bildirilir.',
      ],
      [
        'Her ile taşıma yapılıyor mu?',
        'Talep ettiğiniz güzergâhı bize iletin. Tarih, araç ve operasyon uygunluğu kontrol edilerek hizmet teyidi verilir.',
      ],
    ],
  },
  {
    slug: 'esya-depolama-2',
    name: 'Eşya depolama',
    label: 'Eşyalarınıza yer açın',
    image: 'storage',
    summary:
      'Taşınma, tadilat veya alan ihtiyacında eşyalarınız için paketleme ve depolamayı birlikte planlayın.',
    details:
      'Depolanacak eşyanın miktarı, saklama süresi, paketleme ve teslim alma ihtiyaçları birlikte değerlendirilir. Oda seçenekleri, erişim koşulları ve güncel sözleşme kapsamını teklif aşamasında öğrenebilirsiniz.',
    questions: [
      [
        'Depolama fiyatı neye bağlı?',
        'Eşya hacmi, süre, paketleme ve taşıma ihtiyaçları fiyatı etkiler.',
      ],
      [
        'Eşyalarıma nasıl erişirim?',
        'Ziyaret, teslim alma ve erişim koşulları depo sözleşmesi kapsamında önceden netleştirilir.',
      ],
    ],
  },
  {
    slug: 'ofis-ve-buro-tasimaciligi',
    name: 'Ofis ve büro taşıma',
    label: 'İşinize kaldığınız yerden',
    image: 'office',
    summary:
      'Mobilya, ekipman ve arşivleri yeni çalışma alanınıza taşımak için koordineli bir plan.',
    details:
      'Çalışma alanınızın envanteri, paketleme ihtiyaçları ve yerleşim planı üzerinden ilerliyoruz. Çalışma saatleri ve bina erişimi taşıma programında birlikte ele alınır.',
    questions: [
      [
        'Hafta sonu taşıma mümkün mü?',
        'Talep edilen tarih ve ekip uygunluğuna göre değerlendirilir.',
      ],
      [
        'Bilgisayar ve arşivler nasıl hazırlanmalı?',
        'Kritik verilerinizi yedekleyin; cihaz ve kutuları bölüm bazında etiketleyin. Özel paketleme ihtiyaçlarını önceden bildirin.',
      ],
    ],
  },
  {
    slug: 'parca-esya-tasima',
    name: 'Parça eşya taşıma',
    label: 'Az eşya, net plan',
    image: 'partial',
    summary:
      'Birkaç mobilya veya sınırlı miktarda eşya için güzergâha ve hacme uygun taşıma talebi.',
    details:
      'Taşınacak parçaların ölçülerini, fotoğraflarını ve iki adresin erişim bilgilerini paylaşmanız planlamayı kolaylaştırır. Tarih ve araç uygunluğu teklif sırasında kontrol edilir.',
    questions: [
      [
        'Tek parça eşya taşıtabilir miyim?',
        'Eşyanın boyutu, güzergâh ve tarih uygunluğu değerlendirilerek teklif hazırlanabilir.',
      ],
      [
        'Paketleme gerekiyor mu?',
        'Eşyanın malzemesi ve hassasiyetine göre uygun koruma yöntemi belirlenir.',
      ],
    ],
  },
];
export const mediaSlots = [
  'hero',
  'moving',
  'lift',
  'intercity',
  'storage',
  'office',
  'partial',
  'team',
] as const;
export const basePaths = [
  '/',
  '/hizmetler/',
  ...services.map((s) => `/${s.slug}/`),
  '/hizmetler/bolgeler/',
  '/hakkimizda/',
  '/iletisim-2/',
  '/teklif/',
  '/rehber/',
  '/gizlilik/',
];
