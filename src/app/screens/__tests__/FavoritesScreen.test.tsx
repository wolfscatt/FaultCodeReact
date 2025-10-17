/**
 * Tests for FavoritesScreen
 * Tests premium gating, favorites display, and remove functionality
 */

import React from 'react';
import {render, fireEvent, waitFor, screen} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import FavoritesScreen from '../FavoritesScreen';
import {useUserStore} from '@state/useUserStore';
import {listFavorites, removeFavorite} from '@data/repo/favoritesRepo';

// Mock dependencies
jest.mock('@state/useUserStore');
jest.mock('@data/repo/favoritesRepo');
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

const mockUseUserStore = useUserStore as jest.MockedFunction<typeof useUserStore>;
const mockListFavorites = listFavorites as jest.MockedFunction<typeof listFavorites>;
const mockRemoveFavorite = removeFavorite as jest.MockedFunction<typeof removeFavorite>;

const mockFavorites = [
  {
    id: 'fault-1',
    brandId: 'brand-1',
    code: 'F28',
    title: 'Ignition failure',
    severity: 'critical' as const,
    summary: 'Boiler fails to ignite',
    causes: ['Gas supply issue'],
    safetyNotice: 'Check gas supply',
    lastVerifiedAt: '2023-01-01',
  },
  {
    id: 'fault-2',
    brandId: 'brand-1',
    code: 'F75',
    title: 'Low water pressure',
    severity: 'warning' as const,
    summary: 'Water pressure is too low',
    causes: ['Water leak', 'Pump failure'],
    lastVerifiedAt: '2023-01-02',
  },
];

const renderFavoritesScreen = () => {
  return render(
    <NavigationContainer>
      <FavoritesScreen />
    </NavigationContainer>,
  );
};

describe('FavoritesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Premium Gating', () => {
    it('should show paywall for free users', () => {
      mockUseUserStore.mockReturnValue({
        userId: 'user-123',
        isPremium: () => false,
        plan: 'free',
      } as any);

      renderFavoritesScreen();

      expect(screen.getByText('Favorites is Premium Only')).toBeTruthy();
    });

    it('should show paywall for non-logged users', () => {
      mockUseUserStore.mockReturnValue({
        userId: null,
        isPremium: () => false,
        plan: 'free',
      } as any);

      renderFavoritesScreen();

      expect(screen.getByText('Favorites is Premium Only')).toBeTruthy();
    });

    it('should show favorites list for premium users', async () => {
      mockUseUserStore.mockReturnValue({
        userId: 'user-123',
        isPremium: () => true,
        plan: 'pro',
      } as any);

      mockListFavorites.mockResolvedValue(mockFavorites);

      renderFavoritesScreen();

      await waitFor(() => {
        expect(screen.getByText('F28')).toBeTruthy();
        expect(screen.getByText('Ignition failure')).toBeTruthy();
      });
    });
  });

  describe('Favorites Display', () => {
    beforeEach(() => {
      mockUseUserStore.mockReturnValue({
        userId: 'user-123',
        isPremium: () => true,
        plan: 'pro',
      } as any);
    });

    it('should display favorites list', async () => {
      mockListFavorites.mockResolvedValue(mockFavorites);

      renderFavoritesScreen();

      await waitFor(() => {
        expect(screen.getByText('F28')).toBeTruthy();
        expect(screen.getByText('Ignition failure')).toBeTruthy();
        expect(screen.getByText('F75')).toBeTruthy();
        expect(screen.getByText('Low water pressure')).toBeTruthy();
      });
    });

    it('should show empty state when no favorites', async () => {
      mockListFavorites.mockResolvedValue([]);

      renderFavoritesScreen();

      await waitFor(() => {
        expect(screen.getByText('No Favorites Yet')).toBeTruthy();
        expect(screen.getByText('Save fault codes you find useful for quick access later.')).toBeTruthy();
      });
    });

    it('should show loading state initially', () => {
      mockListFavorites.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderFavoritesScreen();

      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    });
  });

  describe('Remove Functionality', () => {
    beforeEach(() => {
      mockUseUserStore.mockReturnValue({
        userId: 'user-123',
        isPremium: () => true,
        plan: 'pro',
      } as any);
    });

    it('should remove favorite on confirmation', async () => {
      mockListFavorites.mockResolvedValue(mockFavorites);
      mockRemoveFavorite.mockResolvedValue({removed: true, error: null});

      renderFavoritesScreen();

      await waitFor(() => {
        expect(screen.getByText('F28')).toBeTruthy();
      });

      // Find and press remove button
      const removeButtons = screen.getAllByText('🗑️');
      fireEvent.press(removeButtons[0]);

      // Confirm removal
      const confirmButton = screen.getByText('Remove');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(mockRemoveFavorite).toHaveBeenCalledWith('user-123', 'fault-1');
      });
    });

    it('should handle removal errors', async () => {
      mockListFavorites.mockResolvedValue(mockFavorites);
      mockRemoveFavorite.mockResolvedValue({removed: false, error: 'Database error'});

      renderFavoritesScreen();

      await waitFor(() => {
        expect(screen.getByText('F28')).toBeTruthy();
      });

      const removeButtons = screen.getAllByText('🗑️');
      fireEvent.press(removeButtons[0]);

      const confirmButton = screen.getByText('Remove');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockUseUserStore.mockReturnValue({
        userId: 'user-123',
        isPremium: () => true,
        plan: 'pro',
      } as any);
    });

    it('should navigate to fault detail on view button press', async () => {
      mockListFavorites.mockResolvedValue(mockFavorites);

      const mockNavigate = jest.fn();
      jest.mock('@react-navigation/native', () => ({
        ...jest.requireActual('@react-navigation/native'),
        useNavigation: () => ({
          navigate: mockNavigate,
        }),
      }));

      renderFavoritesScreen();

      await waitFor(() => {
        expect(screen.getByText('F28')).toBeTruthy();
      });

      const viewButtons = screen.getAllByText('View Details');
      fireEvent.press(viewButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith('FaultDetail', {faultId: 'fault-1'});
    });
  });
});
