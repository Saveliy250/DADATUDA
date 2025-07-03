import { formatDate } from '../../../tools/FormatDate.jsx';

import { FavoriteButtonFilled } from '../../../shared/icons/FavoriteButtonFilled.jsx';
import { FavoriteButtonBlank } from '../../../shared/icons/FavoriteButtonBlank.jsx';
import { TrashButton } from '../../../shared/icons/TrashButton.jsx';

export const FavoriteCardItem = ({ event, handleClick }) => {
    const formattedDate = formatDate(event.date);
    const [datePart, timePart] = formattedDate.split(' ');

    return (
        <div className="liked-card">
            <div className="liked-card-img-wrapper">
                <img src={event.imageURL[event.imageURL.length - 1]} alt={event.name} className={'liked-card-img'} />
                {event.isFavorite ? (
                    <FavoriteButtonFilled handleClick={() => handleClick(event)} className="favorite-button" />
                ) : (
                    <FavoriteButtonBlank handleClick={() => handleClick(event)} className="favorite-button" />
                )}
                <TrashButton className="trash-button" />
                <p className="liked-card-date">
                    {datePart}
                    <br />
                    {timePart}
                </p>
            </div>
            <div className="liked-card-content">
                <p className="liked-card-title">{event.name}</p>
                <p className="liked-card-address">{event.address}</p>
            </div>
        </div>
    );
};
