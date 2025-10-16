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
    // Titles
    title: 'Upgrade to Pro',
    quota_exceeded_title: 'Monthly Limit Reached',
    favorites_locked_title: 'Favorites is Premium Only',
    premium_title: 'Upgrade to Premium',

    // Messages
    quota_exceeded_message: 'You have reached your monthly limit of 10 fault details. Upgrade to Pro for unlimited access.',
    favorites_locked_message: 'Save your favorite fault codes for quick access. Available with Pro plan.',
    premium_message: 'Unlock all features and get unlimited access to fault codes.',

    // Features
    feature_unlimited: 'Unlimited fault details',
    feature_favorites: 'Save favorites',
    feature_advanced_search: 'Advanced search',
    feature_priority_support: 'Priority support',
    feature_offline: 'Offline access',
    feature_images: 'Image guides',

    // Comparison table
    feature: 'Feature',
    free: 'Free',
    pro: 'Pro',
    fault_details: 'Fault Details',
    limit_10: '10/month',
    unlimited: 'Unlimited',
    favorites: 'Favorites',
    support: 'Support',
    basic: 'Basic',
    priority: 'Priority',

    // Buttons
    upgrade_button: 'Upgrade to Pro',
    cancel: 'Maybe Later',

    // Legacy translations (keep for backwards compatibility)
    limitReached: 'Monthly Limit Reached',
    limitReachedDesc: 'You have reached your monthly limit of {{limit}} fault code views.',
    freePlan: 'Free Plan',
    proPlan: 'Pro Plan',
    freeFeatures: [
      '10 fault codes per month',
      'Basic search',
      'Community support',
    ],
    proFeatures: [
      'Unlimited fault codes',
      'Save favorites',
      'Advanced search',
      'Priority support',
      'Offline access',
      'Image guides',
    ],
    subscribe: 'Subscribe to Pro',
    mockNotice: '(Mock subscription - will not charge)',
    remainingThisMonth: 'Remaining this month: {{remaining}}/{{limit}}',
    unlimitedAccess: 'Unlimited access',
  },

  favorites: {
    title: 'Favorites',
    empty_title: 'No Favorites Yet',
    empty_message: 'Save fault codes you find useful for quick access later.',
    saved: 'saved',
    remove_title: 'Remove Favorite',
    remove_message: 'Are you sure you want to remove this from favorites?',
    remove: 'Remove',
    view: 'View Details',
    add_success: 'Added to favorites',
    remove_success: 'Removed from favorites',
    error: 'Failed to update favorites',
    login_required: 'Login Required',
    login_message: 'Please login to save favorites',
  },

  navigation: {
    home: 'Home',
    search: 'Search',
    bookmarks: 'Bookmarks',
    favorites: 'Favorites',
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

