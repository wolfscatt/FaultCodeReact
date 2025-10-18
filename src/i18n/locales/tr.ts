/**
 * Turkish translations
 */

export default {
  common: {
    appName: 'FaultCode',
    search: 'Ara',
    cancel: 'İptal',
    close: 'Kapat',
    reset: 'Sıfırla',
    save: 'Kaydet',
    delete: 'Sil',
    edit: 'Düzenle',
    back: 'Geri',
    next: 'İleri',
    done: 'Tamam',
    loading: 'Yükleniyor...',
    error: 'Hata',
    retry: 'Tekrar Dene',
    ok: 'Tamam',
  },

  search: {
    title: 'Arıza Kodu Ara',
    placeholder: 'Arıza kodu veya anahtar kelime girin...',
    brandFilter: 'Markaya göre filtrele',
    allBrands: 'Tüm Markalar',
    noResults: 'Arıza kodu bulunamadı',
    noResultsDesc: 'Arama veya filtreleri ayarlamayı deneyin',
    searching: 'Aranıyor...',
    resultsCount: '{{count}} sonuç',
    resultsCount_plural: '{{count}} sonuç',
  },

  fault: {
    title: 'Arıza Detayları',
    code: 'Kod',
    severity: 'Önem Derecesi',
    summary: 'Özet',
    causes: 'Olası Nedenler',
    safetyNotice: 'Güvenlik Uyarısı',
    resolutionSteps: 'Çözüm Adımları',
    step: 'Adım {{number}}',
    estimatedTime: '~{{minutes}} dk',
    requiresPro: 'Profesyonel gerekli',
    tools: 'Gerekli aletler',
    imageComingSoon: '(Görsel yakında)',
    lastVerified: 'Son doğrulama: {{date}}',
    severity_info: 'Bilgi',
    severity_warning: 'Uyarı',
    severity_critical: 'Kritik',
  },

  paywall: {
    // Titles
    title: 'Pro Sürüme Geçin',
    quota_exceeded_title: 'Aylık Limite Ulaşıldı',
    favorites_locked_title: 'Favoriler Sadece Premium İçin',
    premium_title: 'Premium\'a Geçin',

    // Messages
    quota_exceeded_message: 'Bu ay 10 arıza detayı görüntüleme limitinize ulaştınız. Sınırsız erişim için Pro sürüme geçin.',
    favorites_locked_message: 'Favori arıza kodlarınızı hızlı erişim için kaydedin. Pro planla kullanılabilir.',
    premium_message: 'Tüm özelliklerin kilidini açın ve arıza kodlarına sınırsız erişim kazanın.',

    // Features
    feature_unlimited: 'Sınırsız arıza detayı',
    feature_favorites: 'Favorilere kaydet',
    feature_advanced_search: 'Gelişmiş arama',
    feature_priority_support: 'Öncelikli destek',
    feature_offline: 'Çevrimdışı erişim',
    feature_images: 'Görsel rehberler',

    // Comparison table
    feature: 'Özellik',
    free: 'Ücretsiz',
    pro: 'Pro',
    fault_details: 'Arıza Detayları',
    limit_10: '10/ay',
    unlimited: 'Sınırsız',
    favorites: 'Favoriler',
    support: 'Destek',
    basic: 'Temel',
    priority: 'Öncelikli',

    // Buttons
    upgrade_button: 'Pro Sürüme Geç',
    cancel: 'Belki Sonra',
    login_required: 'Giriş Gerekli',
    login_message: 'Pro plana geçmek için lütfen giriş yapın',
    login_button: 'Giriş Yap',

    // Legacy translations (keep for backwards compatibility)
    limitReached: 'Aylık Limite Ulaşıldı',
    limitReachedDesc: 'Aylık {{limit}} arıza kodu görüntüleme limitinize ulaştınız.',
    freePlan: 'Ücretsiz Plan',
    proPlan: 'Pro Plan',
    freeFeatures: [
      'Ayda 10 arıza kodu',
      'Temel arama',
      'Topluluk desteği',
    ],
    proFeatures: [
      'Sınırsız arıza kodu',
      'Favorilere kaydet',
      'Gelişmiş arama',
      'Öncelikli destek',
      'Çevrimdışı erişim',
      'Görsel rehberler',
    ],
    subscribe: 'Pro Aboneliği Al',
    mockNotice: '(Deneme aboneliği - ücret alınmayacak)',
    remainingThisMonth: 'Bu ay kalan: {{remaining}}/{{limit}}',
    unlimitedAccess: 'Sınırsız erişim',
  },

  favorites: {
    title: 'Favoriler',
    empty_title: 'Henüz Favori Yok',
    empty_message: 'Daha sonra hızlı erişim için yararlı bulduğunuz arıza kodlarını kaydedin.',
    saved: 'kayıtlı',
    remove_title: 'Favoriyi Kaldır',
    remove_message: 'Bu favorinizden kaldırmak istediğinizden emin misiniz?',
    remove: 'Kaldır',
    view: 'Detayları Görüntüle',
    add_success: 'Favorilere eklendi',
    remove_success: 'Favorilerden kaldırıldı',
    error: 'Favoriler güncellenemedi',
    login_required: 'Giriş Gerekli',
    login_message: 'Favorileri kaydetmek için lütfen giriş yapın',
  },

  navigation: {
    home: 'Ana Sayfa',
    search: 'Ara',
    bookmarks: 'Yer İmleri',
    favorites: 'Favoriler',
    settings: 'Ayarlar',
  },

  settings: {
    title: 'Ayarlar',
    language: 'Dil',
    theme: 'Tema',
    lightMode: 'Açık Mod',
    darkMode: 'Koyu Mod',
    analytics: 'Analitik',
    analyticsDesc: 'Anonim kullanım verilerini paylaşarak uygulamayı geliştirmemize yardımcı olun',
    subscription: 'Abonelik',
    currentPlan: 'Mevcut Plan',
    managePlan: 'Planı Yönet',
    appInformation: 'Uygulama Bilgileri',
    about: 'Hakkımızda',
    contactUs: 'Bize Ulaşın',
  },

  about: {
    title: 'FaultCode Hakkında',
    developer: 'Geliştirici',
    developerName: 'Ömer Faruk BİNGÖL',
    partnerCompany: 'Partner Şirket',
    companyName: 'Çamlıca Teknik Servis',
    description: 'Kapsamlı veritabanı ve uzman çözümlerle profesyonel kombi arıza kodu asistanı.',
    version: 'Sürüm',
    versionNumber: '0.1.0',
  },

  contactUs: {
    title: 'Bize Ulaşın',
    subtitle: 'Görüşlerinizi duymak isteriz',
    name: 'İsim',
    surname: 'Soyisim',
    email: 'E-posta',
    feedback: 'Geri Bildirim',
    feedbackPlaceholder: 'Düşüncelerinizi paylaşın...',
    sendFeedback: 'Geri Bildirim Gönder',
    sending: 'Gönderiliyor...',
    successTitle: 'Teşekkürler!',
    successMessage: 'Geri bildiriminiz alınmıştır. Teşekkür ederiz!',
    errorTitle: 'Hata',
    errorMessage: 'Geri bildirim gönderilemedi. Lütfen tekrar deneyin.',
    validation: {
      nameRequired: 'İsim gerekli',
      surnameRequired: 'Soyisim gerekli',
      emailRequired: 'E-posta gerekli',
      emailInvalid: 'Lütfen geçerli bir e-posta adresi girin',
      feedbackRequired: 'Geri bildirim gerekli',
      feedbackMinLength: 'Geri bildirim en az 10 karakter olmalı',
    },
  },

  errors: {
    generic: 'Bir şeyler yanlış gitti',
    network: 'Ağ hatası. Lütfen bağlantınızı kontrol edin.',
    notFound: 'Bulunamadı',
    loadFailed: 'Veri yüklenemedi',
  },
};

