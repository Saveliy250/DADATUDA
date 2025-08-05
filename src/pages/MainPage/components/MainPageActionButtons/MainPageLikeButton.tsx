import React from 'react';
import styles from './MainPageActionButton.module.css';
import { HeartIcon } from '../../../../shared/icons/MainPage/HeartIcon';
import { AnimationControls } from 'framer-motion';

interface MainPageLikeButtonProps {
    controls: AnimationControls;
    finishCard: (liked: boolean) => void;
}

export const MainPageLikeButton: React.FC<MainPageLikeButtonProps> = ({ controls, finishCard }) => {
    return (
        <button
            className={styles.actionButton}
            onClick={(e) => {
                e.stopPropagation();
                void controls
                    .start({ x: window.innerWidth, opacity: 0, transition: { duration: 0.25 } })
                    .then(() => finishCard(true));
            }}
        >
            <HeartIcon />
        </button>
    );
};
