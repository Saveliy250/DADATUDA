import React, { useEffect, useState } from 'react';
import styles from './EventPage.module.css';
import { Link, useParams } from 'react-router-dom';
import { WhiteLogoIcon } from '../../shared/icons/WhiteLogoIcon';
import { ArrowSubtitle } from '../../shared/components/ArrowSubtitle/ArrowSubtitle';
import { Event } from '../../shared/models/event';

export const EventPage = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [eventData, setEventData] = useState<Event | null>(null);
    const [noEvent, setNoEvent] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

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
                return response.json() as Promise<Event>;
            })
            .then((data) => {
                if (data) {
                    setEventData(data);
                }
                setLoading(false);
            })
            .catch((error) => {
                if (error instanceof Error) {
                    setError(error);
                } else {
                    setError(new Error(String(error)));
                }
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
    if (error) return <div>Ошибка: {error.message}</div>;

    return (
        <>
            {eventData && (
                <>
                    <div className={styles.logo}>
                        <WhiteLogoIcon />
                    </div>

                    <div className={styles.eventWrapper}>
                        <div className={styles.event}>
                            <div className={styles.eventImgWrapper}>
                                <img src={eventData.imageURL[0]} alt={eventData.name} className={styles.eventImg} />
                            </div>

                            <div className={styles.eventContentWrapper}>
                                <div className={styles.eventName}>
                                    <ArrowSubtitle
                                        color="#ECFE54"
                                        subtitle={eventData.name}
                                        className={styles.eventNameTitle}
                                    />
                                </div>

                                <div className={styles.eventDescription}>
                                    О мероприятии: <br />
                                    {eventData.description}
                                </div>
                                <div className={styles.eventLink}>
                                    <ArrowSubtitle withText={false} color="#ECFE54" />

                                    <a
                                        className={styles.eventButton}
                                        href={`${eventData.referralLink}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Перейти на сайт мероприятия
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};
