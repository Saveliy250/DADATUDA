import { Event } from '../../shared/models/event';
import { getAccessToken, getRefreshToken, saveTokens } from '../storageHelpers';
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

export async function registerUser(payload: string, initData?: string): Promise<void> {
    const qs = initData ? `?initData=${encodeURIComponent(initData)}` : '';
    const resp = await fetch(`${BASE_URL}/api/v2/users/register${qs}`, {
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

export async function loginWithInitData(initData: string): Promise<Tokens> {
    const url = `${BASE_URL}/api/v1/users/auth/initData?initData=${encodeURIComponent(initData)}`

    const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
    })
    await ensureOk(response, 'Ошибка входа по initData');

    const resp = await response.json();
    const { access_token, refresh_token } = resp as { access_token: string; refresh_token: string };

    return { accessToken: access_token, refreshToken: refresh_token };
}





async function ensureOk(response: Response, what: string): Promise<void> {
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`${what}: ${text || response.statusText} (HTTP ${response.status})`);
    }
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

export async function eventForUser(pageSize = 0, categories = ''): Promise<Event[]> {
    const params = new URLSearchParams();

    if (pageSize) {
        params.set('page_size', String(pageSize));
    }

    if (categories) {
        params.set('categories', categories);
    }

    const queryString = params.toString();

    return authFetch(`${BASE_URL}/api/v3/events/for?${queryString}`, { method: 'GET' });
}

export async function fetchRandomEvent(categories = ''): Promise<Event> {
    const query = categories ? `?categories=${categories}` : '';
    return get(`/api/v1/events/random${query}`);
}

export async function getShortlist(pageSize: number, pageNumber: number): Promise<Event[]> {
    return authFetch(`${BASE_URL}/api/v3/shortlist?page_size=${pageSize}&page_number=${pageNumber}`, { method: 'GET' });
}

export async function sendFeedback(
    eventId: string,
    like: boolean,
    viewedSeconds: number,
    moreOpened: boolean,
    refClicked: boolean,
): Promise<void> {
    const data: Feedback = {
        eventId: eventId,
        like: like,
        viewedSeconds: viewedSeconds,
        moreOpened: moreOpened,
        referralLinkOpened: refClicked,
        reported: false,
        starred: false,
        userId: 'stringi',
    };

    return authFetch<void>(`${BASE_URL}/api/v3/feedback`, { method: 'POST', body: JSON.stringify(data) });
}

export async function toggleFavorite(isFavorite: boolean, id: string): Promise<void> {
    const newFavorite = !isFavorite;

    return authFetch<void>(`${BASE_URL}/api/v3/feedback/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
            starred: newFavorite,
        }),
    });
}
