import { MainDislikeButtonIcon } from '../../../shared/icons/MainDislikeButtonIcon.jsx';

export const MainPageDislikeButton = ({ controls, finishCard }) => {
    return (
        <button
            className="main-dislike-button"
            onClick={(e) => {
                e.stopPropagation();
                controls
                    .start({ x: -window.innerWidth, opacity: 0, transition: { duration: 0.25 } })
                    .then(() => finishCard(false));
            }}
        >
            <MainDislikeButtonIcon />
        </button>
    );
};
