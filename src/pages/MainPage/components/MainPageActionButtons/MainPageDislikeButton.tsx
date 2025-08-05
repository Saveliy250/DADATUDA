import React from 'react';
import styles from './MainPageActionButton.module.css';
import { CrossIcon } from '../../../../shared/icons/MainPage/CrossIcon';
import { AnimationControls } from 'framer-motion';

interface MainPageDislikeButtonProps {
    controls: AnimationControls;
    finishCard: (liked: boolean) => void;
}

export const MainPageDislikeButton = ({ controls, finishCard }: MainPageDislikeButtonProps) => {
    return (
        <button
            className={styles.actionButton}
            onClick={(e) => {
                e.stopPropagation();
                void controls
                    .start({ x: -window.innerWidth, opacity: 0, transition: { duration: 0.25 } })
                    .then(() => finishCard(false));
            }}
        >
            <CrossIcon />
        </button>
    );
};
