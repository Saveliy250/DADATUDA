
const INIT_DATA = 'initData';

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

function toBase64Safe(str: string): string {
    try {
        return btoa(unescape(encodeURIComponent(str)));
    } catch {
        return btoa(str);
    }
}
function fromBase64Safe(b64: string): string {
    try {
        return decodeURIComponent(escape(atob(b64)));
    } catch {
        return atob(b64);
    }
}
function isProbablyBase64(v: string): boolean {
    if (!v || /[^A-Za-z0-9+/=]/.test(v)) return false;
    try {
        atob(v);
        return true;
    } catch {
        return false;
    }
}

export function saveInitData(raw: string): void {
    if (!raw) return;
    const b64 = isProbablyBase64(raw) ? raw : toBase64Safe(raw);
    localStorage.setItem(INIT_DATA, b64);
}

export function getInitData(): string | null {
    return localStorage.getItem(INIT_DATA);
}

export function getInitDataDecoded(): string | null {
    const v = localStorage.getItem(INIT_DATA);
    return v ? (isProbablyBase64(v) ? fromBase64Safe(v) : v) : null;
}
export function clearInitData(): void {
    localStorage.removeItem(INIT_DATA);
}