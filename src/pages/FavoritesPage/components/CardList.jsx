import { ArrowSubtitle } from '../../../shared/components/ArrowSubtitle.jsx';
import { FavoriteCardItem } from './FavoriteCardItem.jsx';

export const CardList = ({ cardList, title, color, handleClick }) => {
    return (
        <>
            <ArrowSubtitle color={color} subtitle={title} />
            <div className="liked-cards">
                {cardList.map((item) => (
                    <FavoriteCardItem key={item.id} event={item} handleClick={() => handleClick(item)} />
                ))}
            </div>
        </>
    );
};
