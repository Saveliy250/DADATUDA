import React, { useState } from 'react';
import styles from './FavoriteCard.module.css';
import { useNavigate } from 'react-router-dom';
import type { FavoritePageEvent } from '../../types';
import { writeCachedFeedback } from '../../../../tools/feedbackCache';

interface FavoriteCardProps {
  event: FavoritePageEvent;
  onStarClick: (eventId: string | number) => void;
  onDislike: (eventId: string | number) => void;
}

import { formatEventDateTime } from '../../../../tools/FormatDate';

export const FavoriteCard = ({ event, onStarClick, onDislike }: FavoriteCardProps) => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const goDetails = () => {
    writeCachedFeedback(String(event.id), { starred: event.starred });
    navigate(`/events/${event.id}`);
  };

  const { date: ddmm, time: hhmm } = {
    date: event.formattedDate ?? formatEventDateTime(event.date).date,
    time: event.formattedTime ?? formatEventDateTime(event.date).time,
  };

  return (
    <div className={styles.card} onClick={goDetails}>
      <div className={styles.media}>
        <div className={styles.imageFrame}>
          <img
            src={event.imageURL?.[0] ?? ''}
            alt={event.name}
            className={styles.cardImg}
          />
        </div>
      </div>

      <button
        type="button"
        className={styles.starButton}
        aria-label={event.starred ? 'Убрать из избранного' : 'В избранное'}
        onClick={(e) => {
          e.stopPropagation();
          onStarClick(event.id);
        }}
      >
        <img
          src={event.starred ? '/img/star-en.svg' : '/img/star-dis.svg'}
          alt=""
          className={styles.starImg}
        />
      </button>

      <div className={styles.cardContent}>
        <p className={styles.cardTitle}>{event.name}</p>
        <p className={styles.cardVenue}>{event.address}</p>

        <div className={styles.bottomRow}>
          <div className={styles.dateContainer}>
            <span>{ddmm}</span>
            <span>{hhmm}</span>
          </div>

          <div
            className={styles.likesContainer}
            onClick={(e) => {
              e.stopPropagation();
              setConfirmOpen(true);
            }}
            role="button"
            aria-label="Убрать лайк"
            tabIndex={0}
            title="Убрать лайк"
          >
            <img src="/img/черный лайк.svg" className={styles.heartIcon} alt="Лайк" />
            {/* <div className={styles.likesCounter}>{formatLikesCount(event.likesCount)}</div> */}
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div className={styles.modalOverlay} onClick={() => setConfirmOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setConfirmOpen(false)}
              aria-label="Закрыть"
              title="Закрыть"
            >
              <img src="/img/кнопка 1.svg" alt="" className={styles.modalCloseIcon} />
            </button>

            <div className={styles.modalText}>Вы уверены, что хотите удалить мероприятие?</div>

            <div className={styles.modalButtons}>
              <button
                type="button"
                className={styles.modalBtnYes}
                onClick={() => {
                  setConfirmOpen(false);
                  onDislike(event.id);
                }}
              >
                Да
              </button>
              <button
                type="button"
                className={styles.modalBtnNo}
                onClick={() => setConfirmOpen(false)}
              >
                Нет
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
