import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerUser } from '../tools/api/api';
import { getInitData } from '../tools/storageHelpers';

// Mock storage helpers
vi.mock('../tools/storageHelpers', () => ({
  getInitData: vi.fn(),
}));

describe('registerUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should register with initData from storage', async () => {
    (getInitData as any).mockReturnValue('stored-init-data');
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
    });

    await registerUser(JSON.stringify({ username: 'testuser', password: 'testpass' }));

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.dada-tuda.ru/api/v2/users/register?initData=c3RvcmVkLWluaXQtZGF0YQ%3D%3D',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'testpass' }),
      }
    );
  });

  it('should register with provided initData parameter', async () => {
    (getInitData as any).mockReturnValue('stored-init-data');
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
    });

    await registerUser(
      JSON.stringify({ username: 'testuser', password: 'testpass' }),
      'provided-init-data'
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.dada-tuda.ru/api/v2/users/register?initData=cHJvdmlkZWQtaW5pdC1kYXRh',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'testpass' }),
      }
    );
  });

  it('should register with empty initData when none available', async () => {
    (getInitData as any).mockReturnValue(null);
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
    });

    await registerUser(JSON.stringify({ username: 'testuser', password: 'testpass' }));

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.dada-tuda.ru/api/v2/users/register?initData=',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'testpass' }),
      }
    );
  });

  it('should always include initData parameter even when empty', async () => {
    (getInitData as any).mockReturnValue('');
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
    });

    await registerUser(JSON.stringify({ username: 'testuser', password: 'testpass' }));

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.dada-tuda.ru/api/v2/users/register?initData=',
      expect.any(Object)
    );
  });

  it('should throw error when registration fails', async () => {
    (getInitData as any).mockReturnValue('test-init-data');
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: () => Promise.resolve('Username already exists'),
    });

    await expect(
      registerUser(JSON.stringify({ username: 'existinguser', password: 'testpass' }))
    ).rejects.toThrow('Ошибка при регистрации: Username already exists (HTTP 400)');
  });
});
