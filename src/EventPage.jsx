import React, {useEffect, useState} from 'react';
import {Link, useParams} from "react-router-dom";
import "./EventPageStyle.css";
import WhiteLogoIco from "./icons/WhiteLogoIco.jsx";

function EventPage() {
    const {eventId} = useParams();
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
    if (noEvent) return (
        <div className={"eventPage-204"}>
            <p>Такого события нет</p>
            <Link to={'/'}>НА ГЛАВНУЮ</Link>
        </div>
    );
    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error.code}</div>;

    return (
        <>
            <div className="event-page-logo"><WhiteLogoIco/></div>
            <div className="event-page-content">
                <div className={'event-page-img-wrapper'}><img
                    src={eventData.imageURL[0]}
                    alt={eventData.name}
                    className="event-page-img"
                />
                </div>
                <div className={'event-page-content-wrapper'}>
                    <div className={"event-name"}>
                        <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.4745 18.7925L23.8558 18.7925" stroke="#ECFE54" strokeWidth="3.35446"/>
                            <path d="M19.0019 10.0492L26.0002 18.8338L19.0019 27.4502" stroke="#ECFE54" strokeWidth="3.35446" strokeLinejoin="round"/>
                            <path d="M25.9548 2H11.6037C-1.20125 2 -1.20122 18.7921 11.6037 18.7921H25.9548" stroke="#ECFE54" strokeWidth="3.35446"/>
                        </svg>
                        <p>{eventData.name}</p>
                    </div>
                    <div className={"event-description"}>О мероприятии: <br/>{eventData.description}</div>
                    <div className={"event-button-arrow"}>
                        <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.4745 18.7925L23.8558 18.7925" stroke="#ECFE54" strokeWidth="3.35446"/>
                            <path d="M19.0019 10.0492L26.0002 18.8338L19.0019 27.4502" stroke="#ECFE54" strokeWidth="3.35446" strokeLinejoin="round"/>
                            <path d="M25.9548 2H11.6037C-1.20125 2 -1.20122 18.7921 11.6037 18.7921H25.9548" stroke="#ECFE54" strokeWidth="3.35446"/>
                        </svg>
                        <a className={"event-button"} href={`${eventData.referralLink}`} target="_blank" rel="noopener noreferrer">Перейти на сайт мероприятия</a>
                    </div>
                </div>
            </div>
        </>
    )

}

export default EventPage;