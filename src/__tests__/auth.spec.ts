import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loginWithInitData, loginWithCredentials, authenticate } from '../tools/api/api';
import { getInitData, clearInitData, saveTokens } from '../tools/storageHelpers';

// Mock storage helpers
vi.mock('../tools/storageHelpers', () => ({
  getInitData: vi.fn(),
  clearInitData: vi.fn(),
  saveTokens: vi.fn(),
}));

// Mock logger
vi.mock('../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Auth Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loginWithInitData', () => {
    it('should successfully login with valid initData', async () => {
      const mockResponse = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-456',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await loginWithInitData('test-init-data');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.dada-tuda.ru/api/v1/users/auth/initData?initData=dGVzdC1pbml0LWRhdGE%3D',
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }
      );

      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      });
    });

    it('should throw error when initData login fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Invalid initData'),
      });

      await expect(loginWithInitData('invalid-init-data')).rejects.toThrow('Invalid initData');
    });

    it('should throw error when response is missing tokens', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await expect(loginWithInitData('test-init-data')).rejects.toThrow('Invalid response: missing tokens');
    });
  });

  describe('loginWithCredentials', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-456',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await loginWithCredentials('testuser', 'testpass');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.dada-tuda.ru/api/v1/users/auth',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ username: 'testuser', password: 'testpass' }),
        }
      );

      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      });
    });

    it('should throw error when credentials login fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Invalid credentials'),
      });

      await expect(loginWithCredentials('wronguser', 'wrongpass')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('authenticate', () => {
    it('should use initData when available and valid', async () => {
      (getInitData as any).mockReturnValue('valid-init-data');
      
      const mockResponse = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-456',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authenticate();

      expect(getInitData).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      });
    });

    it('should clear initData and fallback to credentials when initData fails', async () => {
      (getInitData as any).mockReturnValue('invalid-init-data');
      
      // First call fails (initData)
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Invalid initData'),
      });

      // Second call succeeds (credentials)
      const mockResponse = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-456',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authenticate({ username: 'testuser', password: 'testpass' });

      expect(clearInitData).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      });
    });

    it('should use credentials when no initData available', async () => {
      (getInitData as any).mockReturnValue(null);
      
      const mockResponse = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-456',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authenticate({ username: 'testuser', password: 'testpass' });

      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      });
    });

    it('should throw error when no valid authentication method available', async () => {
      (getInitData as any).mockReturnValue(null);

      await expect(authenticate()).rejects.toThrow('No valid authentication method available');
    });
  });
});
