/**
 * Tests for FaultDetailScreen Favorites functionality
 * Tests save/remove favorites, authentication, and premium gating
 */

import React from 'react';
import {render, fireEvent, waitFor, screen, Alert} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import FaultDetailScreen from '../FaultDetailScreen';
import {useUserStore} from '@state/useUserStore';
import {addFavorite, removeFavorite, isFavorited} from '@data/repo/favoritesRepo';

// Mock dependencies
jest.mock('@state/useUserStore');
jest.mock('@data/repo/favoritesRepo');
jest.mock('@data/repo/faultRepo', () => ({
  getFaultById: jest.fn(),
}));

jest.mock('@theme/useTheme', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#000000',
      textSecondary: '#666666',
      border: '#e0e0e0',
    },
  }),
}));

jest.mock('@state/usePrefsStore', () => ({
  usePrefsStore: () => ({language: 'en'}),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

jest.mock('@state/useAnalyticsStore', () => ({
  analytics: {
    faultView: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockUseUserStore = useUserStore as jest.MockedFunction<typeof useUserStore>;
const mockAddFavorite = addFavorite as jest.MockedFunction<typeof addFavorite>;
const mockRemoveFavorite = removeFavorite as jest.MockedFunction<typeof removeFavorite>;
const mockIsFavorited = isFavorited as jest.MockedFunction<typeof isFavorited>;

const mockFaultData = {
  fault: {
    id: 'fault-123',
    brandId: 'brand-1',
    code: 'F28',
    title: 'Ignition failure',
    severity: 'critical' as const,
    summary: 'Boiler fails to ignite',
    causes: ['Gas supply issue'],
    safetyNotice: 'Check gas supply',
    lastVerifiedAt: '2023-01-01',
  },
  steps: [
    {
      id: 'step-1',
      faultCodeId: 'fault-123',
      order: 1,
      text: 'Check gas supply',
      estimatedTimeMin: 5,
      requiresPro: false,
      tools: ['Multimeter'],
      imageUrl: null,
    },
  ],
};

const renderFaultDetailScreen = (faultId = 'fault-123') => {
  return render(
    <NavigationContainer>
      <FaultDetailScreen
        route={{params: {faultId}}}
        navigation={{} as any}
      />
    </NavigationContainer>,
  );
};

describe('FaultDetailScreen Favorites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Alert.alert as jest.Mock).mockClear();
  });

  describe('Authentication Gating', () => {
    it('should show login prompt for non-logged users', async () => {
      mockUseUserStore.mockReturnValue({
        userId: null,
        isPremium: () => false,
        plan: 'free',
        incrementQuota: jest.fn(),
        checkAndResetQuota: jest.fn(),
      } as any);

      mockIsFavorited.mockResolvedValue({isFavorited: false, error: null});

      renderFaultDetailScreen();

      const saveButton = screen.getByTestId('favorite-button');
      fireEvent.press(saveButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Login Required',
        'Please login to save favorites',
        expect.arrayContaining([
          expect.objectContaining({text: 'Cancel'}),
          expect.objectContaining({text: 'Login'}),
        ]),
      );
    });

    it('should show paywall for free users', async () => {
      mockUseUserStore.mockReturnValue({
        userId: 'user-123',
        isPremium: () => false,
        plan: 'free',
        incrementQuota: jest.fn(),
        checkAndResetQuota: jest.fn(),
      } as any);

      mockIsFavorited.mockResolvedValue({isFavorited: false, error: null});

      renderFaultDetailScreen();

      const saveButton = screen.getByTestId('favorite-button');
      fireEvent.press(saveButton);

      // Should show paywall modal
      expect(screen.getByText('Favorites is Premium Only')).toBeTruthy();
    });
  });

  describe('Save Favorite', () => {
    beforeEach(() => {
      mockUseUserStore.mockReturnValue({
        userId: 'user-123',
        isPremium: () => true,
        plan: 'pro',
        incrementQuota: jest.fn(),
        checkAndResetQuota: jest.fn(),
      } as any);
    });

    it('should save favorite successfully', async () => {
      mockIsFavorited.mockResolvedValue({isFavorited: false, error: null});
      mockAddFavorite.mockResolvedValue({created: true, error: null});

      renderFaultDetailScreen();

      await waitFor(() => {
        expect(screen.getByText('F28')).toBeTruthy();
      });

      const saveButton = screen.getByTestId('favorite-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockAddFavorite).toHaveBeenCalledWith('user-123', 'fault-123');
        expect(Alert.alert).toHaveBeenCalledWith(
          'Added to favorites',
          '',
          [{text: 'OK'}],
        );
      });
    });

    it('should handle duplicate favorites gracefully', async () => {
      mockIsFavorited.mockResolvedValue({isFavorited: false, error: null});
      mockAddFavorite.mockResolvedValue({created: false, error: null}); // Already exists

      renderFaultDetailScreen();

      await waitFor(() => {
        expect(screen.getByText('F28')).toBeTruthy();
      });

      const saveButton = screen.getByTestId('favorite-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockAddFavorite).toHaveBeenCalledWith('user-123', 'fault-123');
        // Should not show error for duplicate
        expect(Alert.alert).not.toHaveBeenCalledWith(
          expect.stringContaining('Error'),
        );
      });
    });

    it('should handle save errors', async () => {
      mockIsFavorited.mockResolvedValue({isFavorited: false, error: null});
      mockAddFavorite.mockResolvedValue({created: false, error: 'Database error'});

      renderFaultDetailScreen();

      await waitFor(() => {
        expect(screen.getByText('F28')).toBeTruthy();
      });

      const saveButton = screen.getByTestId('favorite-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to add favorite',
        );
      });
    });
  });

  describe('Remove Favorite', () => {
    beforeEach(() => {
      mockUseUserStore.mockReturnValue({
        userId: 'user-123',
        isPremium: () => true,
        plan: 'pro',
        incrementQuota: jest.fn(),
        checkAndResetQuota: jest.fn(),
      } as any);
    });

    it('should remove favorite successfully', async () => {
      mockIsFavorited.mockResolvedValue({isFavorited: true, error: null});
      mockRemoveFavorite.mockResolvedValue({removed: true, error: null});

      renderFaultDetailScreen();

      await waitFor(() => {
        expect(screen.getByText('F28')).toBeTruthy();
      });

      const saveButton = screen.getByTestId('favorite-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockRemoveFavorite).toHaveBeenCalledWith('user-123', 'fault-123');
        expect(Alert.alert).toHaveBeenCalledWith(
          'Removed from favorites',
          '',
          [{text: 'OK'}],
        );
      });
    });

    it('should handle removal errors', async () => {
      mockIsFavorited.mockResolvedValue({isFavorited: true, error: null});
      mockRemoveFavorite.mockResolvedValue({removed: false, error: 'Database error'});

      renderFaultDetailScreen();

      await waitFor(() => {
        expect(screen.getByText('F28')).toBeTruthy();
      });

      const saveButton = screen.getByTestId('favorite-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to remove favorite',
        );
      });
    });
  });

  describe('Button State', () => {
    beforeEach(() => {
      mockUseUserStore.mockReturnValue({
        userId: 'user-123',
        isPremium: () => true,
        plan: 'pro',
        incrementQuota: jest.fn(),
        checkAndResetQuota: jest.fn(),
      } as any);
    });

    it('should show "Save" when not favorited', async () => {
      mockIsFavorited.mockResolvedValue({isFavorited: false, error: null});

      renderFaultDetailScreen();

      await waitFor(() => {
        expect(screen.getByText('☆ Save')).toBeTruthy();
      });
    });

    it('should show "Saved" when favorited', async () => {
      mockIsFavorited.mockResolvedValue({isFavorited: true, error: null});

      renderFaultDetailScreen();

      await waitFor(() => {
        expect(screen.getByText('★ Saved')).toBeTruthy();
      });
    });
  });
});
