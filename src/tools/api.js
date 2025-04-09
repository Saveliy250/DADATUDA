
const BASE_URL = "https://api.dada-tuda.ru";

export async function loginUser(username, password) {

    const data = {
        client_id: "service-client",
        client_secret: "qYz5m2pnIQAW1dWjqzPsRirfD3rdYGh3",
        grant_type:"password",
        username: username,
        password: password
    }
    const formBody = new URLSearchParams(data).toString();

    const response = await fetch('https://auth.dada-tuda.ru/realms/master/protocol/openid-connect/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
        },
        body: formBody,
    })
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка при аутентификации: ${errorText}`);
    }
    const resp = await response.json();
    const {access_token, refresh_token} = resp;
    return {accessToken: access_token, refreshToken: refresh_token};
}

export function getAccessToken() {
    return localStorage.getItem("access-token");
}

export function getRefreshToken() {
    return localStorage.getItem("refresh-token");
}

export function saveTokens(accessToken, refreshToken) {
    localStorage.setItem("access-token", accessToken);
    localStorage.setItem("refresh-token", refreshToken);
}

export function clearTokens() {
    localStorage.removeItem("access-token");
    localStorage.removeItem("refresh-token");
}

async function get(path) {
    const response = await fetch(`${BASE_URL}${path}`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка GET ${path}: ${errorText} - ${response.status}`);
    }
    return response.json();
}

async function post(path, data) {
    const response = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка POST ${path}: ${errorText} - ${response.status}`)
    }
    return response.text();
}
let onLogoutCallback = null;

export function setOnLogoutCallback(callback) {
    onLogoutCallback = callback;
}

export async function authFetch(path, options = {}) {
    const accessToken = getAccessToken();
    console.log(accessToken);
    const refreshToken = getRefreshToken();

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }
    if (refreshToken) {
        headers["X-Refresh-Token"] = refreshToken;
    }
    console.log(headers);
        const response = await fetch(path, {
            ...options,
            headers,
        });
        const newAccessToken = response.headers.get("Access-Token");
        const newRefreshToken = response.headers.get("Refresh-Token");

        if (newRefreshToken && newAccessToken) {
            saveTokens(newAccessToken, newRefreshToken);
        }

        if (!response.ok) {
            if (response.status === 401 && onLogoutCallback) {
                onLogoutCallback();
            }
            const errorText = await response.text()
            throw new Error(`Ошибка в авторизованном запросе: ${errorText}`);
        }

        return response.json();
}

export async function eventForUser(pageSize = 0, categories = '') {
    const params = new URLSearchParams();
    if (pageSize) {
        params.set('page_size', pageSize);
    }
    if (categories) {
        params.set('categories', categories);
    }
    const queryString = params.toString();
    return authFetch(`${BASE_URL}/api/v3/events/for?${queryString}`, {method: "GET"})
}

// ================================================================
// Случайное событие, позже переделать в получение для пользователя
// ================================================================

export async function fetchRandomEvent(categories = '') {
    const query = categories ? `?categories=${categories}` : '';
    return get(`/api/v1/events/random${query}`)
}

// ======================================================================
// Получение шортлиста по айдишнику пользователя, позже через авторизацию
// ======================================================================

export async function getShortlist(userId, pageSize, pageNumber) {
    return get(`/api/v1/shortlist/${userId}?page_size=${pageSize}&page_number=${pageNumber}`)
}

// =====================================
// Отправка фидбэка пока без авторизации
// =====================================

export async function sendFeedback(userId, like, eventId){
    const data = {
        "eventId": eventId,
        "like": like,
        "viewedSeconds": 5,
        "moreOpened": false,
        "reported": false,
        "starred": false,
        "userId": userId
    };
    return post(`/api/v1/feedback`, data);
}