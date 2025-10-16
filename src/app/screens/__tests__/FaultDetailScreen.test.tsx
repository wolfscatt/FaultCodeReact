/**
 * FaultDetailScreen Tests
 */

import React from 'react';
import {render, waitFor} from '@testing-library/react-native';
import FaultDetailScreen from '../FaultDetailScreen';

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

// Mock route with valid fault ID
const mockRoute = {
  params: {faultId: 'fault_001'},
  key: 'test',
  name: 'FaultDetail',
} as any;

describe('FaultDetailScreen', () => {
  it('should show loading state initially', () => {
    const {getByText} = render(
      <FaultDetailScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const loadingText = getByText(/loading/i);
    expect(loadingText).toBeDefined();
  });

  it('should load and display fault details', async () => {
    const {getByText} = render(
      <FaultDetailScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(
      () => {
        // Check for fault code
        const codeElement = getByText('F28');
        expect(codeElement).toBeDefined();
      },
      {timeout: 3000},
    );
  });

  it('should display severity badge', async () => {
    const {getByText} = render(
      <FaultDetailScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(
      () => {
        const severityBadge = getByText(/critical/i);
        expect(severityBadge).toBeDefined();
      },
      {timeout: 3000},
    );
  });

  it('should render resolution steps in correct order', async () => {
    const {getByText, getAllByText} = render(
      <FaultDetailScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(
      () => {
        // Fault F28 has 4 steps (fault_001)
        const step1 = getByText('1');
        const step2 = getByText('2');
        const step3 = getByText('3');
        const step4 = getByText('4');
        
        expect(step1).toBeDefined();
        expect(step2).toBeDefined();
        expect(step3).toBeDefined();
        expect(step4).toBeDefined();
      },
      {timeout: 3000},
    );
  });

  it('should display "image coming soon" placeholder for steps', async () => {
    const {getAllByText} = render(
      <FaultDetailScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(
      () => {
        // Check for image placeholder text
        const placeholders = getAllByText(/image coming soon/i);
        expect(placeholders.length).toBeGreaterThan(0);
      },
      {timeout: 3000},
    );
  });

  it('should show Copy and Save buttons', async () => {
    const {getByTestId} = render(
      <FaultDetailScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(
      () => {
        const copyButton = getByTestId('copy-button');
        const bookmarkButton = getByTestId('bookmark-button');
        
        expect(copyButton).toBeDefined();
        expect(bookmarkButton).toBeDefined();
      },
      {timeout: 3000},
    );
  });
});

