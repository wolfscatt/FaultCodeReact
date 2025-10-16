// Jest setup file
// Suppress specific console warnings in tests

const originalError = console.error;

beforeAll(() => {
  console.error = (...args) => {
    // Suppress act() warnings - these are non-critical warnings in test environment
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to') &&
      args[0].includes('inside a test was not wrapped in act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

