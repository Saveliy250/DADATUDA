import styles from './MainPageActionButton.module.css';

import { MainFavoriteButtonIcon } from '../../../../shared/icons/MainFavoriteButtonIcon.jsx';

export const MainPageLikeButton = ({ controls, finishCard }) => {
    return (
        <button
            className={styles.actionButton}
            onClick={(e) => {
                e.stopPropagation();
                controls
                    .start({ x: window.innerWidth, opacity: 0, transition: { duration: 0.25 } })
                    .then(() => finishCard(true));
            }}
        >
            <MainFavoriteButtonIcon />
        </button>
    );
};
