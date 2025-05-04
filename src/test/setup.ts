import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Import our firebase mocks
import '../__mocks__/firebase';

// Run cleanup after each test case
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});