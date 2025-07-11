import styles from './FavoriteCard.module.css';

import { formatDate } from '../../../../tools/FormatDate.jsx';

import { useNavigate } from 'react-router-dom';

import { FavoriteButtonFilled } from '../../../../shared/icons/FavoriteButtonFilled.jsx';
import { FavoriteButtonBlank } from '../../../../shared/icons/FavoriteButtonBlank.jsx';
import { TrashButton } from '../../../../shared/icons/TrashButton.jsx';

export const FavoriteCard = ({ event, handleClick }) => {
    const navigate = useNavigate();

    const formattedDate = formatDate(event.date);
    const [datePart, timePart] = formattedDate.split(' ');

    const handleNavigate = (e) => {
        e.stopPropagation();

        if (!e.target.closest(`.${styles.favoriteButton}`) && !e.target.closest(`.${styles.trashButton}`)) {
            navigate(`/events/${event.id}`);
        }
    };

    return (
        <div onClick={handleNavigate} className={styles.card}>
            <div className={styles.cardWrapper}>
                <img src={event.imageURL[event.imageURL.length - 1]} alt={event.name} className={styles.cardImg} />
                {event.isFavorite ? (
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
