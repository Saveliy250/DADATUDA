const BASE_URL = "https://api.dada-tuda.ru";

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
    return response.json();
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
        eventId: eventId,
        like: like,
        viewedSeconds: 5,
        moreOpened: false,
        reported: false,
        userId: userId,
    };
    return post(`/api/v1/feedback`);
}