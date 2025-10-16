/**
 * FaultDetailScreen Quota Tests
 * Tests for free tier quota gating and paywall behavior
 */

import React from 'react';
import {render, waitFor} from '@testing-library/react-native';
import FaultDetailScreen from '../FaultDetailScreen';
import {useUserStore} from '@state/useUserStore';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (params) {
        return key.replace(/\{\{(\w+)\}\}/g, (_, k) => params[k] || '');
      }
      return key;
    },
  }),
}));

// Mock navigation
const mockReplace = jest.fn();
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  replace: mockReplace,
  goBack: jest.fn(),
  setOptions: jest.fn(),
} as any;

// Mock route
const mockRoute = {
  params: {faultId: 'fault_001'},
  key: 'test',
  name: 'FaultDetail',
} as any;

describe('FaultDetailScreen - Quota Gating', () => {
  beforeEach(() => {
    // Reset mocks
    mockReplace.mockClear();
    mockNavigate.mockClear();
    
    // Reset user store to free plan with no quota used
    const store = useUserStore.getState();
    store.downgradeToFree();
    store.resetDailyQuota();
  });

  it('should increment quota when viewing fault as free user', async () => {
    const initialQuota = useUserStore.getState().dailyQuotaUsed;
    
    render(<FaultDetailScreen navigation={mockNavigation} route={mockRoute} />);

    await waitFor(() => {
      const currentQuota = useUserStore.getState().dailyQuotaUsed;
      expect(currentQuota).toBe(initialQuota + 1);
    });
  });

  it('should navigate to Paywall when free quota exceeded', async () => {
    // Set quota to limit (10)
    const store = useUserStore.getState();
    for (let i = 0; i < 10; i++) {
      store.incrementQuota();
    }

    // Verify quota is at limit
    expect(store.dailyQuotaUsed).toBe(10);

    // Try to view fault detail
    render(<FaultDetailScreen navigation={mockNavigation} route={mockRoute} />);

    await waitFor(() => {
      // Should navigate to Paywall
      expect(mockReplace).toHaveBeenCalledWith('Paywall');
    });
  });

  it('should NOT increment quota for Pro users', async () => {
    // Upgrade to Pro
    const store = useUserStore.getState();
    store.upgradeToPro();

    const initialQuota = store.dailyQuotaUsed;

    render(<FaultDetailScreen navigation={mockNavigation} route={mockRoute} />);

    await waitFor(
      () => {
        const currentQuota = useUserStore.getState().dailyQuotaUsed;
        // Quota should remain the same for Pro users
        expect(currentQuota).toBe(initialQuota);
      },
      {timeout: 1000},
    );
  });

  it('should allow Pro users unlimited access', async () => {
    // Upgrade to Pro
    const store = useUserStore.getState();
    store.upgradeToPro();
    
    // Set high quota usage (shouldn't matter for Pro)
    for (let i = 0; i < 20; i++) {
      store.incrementQuota();
    }

    // Pro user should still be able to view
    const {getByText} = render(
      <FaultDetailScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(
      () => {
        // Should load content, not redirect to Paywall
        const codeElement = getByText('F28');
        expect(codeElement).toBeDefined();
        expect(mockReplace).not.toHaveBeenCalledWith('Paywall');
      },
      {timeout: 3000},
    );
  });

  it('should show quota indicator for free users', async () => {
    const store = useUserStore.getState();
    store.downgradeToFree();
    store.resetDailyQuota();

    const {getByText} = render(
      <FaultDetailScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(
      () => {
        // Should show remaining quota
        const quotaText = getByText(/remaining/i);
        expect(quotaText).toBeDefined();
      },
      {timeout: 3000},
    );
  });

  it('should NOT show quota indicator for Pro users', async () => {
    const store = useUserStore.getState();
    store.upgradeToPro();

    const {queryByText} = render(
      <FaultDetailScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(
      () => {
        // Load the fault code to ensure rendering is complete
        const code = queryByText('F28');
        expect(code).toBeDefined();
        
        // Quota bar should NOT be visible
        const quotaText = queryByText(/remaining/i);
        expect(quotaText).toBeNull();
      },
      {timeout: 3000},
    );
  });
});

