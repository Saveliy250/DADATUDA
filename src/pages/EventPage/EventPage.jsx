import { useEffect, useState } from 'react';

import './eventPage.css';

import { Link, useParams } from 'react-router-dom';

import { WhiteLogoIcon } from '../../shared/icons/WhiteLogoIcon.jsx';
import { ArrowSubtitle } from '../../shared/components/ArrowSubtitle.jsx';

export const EventPage = () => {
    const { eventId } = useParams();
    const [eventData, setEventData] = useState(null);
    const [noEvent, setNoEvent] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`https://api.dada-tuda.ru/api/v1/events/${eventId}`)
            .then((response) => {
                if (response.status === 204) {
                    setNoEvent(true);
                    setLoading(false);
                    return;
                }
                if (!response.ok) {
                    throw new Error('Error fetching event data.');
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
            });
    }, [eventId]);
    if (noEvent)
        return (
            <div className={'eventPage-204'}>
                <p>Такого события нет</p>
                <Link to={'/'}>НА ГЛАВНУЮ</Link>
            </div>
        );

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error.code}</div>;

    return (
        <>
            <div className="event-page-logo">
                <WhiteLogoIcon />
            </div>
            <div className="event-page-content">
                <div className="event-page-img-wrapper">
                    <img src={eventData.imageURL[0]} alt={eventData.name} className="event-page-img" />
                </div>
                <div className="event-page-content-wrapper">
                    <div className="event-name">
                        <ArrowSubtitle color="#ECFE54" subtitle={eventData.name} className="event-name-title" />
                    </div>
                    <div className="event-description">
                        О мероприятии: <br />
                        {eventData.description}
                    </div>
                    <div className="event-description">
                        <ArrowSubtitle withText={false} color="#ECFE54" />
                        <a
                            className="event-button"
                            href={`${eventData.referralLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Перейти на сайт мероприятия
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};
