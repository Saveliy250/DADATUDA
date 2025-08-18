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

export function getInitData(): string | null {
    return localStorage.getItem('initData');
}
export function saveInitData(value: string): void {
    localStorage.setItem('initData', value);
}
export function clearInitData(): void {
    localStorage.removeItem('initData');
}