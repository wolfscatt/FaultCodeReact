# FaultCode - Boiler Fault Code Assistant

[![CI](https://github.com/YOUR_USERNAME/FaultCode/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/FaultCode/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.73.6-blue.svg)](https://reactnative.dev/)
[![Tests](https://img.shields.io/badge/tests-116%2F118%20passing-success.svg)](https://github.com/YOUR_USERNAME/FaultCode/actions)

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
- Firebase Auth: 18.5.0
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
│   │   └── usePrefsStore.ts    # Language, theme, settings
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

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Install iOS pods** (macOS only)
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

# Fix linting issues
yarn lint:fix

# Format code
yarn format
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

## 💾 Mock Data Strategy

### Current Approach (MVP)
This project uses **100% mock data** stored in JSON files (`src/data/mock/`). No network calls are made.

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

### Migrating to Real API

When ready to connect to a backend, update only the repository files. The UI layer remains unchanged.

**Step 1: Update Repository Implementation**
```typescript
// src/data/repo/faultRepo.ts

// Before (mock):
export const searchFaults = async (params) => {
  const faults = require('../mock/fault_codes.json');
  return faults.filter(...);
};

// After (real API):
import axios from 'axios';

export const searchFaults = async (params) => {
  const { data } = await axios.get('/api/faults', { params });
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
- [ ] Set up backend API endpoints
- [ ] Update repository implementations
- [ ] Add error handling for network failures  
- [ ] Implement loading states
- [ ] Enable React Query caching
- [ ] Keep mock data for tests
- [ ] Test with slow network conditions

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

This project uses GitHub Actions for continuous integration:

- **Automated Testing**: Runs on every push and pull request
- **Type Checking**: TypeScript compilation check
- **Linting**: ESLint + Prettier checks
- **Test Suite**: Jest tests with coverage reporting
- **Node Version**: 18.x
- **Caching**: Yarn dependencies cached for faster builds

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

