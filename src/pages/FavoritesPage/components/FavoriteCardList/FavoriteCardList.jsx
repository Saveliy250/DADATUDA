import styles from './FavoriteCardList.module.css';

import { ArrowSubtitle } from '../../../../shared/components/ArrowSubtitle/ArrowSubtitle.jsx';
import { FavoriteCard } from '../FavoriteCard/FavoriteCard.jsx';

export const FavoriteCardList = ({ cardList, title, color, handleClick }) => {
    return (
        <>
            <ArrowSubtitle color={color} subtitle={title} />

            <div className={styles.cardList}>
                {cardList.map((item) => (
                    <FavoriteCard key={item.id} event={item} handleClick={() => handleClick(item)} />
                ))}
            </div>
        </>
    );
};
