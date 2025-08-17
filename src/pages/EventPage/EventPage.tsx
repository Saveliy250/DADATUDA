import React, { useEffect, useRef, useState } from 'react';
import styles from './EventPage.module.css';
import { Link, useParams } from 'react-router-dom';
import { WhiteLogoIcon } from '../../shared/icons/WhiteLogoIcon';
import { ArrowSubtitle } from '../../shared/components/ArrowSubtitle/ArrowSubtitle';
import { Event } from '../../shared/models/event';
import { sendFeedback } from '../../tools/api';
import { readCachedFeedback, writeCachedFeedback } from '../../tools/feedbackCache';

export const EventPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [eventData, setEventData] = useState<Event | null>(null);
  const [noEvent, setNoEvent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const start = useRef<number>(Date.now());
  const [refClicked, setRefClicked] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (!eventId) return;

      const sessionSeconds = Math.round((Date.now() - start.current) / 1000);
      const cached = readCachedFeedback(String(eventId));

      const nothingToReport = sessionSeconds === 0 && !refClicked;
      if (nothingToReport) return;

      const like = cached.like === false ? false : true;
      const totalSeconds = (cached.viewedSeconds ?? 0) + sessionSeconds;
      const referral = (cached.referralLinkOpened ?? false) || refClicked;
      const starred = cached.starred ?? false;

      sendFeedback(String(eventId), like, totalSeconds, true, referral, starred)
        .then(() => {
          writeCachedFeedback(String(eventId), {
            viewedSeconds: sessionSeconds,
            moreOpened: true,
            referralLinkOpened: refClicked,
            like,
            starred,
          });
        })
        .catch(console.warn);
    };
  }, [eventId, refClicked]);

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
                    onClick={() => setRefClicked(true)}
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
