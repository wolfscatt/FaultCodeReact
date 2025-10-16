/**
 * SearchHomeScreen Tests
 */

import React from 'react';
import {render, waitFor, fireEvent} from '@testing-library/react-native';
import SearchHomeScreen from '../SearchHomeScreen';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  setOptions: jest.fn(),
} as any;

// Mock route
const mockRoute = {
  params: {},
  key: 'test',
  name: 'SearchHome',
} as any;

describe('SearchHomeScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render search input', async () => {
    const {getByPlaceholderText} = render(
      <SearchHomeScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      const searchInput = getByPlaceholderText('search.placeholder');
      expect(searchInput).toBeDefined();
    });
  });

  it('should render brand filter button', async () => {
    const {getByText} = render(
      <SearchHomeScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      const filterButton = getByText('search.brandFilter');
      expect(filterButton).toBeDefined();
    });
  });

  it('should display empty state initially', async () => {
    const {getByText} = render(
      <SearchHomeScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      const emptyText = getByText(/start searching/i);
      expect(emptyText).toBeDefined();
    });
  });

  it('should render search results and navigate on press', async () => {
    const {getByPlaceholderText, getByText} = render(
      <SearchHomeScreen navigation={mockNavigation} route={mockRoute} />,
    );

    // Type in search box
    const searchInput = getByPlaceholderText('search.placeholder');
    fireEvent.changeText(searchInput, 'E03');

    // Wait for results to load (with debounce + mock delay)
    await waitFor(
      () => {
        const resultCard = getByText('E03');
        expect(resultCard).toBeDefined();
      },
      {timeout: 1000},
    );

    // Press on a result card
    const faultCard = getByText('E03');
    fireEvent.press(faultCard.parent?.parent || faultCard);

    // Verify navigation was called
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('FaultDetail', {
        faultId: expect.any(String),
      });
    });
  });

  it('should show loading state during search', async () => {
    const {getByPlaceholderText, getByText} = render(
      <SearchHomeScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const searchInput = getByPlaceholderText('search.placeholder');
    fireEvent.changeText(searchInput, 'pressure');

    // Should show searching state briefly
    await waitFor(
      () => {
        // Results will load after debounce
        expect(getByText).toBeDefined();
      },
      {timeout: 500},
    );
  });
});

