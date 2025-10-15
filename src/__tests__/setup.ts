import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = vi.fn();

// Mock import.meta.env
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_BASE_URL: 'https://api.dada-tuda.ru',
  },
});
