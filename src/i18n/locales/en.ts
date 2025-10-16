/**
 * English translations
 */

export default {
  common: {
    appName: 'FaultCode',
    search: 'Search',
    cancel: 'Cancel',
    close: 'Close',
    reset: 'Reset',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    ok: 'OK',
  },

  search: {
    title: 'Search Fault Codes',
    placeholder: 'Enter fault code or keyword...',
    brandFilter: 'Filter by brand',
    allBrands: 'All Brands',
    noResults: 'No fault codes found',
    noResultsDesc: 'Try adjusting your search or filters',
    searching: 'Searching...',
    resultsCount: '{{count}} result',
    resultsCount_plural: '{{count}} results',
  },

  fault: {
    title: 'Fault Details',
    code: 'Code',
    severity: 'Severity',
    summary: 'Summary',
    causes: 'Possible Causes',
    safetyNotice: 'Safety Notice',
    resolutionSteps: 'Resolution Steps',
    step: 'Step {{number}}',
    estimatedTime: '~{{minutes}} min',
    requiresPro: 'Professional required',
    tools: 'Tools needed',
    imageComingSoon: '(Image coming soon)',
    lastVerified: 'Last verified: {{date}}',
    severity_info: 'Info',
    severity_warning: 'Warning',
    severity_critical: 'Critical',
  },

  paywall: {
    title: 'Upgrade to Pro',
    limitReached: 'Daily Limit Reached',
    limitReachedDesc: 'You have reached your daily limit of {{limit}} fault code views.',
    freePlan: 'Free Plan',
    proPlan: 'Pro Plan',
    freeFeatures: [
      '{{limit}} fault codes per day',
      'Basic search',
      'Resolution steps',
      'Safety notices',
    ],
    proFeatures: [
      'Unlimited fault codes',
      'Advanced search filters',
      'Offline access',
      'Priority support',
      'Ad-free experience',
      'Bookmark favorites',
    ],
    subscribe: 'Subscribe to Pro',
    mockNotice: '(Mock subscription - will not charge)',
    remainingToday: 'Remaining today: {{remaining}}/{{limit}}',
    unlimitedAccess: 'Unlimited access',
  },

  navigation: {
    home: 'Home',
    search: 'Search',
    bookmarks: 'Bookmarks',
    settings: 'Settings',
  },

  settings: {
    title: 'Settings',
    language: 'Language',
    theme: 'Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    analytics: 'Analytics',
    analyticsDesc: 'Help improve the app by sharing anonymous usage data',
    subscription: 'Subscription',
    currentPlan: 'Current Plan',
    managePlan: 'Manage Plan',
  },

  errors: {
    generic: 'Something went wrong',
    network: 'Network error. Please check your connection.',
    notFound: 'Not found',
    loadFailed: 'Failed to load data',
  },
};

