# FaultCode - Boiler Fault Code Assistant

[![CI](https://github.com/wolfscatt/FaultCodeReact/actions/workflows/ci.yml/badge.svg)](https://github.com/wolfscatt/FaultCodeReact/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.73.6-blue.svg)](https://reactnative.dev/)
[![Tests](https://img.shields.io/badge/tests-116%2F118%20passing-success.svg)](https://github.com/wolfscatt/FaultCodeReact/actions)

A production-grade React Native mobile application that helps users diagnose and resolve boiler/combi fault codes. Built with TypeScript, featuring a modern architecture with mock data for MVP.

## 🚀 Features

- **Smart Search**: Find fault codes by code number, brand, or keywords with relevancy-based ranking
- **Rich Fault Details**: Comprehensive information including severity, causes, safety notices, and step-by-step resolution guides
- **Multi-Brand Support**: 10+ major boiler brands with 50+ real fault codes
- **Freemium Model**: Free tier with 10 daily views, Pro tier with unlimited access
- **Bilingual**: Full support for English and Turkish
- **Themeable**: Light and dark mode support
- **Type-Safe**: Full TypeScript with strict mode enabled
- **Well-Tested**: Jest unit and integration tests included

## 📋 Tech Stack

### Core
- **React Native**: 0.73.6 (pure RN, no Expo)
- **React**: 18.2.0
- **TypeScript**: 5.2.2 (strict mode)

### Navigation
- @react-navigation/native: 6.1.9
- @react-navigation/stack: 6.3.20
- @react-navigation/bottom-tabs: 6.5.14
- react-native-screens: 3.30.1
- react-native-safe-area-context: 4.6.3

### State Management
- Zustand: 4.4.1 (with Immer middleware)
- @tanstack/react-query: 4.29.14

### UI & Styling
- NativeWind: 2.0.11
- Tailwind CSS: 3.3.2
- react-native-svg: 13.14.0

### Internationalization
- i18next: 23.5.1
- react-i18next: 13.2.2

### Forms & Validation
- react-hook-form: 7.45.2
- zod: 3.22.4

### Testing & Quality
- Jest: 29.7.0
- @testing-library/react-native: 12.2.1
- ESLint: 8.52.0
- Prettier: 3.0.3

### Future Integration (Stubs)
- Supabase: 2.39.0
- Google Mobile Ads: 11.7.0
- In-App Purchases: 13.9.0

## 📁 Project Structure

```
FaultCode/
├── src/
│   ├── app/                    # Screens & Navigation
│   │   ├── navigation/         # Navigation config
│   │   │   ├── RootNavigator.tsx
│   │   │   ├── MainTabNavigator.tsx
│   │   │   ├── SearchStackNavigator.tsx
│   │   │   └── types.ts
│   │   └── screens/            # Screen components
│   │       ├── SearchHomeScreen.tsx
│   │       ├── FaultDetailScreen.tsx
│   │       ├── PaywallScreen.tsx
│   │       └── SettingsScreen.tsx
│   │
│   ├── components/             # Reusable UI components
│   │   └── FaultCodeCard.tsx
│   │
│   ├── data/                   # Data layer
│   │   ├── types.ts            # TypeScript types
│   │   ├── mock/               # Mock JSON data
│   │   │   ├── brands.json     (10 brands)
│   │   │   ├── models.json     (15 models)
│   │   │   ├── fault_codes.json (50+ codes)
│   │   │   └── steps.json      (Resolution steps)
│   │   └── repo/               # Repository layer
│   │       ├── brandRepo.ts
│   │       └── faultRepo.ts
│   │
│   ├── state/                  # Zustand stores
│   │   ├── useUserStore.ts     # User, plan, quota
│   │   ├── usePrefsStore.ts    # Language, theme, settings
│   │   └── useAnalyticsStore.ts # Analytics tracking
│   │
│   ├── lib/                    # External integrations
│   │   ├── supabase.ts         # Supabase client
│   │   └── env.d.ts            # Environment types
│   │
│   ├── theme/                  # Design tokens & theming
│   │   ├── tokens.ts           # Colors, spacing, typography
│   │   ├── useTheme.ts         # Theme hook
│   │   └── index.ts
│   │
│   ├── i18n/                   # Internationalization
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── en.ts           # English translations
│   │       └── tr.ts           # Turkish translations
│   │
│   └── utils/                  # Utilities
│       └── index.ts            # Helpers (debounce, delay, etc.)
│
├── scripts/                    # Database & deployment scripts
│   ├── setupSupabaseTables.sql # Bilingual Supabase schema
│   └── README.md               # Database setup guide
│
├── App.tsx                     # Root component
├── index.js                    # RN entry point
├── package.json                # Dependencies (exact versions)
├── tsconfig.json               # TypeScript config
├── babel.config.js             # Babel config
├── jest.config.js              # Jest config
├── tailwind.config.js          # Tailwind config
└── README.md                   # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js**: >= 18.0.0
- **Yarn**: >= 1.22.0
- **React Native CLI**: Installed globally
- **Android Studio**: For Android development (with Android SDK 33+)
- **Xcode**: For iOS development (macOS only, version 14+)

### Installation

1. **Clone the repository**
   ```bash
   cd FaultCode
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Supabase credentials
   # Get them from https://app.supabase.com → Project Settings → API
   ```

   **Note**: The app currently uses mock data, so Supabase credentials are optional. You can leave the `.env` file with empty values for now.

3. **Install dependencies**
   ```bash
   yarn install
   ```

4. **Install iOS pods** (macOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

#### Android

1. Start Metro bundler:
   ```bash
   yarn start
   ```

2. In a new terminal, run Android:
   ```bash
   yarn android
   ```

   Or with a specific device:
   ```bash
   yarn android --deviceId=<device-id>
   ```

#### iOS (macOS only)

1. Start Metro bundler:
   ```bash
   yarn start
   ```

2. In a new terminal, run iOS:
   ```bash
   yarn ios
   ```

   Or for a specific simulator:
   ```bash
   yarn ios --simulator="iPhone 15"
   ```

### Development Commands

```bash
# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Type checking
yarn type-check

# Linting
yarn lint
yarn lint:fix

# Format code
yarn format

# Database migration
yarn db:import  # Import mock data to Supabase
```

## 🧪 Testing

The project includes comprehensive tests:

- **Unit tests**: Repository functions with search/filter logic
- **Integration tests**: Screen rendering and component behavior

Run tests:
```bash
yarn test
```

Example test files:
- `src/data/repo/__tests__/brandRepo.test.ts`
- `src/data/repo/__tests__/faultRepo.test.ts`
- `src/app/screens/__tests__/SearchHomeScreen.test.tsx`
- `src/app/screens/__tests__/FaultDetailScreen.test.tsx`

## 🎨 Architecture Highlights

### Repository Pattern
All data access goes through repository functions in `src/data/repo/`. This abstraction makes it easy to swap mock JSON with real API calls later:

```typescript
// brandRepo.ts
export async function searchBrands(query: string): Promise<Brand[]> {
  // Currently: filter mock JSON
  // Future: await axios.get('/api/brands/search', { params: { q: query } })
}
```

### State Management
- **Zustand**: Lightweight global state for user plan, quota, and preferences
- **React Query**: Ready for server-state management when API is integrated

### Freemium Gating
Free users can view 10 fault details per day. The quota resets daily and is tracked in `useUserStore`:
```typescript
const { canAccess, remaining, limit } = useCanAccessContent();
```

When limit is reached, users are redirected to the Paywall screen.

---

## 💾 Data Strategy

### Flexible Data Layer (Mock + Supabase)
This project uses a **smart repository layer** that automatically switches between Supabase and mock data:

**With Supabase configured:**
- Fetches data from Supabase with bilingual support (EN/TR)
- Automatically falls back to mock data if Supabase fails
- Provides full translation based on user language preference

**Without Supabase:**
- Uses local mock JSON files (works 100% offline)
- No network calls, instant responses
- Perfect for development and testing

**Key benefit:** Your app works offline AND online with the same code!

**Advantages**:
- Fast development without backend dependency
- Predictable, testable behavior
- Works offline by default
- Easy to demo and iterate

**Mock Data Files**:
- `brands.json` - 10 major boiler brands
- `models.json` - Boiler models per brand
- `fault_codes.json` - 50+ real fault codes
- `steps.json` - 2-6 resolution steps per fault

### Migrating to Supabase

When ready to migrate from mock data to Supabase, update only the repository files. The UI layer remains unchanged.

**Prerequisites**:
1. Create a Supabase project at https://app.supabase.com
2. Run the database schema: `scripts/setupSupabaseTables.sql` (see `scripts/README.md` for details)
3. Add your credentials to `.env` file
4. Migrate mock data to Supabase (optional helper scripts coming soon)
5. Update repository implementations

**Database Schema**: The app includes a complete bilingual SQL schema in `scripts/setupSupabaseTables.sql` with:
- JSONB columns for English/Turkish content
- 7 core tables: brands, boiler_models, fault_codes, resolution_steps, plans, users, analytics_events
- Optimized indexes, foreign keys, and Row Level Security policies

**Step 1: Update Repository Implementation**
```typescript
// src/data/repo/faultRepo.ts

// Before (mock):
export const searchFaults = async (params) => {
  const faults = require('../mock/fault_codes.json');
  return faults.filter(...);
};

// After (Supabase):
import { supabase } from '@lib/supabase';

export const searchFaults = async (params) => {
  const { data, error } = await supabase
    .from('fault_codes')
    .select('*')
    .ilike('code', `%${params.q}%`);
  
  if (error) throw error;
  return data;
};
```

**Step 2: Enable React Query Caching**
```typescript
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      cacheTime: 10 * 60 * 1000,  // 10 minutes
    },
  },
});

// Use in components
const { data, isLoading } = useQuery({
  queryKey: ['faults', query],
  queryFn: () => searchFaults({ q: query }),
});
```

**Step 3: Add Error Handling**
```typescript
try {
  const data = await searchFaults(params);
  return data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    // Handle network errors
    throw new Error('Network error. Please check your connection.');
  }
  throw error;
}
```

**Migration Checklist**:
- [ ] Create Supabase project and get credentials
- [ ] Configure `.env` with SUPABASE_URL and SUPABASE_ANON_KEY
- [ ] Create database tables matching your types
- [ ] Update repository implementations to use Supabase client
- [ ] Add error handling for network failures  
- [ ] Implement loading states
- [ ] Enable React Query caching
- [ ] Keep mock data for tests
- [ ] Test with slow/offline network conditions

---

## 📦 Dependency Management

### Version Pinning Policy

This project uses **exact version pinning** (no `^` or `~`) for maximum stability.

**Why Pinned Versions?**
- ✅ Consistent builds across environments
- ✅ Prevents unexpected breaking changes
- ✅ Easier debugging (everyone on same versions)
- ✅ Production-ready stability

**Example**:
```json
{
  "dependencies": {
    "react": "18.2.0",           // ✅ Exact version
    "react-native": "0.73.6"     // ✅ Exact version
  }
}
```

### Adding New Dependencies Safely

#### Step 1: Check Compatibility
```bash
# Check React Native compatibility
# Visit: https://reactnative.directory/
# Ensure package supports React Native 0.73.6
```

#### Step 2: Install with Exact Version
```bash
# ❌ DON'T: yarn add package-name (uses latest)
# ✅ DO: Specify exact version
yarn add react-native-package@1.2.3
```

#### Step 3: Test Thoroughly
```bash
yarn type-check  # TypeScript check
yarn lint        # Linting
yarn test        # All tests
yarn android     # Test on device/emulator
```

#### Step 4: Commit with Clear Message
```bash
git add package.json yarn.lock
git commit -m "chore: add react-native-package@1.2.3"
```

### Updating Existing Dependencies

```bash
# Check for outdated packages
yarn outdated

# Update to specific version (test first!)
yarn add package-name@x.y.z

# Run all checks
yarn type-check && yarn lint && yarn test
```

### Handling Dependency Conflicts

**Option 1: Downgrade to Compatible Version** (Preferred)
```bash
# Prefer downgrading new package over upgrading React Native
yarn add problematic-package@older-compatible-version
```

**Option 2: Wait for Compatibility Update**
```bash
# Check package issues/PRs for updates
# Consider using alternative package
```

**Option 3: Use Resolutions** (Last Resort)
```json
// package.json
{
  "resolutions": {
    "package-name": "x.y.z"
  }
}
```

### Core Dependencies (Never Update Casually)
```json
{
  "react": "18.2.0",
  "react-native": "0.73.6",
  "typescript": "5.2.2"
}
```

Updating these requires extensive testing and may require native code changes.

### i18n
Full bilingual support (English/Turkish) using i18next:
```typescript
const { t } = useTranslation();
<Text>{t('search.placeholder')}</Text>
```

### Type Safety
Strict TypeScript throughout with shared types in `src/data/types.ts`:
- `Brand`, `BoilerModel`, `FaultCode`, `ResolutionStep`
- Navigation types with full type inference

## 📱 Screens

### 1. Search Home
- Debounced search input
- Brand filter dropdown
- Fault code results list with cards
- Empty states for no results

### 2. Fault Detail
- Fault code, title, severity badge
- Safety notices (highlighted)
- Possible causes
- Step-by-step resolution guide with time estimates and tool requirements
- Quota indicator for free users

### 3. Paywall
- Free vs Pro comparison
- Mock subscription button
- Quota information

### 4. Settings
- Language toggle (EN/TR)
- Theme toggle (Light/Dark)
- Analytics opt-in
- Current plan display

## 🔄 Migration to Real API

When ready to switch from mock data to a real backend:

1. **Update repositories** in `src/data/repo/`:
   ```typescript
   // Before (mock)
   return brandsData.filter(/* ... */);
   
   // After (real API)
   const response = await axios.get('/api/brands', { params: { q } });
   return response.data;
   ```

2. **Enable React Query** caching and invalidation
3. **Add authentication** using Firebase Auth stubs
4. **Implement IAP** for real subscriptions
5. **Integrate ads** for free tier

## 🔄 CI/CD

This project uses GitHub Actions for continuous integration with **full Supabase support**:

- **Automated Testing**: Runs on every push and pull request
- **Type Checking**: TypeScript compilation check
- **Linting**: ESLint + Prettier checks
- **Test Suite**: Jest tests with coverage reporting (uses mocks, no network calls)
- **Node Version**: 18.x
- **Caching**: Yarn dependencies cached for faster builds
- **Supabase Integration**: Tests work with or without Supabase credentials

### Workflow Steps

1. Checkout code
2. Setup Node.js 18 with yarn cache
3. Install dependencies with `--frozen-lockfile`
4. Run `yarn type-check` (TypeScript)
5. Run `yarn lint` (ESLint + Prettier)
6. Run `yarn test --ci --coverage` (Jest)
7. Upload coverage to Codecov (optional)

### Running CI Locally

```bash
# Run all CI checks locally
yarn type-check  # TypeScript check
yarn lint        # Linting check
yarn test        # Run tests with coverage
```

### CI Badge

The CI badge at the top of this README shows the current build status. Click it to see detailed workflow runs.

### GitHub Actions Secrets (Optional)

Tests use mocks by default and don't require Supabase credentials. However, if you want to test against a real Supabase instance in CI:

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Add these optional secrets:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anonymous key  
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for backend scripts)

**Note**: These are completely optional. The CI pipeline will use mock data if secrets are not configured.

See [`GITHUB_ACTIONS_SETUP.md`](./GITHUB_ACTIONS_SETUP.md) for detailed setup instructions.

## 🔧 Troubleshooting

### Common Issues

#### 1. "URL.hostname is not implemented" error

**Symptom**: App crashes or shows blank screen with error about URL.hostname

**Cause**: React Native doesn't have full URL API support which is required by Supabase

**Solution**: This is already fixed with the `react-native-url-polyfill` package. Make sure:
```bash
# The polyfill is installed
yarn install

# The app is restarted with cache cleared
yarn start --reset-cache
```

The polyfill is imported at the top of `index.js` before any other code.

#### 2. "Maximum call stack size exceeded" error

**Symptom**: Infinite recursion error when loading data

**Cause**: Circular dependency in repository fallback logic

**Solution**: This is already fixed. The Supabase repositories now import directly from `*.mock.ts` files instead of the index files to avoid circular dependencies.

If you still see this:
```bash
# Clean all caches
yarn start --reset-cache

# On Android
cd android && ./gradlew clean && cd ..

# Rebuild
yarn android
```

#### 3. Android build fails with "ninja: error: loading 'build.ninja'"

**Symptom**: Build fails with CMake/ninja errors

**Cause**: Corrupted native build cache

**Solution**:
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Rebuild
yarn android
```

#### 4. Blank screen / No data loading

**Symptom**: App shows empty lists or blank screens

**Cause**: Either Supabase connection issue or fallback not working

**Solution**:
1. Check if `.env` file exists with valid Supabase credentials
2. If you don't have Supabase set up, leave `.env` empty to use mock data
3. Check Metro bundler for errors: `yarn start --reset-cache`
4. Verify mock data files exist in `src/data/mock/`

#### 5. "TypeError: Cannot read property 'language' of undefined"

**Symptom**: Error accessing language preference

**Cause**: Store not initialized before use

**Solution**: Make sure `usePrefsStore` is initialized. The app should initialize it in `App.tsx`. If issue persists:
```typescript
// In your store usage
const language = usePrefsStore.getState()?.language || 'en';
```

#### 6. Tests failing with act() warnings

**Symptom**: Tests pass but show act() warnings

**Cause**: React state updates not wrapped in act()

**Solution**: This is already handled in `jest.setup.js` with:
```javascript
global.suppressActWarnings = true;
```

### General Debugging Tips

```bash
# Full clean rebuild
rm -rf node_modules
yarn install
cd android && ./gradlew clean && cd ..
yarn start --reset-cache
# In another terminal
yarn android

# Check for type errors
yarn type-check

# Check for linting issues
yarn lint

# Run tests to verify everything works
yarn test
```

## 🐛 Known Limitations (MVP)

- **Mock Data Only**: No real backend or network calls
- **No Persistence**: State resets on app restart (add AsyncStorage later)
- **No Authentication**: Login/logout is mocked
- **No Real IAP**: Subscription is simulated
- **No Offline Mode**: Though structure supports it
- **Basic UI**: Production app should use a component library (e.g., React Native Paper)

## 📄 License

This is a proprietary application. All rights reserved.

## 👥 Team

- **Architecture**: Production-grade RN setup
- **Data**: 50+ real boiler fault codes from Vaillant, Worcester Bosch, Baxi, Viessmann, Ariston, Ideal, Vokera, Baymak, Ferroli, Buderus

## 📞 Support

For issues or questions, please check:
1. Ensure all dependencies are installed: `yarn install`
2. Clear Metro cache: `yarn start --reset-cache`
3. Clean build folders: `cd android && ./gradlew clean`
4. Reinstall pods: `cd ios && pod install`

---

**Version**: 0.1.0 (MVP with Mock Data)  
**Last Updated**: October 2025

