import { Event } from '../../shared/models/event';
import { getAccessToken, getInitData, getRefreshToken, saveTokens } from '../storageHelpers';
import { jwtDecode } from 'jwt-decode';
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

function toBase64Safe(str: string): string {
    try { return btoa(unescape(encodeURIComponent(str))); } catch { return btoa(str); }
}
function isProbablyBase64(v: string): boolean {
    if (!v || /[^A-Za-z0-9+/=]/.test(v)) return false;
    try { atob(v); return true; } catch { return false; }
}

export async function registerUser(payload: string): Promise<void> {
    const saved = getInitData();
    const b64 = saved && !isProbablyBase64(saved) ? toBase64Safe(saved) : saved;
    const qs = b64 ? `?initData=${encodeURIComponent(b64)}` : '';
    const resp = await fetch(`${BASE_URL}/api/v1/users/register${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: payload,
    });
    await ensureOk(resp, 'Ошибка при регистрации');
}

export async function loginUser(username?: string, password?: string): Promise<Tokens> {
  const data = {
    client_id: 'service-client',
    client_secret: 'qYz5m2pnIQAW1dWjqzPsRirfD3rdYGh3',
    grant_type: 'password',
    username: username || '',
    password: password || '',
  };

  const formBody = new URLSearchParams(data).toString();

  const response = await fetch('https://auth.dada-tuda.ru/realms/master/protocol/openid-connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: formBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка при аутентификации: ${errorText}`);
  }

  const resp = await response.json();
  const { access_token, refresh_token } = resp as { access_token: string; refresh_token: string };

  return { accessToken: access_token, refreshToken: refresh_token };
}

export async function loginUserV2(username?: string, password?: string) {
    if (username && password) return loginWithCredentials(username, password);
    const raw = getInitData();
    if (!raw) throw new Error('Нет данных для входа (ни логина/пароля, ни Telegram InitData).');
    return loginWithInitData(raw);
}

export async function loginWithInitData(initData: string): Promise<{
    access_token?: string | null;
    refresh_token?: string | null;
    expires_in?: number | null;
    refresh_expires_in?: number | null;
}> {
    const b64 = isProbablyBase64(initData) ? initData : toBase64Safe(initData);
    const url = `${BASE_URL}/api/v1/users/auth/initData?initData=${encodeURIComponent(b64)}`;
    const resp = await fetch(url, { method: 'POST', headers: { Accept: 'application/json' } });
    if (!resp.ok) {
        console.log("loginWithInitData success")
        const text = await resp.text().catch(() => '');
        throw new Error(text || resp.statusText);
    }
    return resp.json();
}

export async function loginWithCredentials(username: string, password: string) {
    const resp = await fetch(`${BASE_URL}/api/v1/users/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(text || resp.statusText);
    }
    return resp.json();
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

export async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (accessToken) {
    headers.set('Authorization', 'Bearer ' + accessToken);
  }

  if (refreshToken) {
    headers.set('X-Refresh-Token', refreshToken);
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const newAccessToken = response.headers.get('Access-Token');
  const newRefreshToken = response.headers.get('Refresh-Token');

  if (newRefreshToken && newAccessToken) {
    saveTokens(newAccessToken, newRefreshToken);
  }

  if (!response.ok) {
    if (response.status === 401 && onLogoutCallback) {
      onLogoutCallback();
    }

    const errorText = await response.text();
    throw new Error(`Ошибка в авторизованном запросе: ${errorText}`);
  }

  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return null as T;
  }

  return response.json() as Promise<T>;
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
  const fullUrl = `${BASE_URL}/api/v3/events/for?${queryString}`;
  console.log('API Request URL:', fullUrl);

  return authFetch(fullUrl, { method: 'GET' });
}


export async function getShortlist(pageSize: number, pageNumber: number): Promise<Event[]> {
  return authFetch(`${BASE_URL}/api/v3/shortlist?page_size=${pageSize}&page_number=${pageNumber}`, { method: 'GET' });
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

  return authFetch<void>(`${BASE_URL}/api/v3/feedback`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export async function toggleFavorite(starred: boolean, id: string): Promise<void> {
  const newFavorite = !starred;

  return authFetch<void>(`${BASE_URL}/api/v3/feedback/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      starred: newFavorite,
    }),
  });
}
