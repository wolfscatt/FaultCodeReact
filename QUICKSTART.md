# FaultCode - Quick Start Guide

## ✅ What's Been Built

A complete, production-grade React Native 0.73.6 app with:

### 📦 Core Features
- ✅ **50+ Real Fault Codes** across 10 boiler brands (Vaillant, Worcester Bosch, Baxi, etc.)
- ✅ **Smart Search** with relevancy ranking (code > title > summary)
- ✅ **Freemium Gating** - 10 free views/day, unlimited for Pro
- ✅ **Bilingual** - Full English & Turkish translations
- ✅ **Theme Support** - Light/Dark mode
- ✅ **Type-Safe** - Strict TypeScript throughout
- ✅ **Tested** - Jest unit & integration tests

### 🏗️ Architecture
- ✅ Navigation (Stack + Bottom Tabs)
- ✅ State Management (Zustand + React Query)
- ✅ Repository Pattern (easy API migration)
- ✅ Design System (tokens, theming)
- ✅ i18n (en/tr namespaces)

### 📱 Screens
1. **Search Home** - Debounced search + brand filter
2. **Fault Detail** - Full diagnosis with step-by-step guides
3. **Paywall** - Free vs Pro comparison
4. **Settings** - Language, theme, preferences

## 🚀 Next Steps

### 1. Install Dependencies
```bash
yarn install
```

### 2. Android Setup (if not done)
- Install Android Studio
- Set up Android SDK (API 33+)
- Create emulator or connect device

### 3. Run the App
```bash
# Start Metro
yarn start

# In another terminal
yarn android
```

### 4. Test It
```bash
# Run all tests
yarn test

# Type checking
yarn type-check

# Linting
yarn lint
```

## 🎯 Try These Features

1. **Search**: Type "F28" or "pressure" to see smart search
2. **Brand Filter**: Click "Filter by brand" and select Vaillant
3. **View Fault**: Click any card to see full details
4. **Quota Test**: View 10+ faults to trigger paywall
5. **Upgrade**: Click "Subscribe" to mock upgrade to Pro
6. **Settings**: Toggle language (EN/TR) and theme
7. **Downgrade**: In Settings, downgrade back to test quota again

## 📊 Test Coverage

Run tests to verify:
```bash
yarn test
```

Should see:
- ✅ Brand search filtering
- ✅ Fault search with relevancy
- ✅ Screen rendering
- ✅ Step ordering

## 🔧 Common Issues

### Metro bundler cache issues:
```bash
yarn start --reset-cache
```

### Android build issues:
```bash
cd android && ./gradlew clean && cd ..
yarn android
```

### TypeScript errors:
```bash
yarn type-check
```

## 📝 Key Files to Review

**Data Layer:**
- `src/data/types.ts` - All TypeScript types
- `src/data/mock/fault_codes.json` - 50+ real codes
- `src/data/repo/faultRepo.ts` - Search logic

**State:**
- `src/state/useUserStore.ts` - Plan & quota
- `src/state/usePrefsStore.ts` - Language & theme

**Screens:**
- `src/app/screens/SearchHomeScreen.tsx` - Main search
- `src/app/screens/FaultDetailScreen.tsx` - Details + gating
- `src/app/screens/PaywallScreen.tsx` - Upgrade flow

**Tests:**
- `src/data/repo/__tests__/` - Repository tests
- `src/app/screens/__tests__/` - Screen tests

## 🎨 Customization

### Add More Fault Codes
Edit `src/data/mock/fault_codes.json` and `steps.json`

### Change Daily Limit
In `src/state/useUserStore.ts`:
```typescript
const DAILY_FREE_LIMIT = 10; // Change this
```

### Add New Language
1. Create `src/i18n/locales/de.ts` (German example)
2. Import in `src/i18n/index.ts`
3. Update `Language` type in `src/state/usePrefsStore.ts`

### Update Theme Colors
Edit `src/theme/tokens.ts`

## 🔄 Migration to Real API

When ready for backend:

1. **Set up API endpoint** (e.g., NestJS, Express)
2. **Update repositories**:
   ```typescript
   // src/data/repo/faultRepo.ts
   export async function searchFaults(filters: SearchFilters) {
     const response = await axios.get('/api/faults/search', {
       params: filters
     });
     return response.data;
   }
   ```
3. **Enable React Query** for caching
4. **Add auth** using Firebase (already stubbed)
5. **Implement real IAP** for subscriptions

## 📦 Package Versions

All dependencies use **exact versions** (no ^ or ~) for stability:
- React Native: 0.73.6
- React: 18.2.0
- TypeScript: 5.2.2
- See `package.json` for complete list

## 🎓 Code Quality

The project follows best practices:
- ✅ Strict TypeScript
- ✅ ESLint + Prettier configured
- ✅ Path aliases (@app, @data, @state, etc.)
- ✅ Component composition
- ✅ Repository pattern
- ✅ Separation of concerns

## 📞 Need Help?

1. Check `README.md` for detailed architecture
2. Review test files for usage examples
3. Inspect `src/data/mock/` for data structure

---

**Built with ❤️ for production-grade React Native development**

