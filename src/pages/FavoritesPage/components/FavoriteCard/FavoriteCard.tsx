import React from 'react';

import styles from './FavoriteCard.module.css';

import { formatDate } from '../../../../tools/FormatDate';

import { useNavigate } from 'react-router-dom';

import { FavoriteButtonFilled } from '../../../../shared/icons/FavoriteButtonFilled';
import { FavoriteButtonBlank } from '../../../../shared/icons/FavoriteButtonBlank';
import { TrashButton } from '../../../../shared/icons/TrashButton';

import { Event } from '../../../../shared/models/event';

interface FavoriteCardProps {
    event: Event;
    handleClick: (event: Event) => void;
}

export const FavoriteCard = ({ event, handleClick }: FavoriteCardProps) => {
    const navigate = useNavigate();

    const formattedDate: string = formatDate(new Date(event.date));
    const [datePart, timePart] = formattedDate.split(' ');

    const handleNavigate = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();

        const target = e.target as HTMLElement;

        if (!target.closest(`.${styles.favoriteButton}`) && !target.closest(`.${styles.trashButton}`)) {
            void navigate(`/events/${event.id}`);
        }
    };

    return (
        <div onClick={handleNavigate} className={styles.card}>
            <div className={styles.cardWrapper}>
                <img src={event.imageURL[event.imageURL.length - 1]} alt={event.name} className={styles.cardImg} />
                {event.starred ? (
                    <FavoriteButtonFilled handleClick={() => handleClick(event)} className={styles.favoriteButton} />
                ) : (
                    <FavoriteButtonBlank handleClick={() => handleClick(event)} className={styles.favoriteButton} />
                )}

                <TrashButton className={styles.trashButton} />

                <p className={styles.favoriteDates}>
                    {datePart}
                    <br />
                    {timePart}
                </p>
            </div>
            <div className={styles.cardContent}>
                <p className={styles.cardTitle}>{event.name}</p>
                <p className={styles.cardAddress}>{event.address}</p>
            </div>
        </div>
    );
};
