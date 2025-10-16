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
    title: 'Pro Sürüme Geçin',
    limitReached: 'Günlük Limite Ulaşıldı',
    limitReachedDesc: 'Günlük {{limit}} arıza kodu görüntüleme limitinize ulaştınız.',
    freePlan: 'Ücretsiz Plan',
    proPlan: 'Pro Plan',
    freeFeatures: [
      'Günde {{limit}} arıza kodu',
      'Temel arama',
      'Çözüm adımları',
      'Güvenlik uyarıları',
    ],
    proFeatures: [
      'Sınırsız arıza kodu',
      'Gelişmiş arama filtreleri',
      'Çevrimdışı erişim',
      'Öncelikli destek',
      'Reklamsız deneyim',
      'Favorilere ekle',
    ],
    subscribe: 'Pro Aboneliği Al',
    mockNotice: '(Deneme aboneliği - ücret alınmayacak)',
    remainingToday: 'Bugün kalan: {{remaining}}/{{limit}}',
    unlimitedAccess: 'Sınırsız erişim',
  },

  navigation: {
    home: 'Ana Sayfa',
    search: 'Ara',
    bookmarks: 'Yer İmleri',
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
  },

  errors: {
    generic: 'Bir şeyler yanlış gitti',
    network: 'Ağ hatası. Lütfen bağlantınızı kontrol edin.',
    notFound: 'Bulunamadı',
    loadFailed: 'Veri yüklenemedi',
  },
};

