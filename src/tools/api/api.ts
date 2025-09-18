import { Event } from '../../shared/models/event';
import { getAccessToken, getInitData, getRefreshToken, saveTokens, clearTokens, clearInitData } from '../storageHelpers';
import { jwtDecode } from 'jwt-decode';
import { logger } from '../logger';

const BASE_URL: string = import.meta.env.VITE_BASE_URL;

let onLogoutCallback: (() => void) | null = null;

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface FeedbackPayload {
  eventId: string;
  like: boolean;
  viewedSeconds: number;
  moreOpened: boolean;
  referralLinkOpened: boolean;
  reported: boolean;
  starred: boolean;
  userId?: string;
}

// Helper to prefix relative paths with BASE_URL
const withBase = (path: string) => /^https?:\/\//i.test(path) ? path : `${BASE_URL}${path}`;

export async function registerUser(payload: string, initData?: string): Promise<void> {
    const saved = getInitData();
    const initDataToUse = initData ?? saved ?? '';
    const qs = `?initData=${encodeURIComponent(initDataToUse)}`;
    const resp = await fetch(`${BASE_URL}/api/v2/users/register${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: payload,
    });
    await ensureOk(resp, 'Ошибка при регистрации');
}

export async function loginWithInitData(initData: string): Promise<Tokens> {
    const url = `${BASE_URL}/api/v1/users/auth/initData?initData=${encodeURIComponent(initData)}`;
    const resp = await fetch(url, { 
        method: 'GET', 
        headers: { Accept: 'application/json' } 
    });
    
    if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(text || resp.statusText);
    }
    
    const data = await resp.json();
    const { access_token, refresh_token } = data as { access_token: string; refresh_token: string };
    
    if (!access_token || !refresh_token) {
        throw new Error('Invalid response: missing tokens');
    }
    
    return { accessToken: access_token, refreshToken: refresh_token };
}

export async function loginWithCredentials(username: string, password: string): Promise<Tokens> {
    const resp = await fetch(`${BASE_URL}/api/v1/users/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    
    if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(text || resp.statusText);
    }
    
    const data = await resp.json();
    const { access_token, refresh_token } = data as { access_token: string; refresh_token: string };
    
    if (!access_token || !refresh_token) {
        throw new Error('Invalid response: missing tokens');
    }
    
    return { accessToken: access_token, refreshToken: refresh_token };
}

export async function authenticate(params?: { username?: string; password?: string }): Promise<Tokens> {
    const initData = getInitData();
    
    if (initData && initData.trim()) {
        try {
            return await loginWithInitData(initData);
        } catch (error) {
            logger.error(error, 'initData login failed, clearing init-data');
            clearInitData();
        }
    }
    
    if (params?.username && params?.password) {
        return await loginWithCredentials(params.username, params.password);
    }
    
    throw new Error('No valid authentication method available');
}




async function ensureOk(response: Response, what: string): Promise<void> {
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`${what}: ${text || response.statusText} (HTTP ${response.status})`);
    }
}


export function setOnLogoutCallback(callback: () => void): void {
  onLogoutCallback = callback;
}

export async function authFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const accessToken = getAccessToken();
  
  const headers = new Headers(init.headers);
  
  // Set Content-Type only if body is a string and header not already set
  if (init.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  
  const fullUrl = withBase(path);
  const response = await fetch(fullUrl, {
    ...init,
    headers,
  });
  
  // Handle 401 with retry logic
  if (response.status === 401) {
    const initData = getInitData();
    
    if (initData && initData.trim()) {
      try {
        logger.info('401 received, attempting initData re-login');
        const tokens = await loginWithInitData(initData);
        saveTokens(tokens.accessToken, tokens.refreshToken);
        
        // Retry the original request with new token
        const retryHeaders = new Headers(init.headers);
        if (init.body && typeof init.body === 'string' && !retryHeaders.has('Content-Type')) {
          retryHeaders.set('Content-Type', 'application/json');
        }
        retryHeaders.set('Authorization', `Bearer ${tokens.accessToken}`);
        
        const retryResponse = await fetch(fullUrl, {
          ...init,
          headers: retryHeaders,
        });
        
        if (retryResponse.status === 401) {
          logger.error('Retry also returned 401, logging out');
          if (onLogoutCallback) {
            onLogoutCallback();
          }
          clearTokens();
          const errorText = await retryResponse.text().catch(() => '');
          throw new Error(`Authentication failed: ${errorText}`);
        }
        
        // Process successful retry response
        if (retryResponse.status === 204 || retryResponse.headers.get('Content-Length') === '0') {
          return null as T;
        }
        
        const contentType = retryResponse.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          return retryResponse.json() as Promise<T>;
        } else {
          await retryResponse.text();
          return null as T;
        }
      } catch (error) {
        logger.error(error, 'initData re-login failed');
        clearInitData();
        if (onLogoutCallback) {
          onLogoutCallback();
        }
        clearTokens();
        throw error;
      }
    } else {
      logger.error('401 received but no initData available for retry');
      if (onLogoutCallback) {
        onLogoutCallback();
      }
      clearTokens();
      const errorText = await response.text().catch(() => '');
      throw new Error(`Authentication failed: ${errorText}`);
    }
  }
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Request failed: ${errorText}`);
  }
  
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return null as T;
  }
  
  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  } else {
    await response.text();
    return null as T;
  }
}

export async function eventForUser(
  pageSize = 0,
  categories = '',
  search = '',
  price_min: number | undefined = undefined,
  price_max: number | undefined = undefined,
  start_date_time = '',
  end_date_time = '',
  pageNumber = 1,
): Promise<Event[]> {
  const params = new URLSearchParams();

  if (pageSize) {
    params.set('page_size', String(pageSize));
  }

  if (pageNumber) {
    params.set('page_number', String(pageNumber));
  }

  if (categories.length) {
    params.set('categories', categories);
  }

  if (search) {
    params.set('search', search);
  }

  if (price_min !== undefined) {
    params.set('price_min', String(price_min));
  }

  if (price_max !== undefined) {
    params.set('price_max', String(price_max));
  }

  if (start_date_time) {
    params.set('start_date_time', start_date_time);
  }

  if (end_date_time) {
    params.set('end_date_time', end_date_time);
  }

  const queryString = params.toString();
  const path = `/api/v3/events/for?${queryString}`;
  logger.info('API Request URL:', withBase(path));

  return authFetch(path, { method: 'GET' });
}


export async function getShortlist(pageSize: number, pageNumber: number): Promise<Event[]> {
  return authFetch(`/api/v3/shortlist?page_size=${pageSize}&page_number=${pageNumber}`, { method: 'GET' });
}

const getUserId = (): string | null => {
  const token = getAccessToken();
  if (!token) {
    return null;
  }
  try {
    const decoded: { sub: string } = jwtDecode(token);
    return decoded.sub;
  } catch (error) {
    console.error('Failed to decode token', error);
    return null;
  }
};

export const sendFeedback = async (
  eventId: string,
  like: boolean,
  viewedSeconds: number,
  moreOpened: boolean,
  refClicked: boolean,
  starred: boolean = false,
): Promise<void> => {
  const userId = getUserId();

  const data: FeedbackPayload = {
    eventId,
    like,
    viewedSeconds,
    moreOpened,
    referralLinkOpened: refClicked,
    reported: false,
    starred,
    userId: userId ?? undefined,
  };

  return authFetch<void>(`/api/v3/feedback`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export async function toggleFavorite(starred: boolean, id: string): Promise<void> {
  const newFavorite = !starred;

  return authFetch<void>(`/api/v3/feedback/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      starred: newFavorite,
    }),
  });
}

export async function fetchEvent(eventId: string): Promise<Event | null> {
  return authFetch<Event>(`/api/v1/events/${eventId}`, { method: 'GET' });
}

// Re-export storage helpers for convenience
export { clearInitData } from '../storageHelpers';
