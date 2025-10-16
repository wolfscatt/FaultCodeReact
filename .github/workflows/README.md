# GitHub Actions CI/CD Setup

## Overview

This project uses GitHub Actions for continuous integration and deployment. The CI pipeline runs on every push and pull request to `main`, `master`, or `develop` branches.

## Workflow Steps

The CI workflow (`ci.yml`) performs the following checks:

1. **Checkout Code**: Gets the latest code from the repository
2. **Setup Node.js**: Installs Node.js 18.x with Yarn caching
3. **Install Dependencies**: Runs `yarn install --frozen-lockfile`
4. **Type Check**: Runs `yarn type-check` to verify TypeScript types
5. **Lint**: Runs `yarn lint` to check code style
6. **Run Tests**: Runs `yarn test --ci --coverage` with Jest
7. **Upload Coverage**: Optionally uploads coverage to Codecov

## Environment Variables

### Supabase Integration

The CI workflow supports Supabase integration through environment variables. These are passed to the test environment but **are not required for tests to pass**.

**Environment Variables:**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for backend scripts)

### Setting Up Secrets (Optional)

If you want to test with a real Supabase instance in CI:

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add the following repository secrets:
   - `SUPABASE_URL`: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

**Note**: If these secrets are not set, the workflow defaults to empty strings, and tests will use mock data exclusively.

## Test Mocking Strategy

### How Tests Handle Supabase

The test suite uses **automatic mocking** to prevent real network calls:

1. **Environment Variables**: `__mocks__/env.js` provides empty Supabase credentials
2. **Supabase Client**: `__mocks__/@supabase/supabase-js.ts` mocks the entire Supabase SDK
3. **Fallback Logic**: Repositories automatically fall back to mock data when Supabase fails

This means:
- ✅ Tests run fast (no network I/O)
- ✅ Tests are deterministic (no external dependencies)
- ✅ Tests work offline
- ✅ No Supabase account required for development

### Mock Files

- `__mocks__/env.js` - Mocks environment variables (returns empty strings)
- `__mocks__/@supabase/supabase-js.ts` - Mocks Supabase client (returns error responses)

When these mocks are active:
1. Supabase client is created but returns errors on all queries
2. Repository fallback logic catches errors and uses mock JSON data
3. Tests verify functionality using local mock data

### Example Test Flow

```typescript
// In a test file
import {searchFaults} from '@data/repo/faultRepo';

// This will:
// 1. Try to use Supabase (but it's mocked and returns error)
// 2. Automatically fall back to mock data
// 3. Return predictable mock results
const results = await searchFaults({q: 'E01'});
expect(results).toBeDefined();
```

## Running Tests Locally

### Without Supabase (Default)
```bash
yarn test
```
Uses mock data exclusively. No .env file needed.

### With Supabase (Optional)
```bash
# Create .env file with real credentials
cp .env.example .env
# Edit .env with your Supabase credentials

# Run tests - they will still use mocks!
yarn test
```

Even with a `.env` file, Jest uses mocks to ensure consistent test results.

## Debugging CI Failures

### Type Check Failures
```bash
# Run locally
yarn type-check

# Fix issues in TypeScript files
```

### Lint Failures
```bash
# Run locally
yarn lint

# Auto-fix most issues
yarn lint:fix
```

### Test Failures
```bash
# Run tests locally
yarn test

# Run specific test file
yarn test SearchHomeScreen.test.tsx

# Run with verbose output
yarn test --verbose

# Update snapshots if needed
yarn test -u
```

### Cache Issues

If you suspect a caching issue:

1. Clear Yarn cache:
   ```bash
   yarn cache clean
   ```

2. Re-run the workflow

3. Or add `[skip cache]` to your commit message (not implemented by default)

## Coverage Reporting

The workflow uploads test coverage to Codecov (if `CODECOV_TOKEN` secret is set).

To view coverage locally:
```bash
yarn test --coverage
open coverage/lcov-report/index.html
```

## Badge Status

The CI badge in the README shows the current build status:

- ✅ **Passing**: All checks passed
- ❌ **Failing**: One or more checks failed
- 🟡 **Pending**: Workflow is running

Click the badge to view detailed workflow runs.

## Workflow File Location

`.github/workflows/ci.yml`

## Modifying the Workflow

To add new checks:

1. Edit `.github/workflows/ci.yml`
2. Add new step under `steps:`
3. Commit and push
4. Workflow will run automatically

Example:
```yaml
- name: Custom Check
  run: yarn custom-script
```

## Troubleshooting

### "Module not found" errors

Ensure all dependencies are in `package.json` and run:
```bash
yarn install
```

### "Supabase connection failed" in tests

This is expected! Tests use mocks. The error should be caught and tests should pass using fallback mock data.

### Timeout errors

Increase timeout in `jest.config.js`:
```javascript
testTimeout: 10000,
```

Or in specific test:
```typescript
jest.setTimeout(10000);
```

## Best Practices

1. **Always run tests locally** before pushing
2. **Keep secrets secure** - never commit `.env` files
3. **Use mocks for tests** - avoid real API calls
4. **Update dependencies carefully** - use exact versions
5. **Review CI logs** when builds fail

---

**Last Updated**: October 2025

