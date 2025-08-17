import { jwtDecode } from 'jwt-decode';
import { Event } from '../shared/models/event';
const BASE_URL: string = import.meta.env.VITE_BASE_URL;

let onLogoutCallback: (() => void) | null = null;

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface Feedback {
  eventId: string;
  like: boolean;
  viewedSeconds: number;
  moreOpened: boolean;
  referralLinkOpened: boolean;
  reported: boolean;
  starred: boolean;
  userId: string;
}

export async function registerUser(data: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/v2/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
    body: data,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка при регистрации: ${errorText}`);
  }
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

export function getAccessToken(): string | null {
  return localStorage.getItem('access-token');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh-token');
}

export function saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('access-token', accessToken);
  localStorage.setItem('refresh-token', refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem('access-token');
  localStorage.removeItem('refresh-token');
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка GET ${path}: ${errorText} - ${response.status}`);
  }

  return response.json() as Promise<T>;
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

export async function fetchRandomEvent(categories = ''): Promise<Event> {
  const query = categories ? `?categories=${categories}` : '';
  return get(`/api/v1/events/random${query}`);
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
  if (!userId) {
    console.error('Cannot send feedback without a user ID.');
    return;
  }

  const data: Feedback = {
    eventId,
    like,
    viewedSeconds,
    moreOpened,
    referralLinkOpened: refClicked,
    reported: false,
    starred,
    userId,
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
