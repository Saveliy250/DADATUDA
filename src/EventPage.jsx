import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";

function EventPage() {
    const {eventId} = useParams();
    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`http://90.156.170.125:8080/event-service/api/v1/events/${eventId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error fetching event data.");
                }
                return response.json();
            })
            .then((data) => {
                setEventData(data);
                setLoading(false);
            })
        .catch((error) => {
            setError(error);
            setLoading(false);
        })
    }, [eventId]);

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error.message}</div>;

    return (
        <div className={"event-page"}>
            <div className="event-page-header"></div>
            <div className="event-page-content">
                <div className={'event-page-img-container'}><img
                    src={eventData.imageURL[0]}
                    alt={eventData.name}
                    className="event-page-img"
                />
                </div>
                <div className={'event-page-content-text'}>
                    <p>{eventData.name}</p>
                    
                </div>
            </div>
        </div>
    )

}

export default EventPage;