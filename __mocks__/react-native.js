/**
 * Mock for react-native
 * Extends the default mock with Start.io module mocks
 */

const RN = jest.requireActual('react-native');

// Mock Start.io native modules
RN.NativeModules.StartIOAdModule = {
  initialize: jest.fn(() => Promise.resolve()),
  loadInterstitial: jest.fn(() => Promise.resolve()),
  showInterstitial: jest.fn(() => Promise.resolve()),
};

// Mock Start.io banner view component
RN.requireNativeComponent = jest.fn((componentName) => {
  if (componentName === 'StartIOBannerView') {
    return jest.fn(() => null);
  }
  return jest.requireActual('react-native').requireNativeComponent(componentName);
});

module.exports = RN;
