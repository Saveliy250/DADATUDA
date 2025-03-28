

const sendFeedback = async (userId, like, eventId) => {
    const url = 'http://90.156.170.125:8080/feedback-service/feedback';
    const data = {
        eventId: eventId,
        like: like,
        viewedSeconds: 5,
        moreOpened: false,
        reported: false,
        userId: userId,
    }
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Vary': 'Origin',


            }

        })
        const result = await response.json();
        console.log(result);
        if (result.ok) {
            alert("Отзыв отправлен успешно!")
        } else {
            const errorData = await response.json();
            throw new Error(`Error: ${response.status} - ${errorData.message || 'Unknown error'} - ${errorData}`);
        }
    } catch (error) {
        console.error('Ошибка при отправке:', error);
        if (error.response) {
            console.error('Тело ошибки:', await error.response.text());
        }
    }
}
export default sendFeedback;