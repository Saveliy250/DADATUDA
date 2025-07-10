import { TheaterIcon } from '../../../../shared/icons/TheatreIcon.jsx';
import { RoundBackArrowIcon } from '../../../../shared/icons/RoundBackArrowIcon.jsx';
import { MainFavoriteButtonIcon } from '../../../../shared/icons/MainFavoriteButtonIcon.jsx';
import { MainDislikeButtonIcon } from '../../../../shared/icons/MainDislikeButtonIcon.jsx';

export const DefaultCard = () => {
    return (
        <div className="mainCard">
            <div className="main-card-img-wrapper">
                <img src="/img/loading.webp" alt="default" className="main-card-img" />
                <div className="main-card-category"></div>
                <div className="main-category-ico">
                    <TheaterIcon />
                </div>
                <div className="main-card-content">
                    <div className="main-card-name-flex">
                        <RoundBackArrowIcon />
                        <p className="main-card-name"></p>
                    </div>
                    <p className="main-card-address"></p>
                    <p className="main-card-date"></p>
                    <p className="main-card-price"></p>
                </div>
                <button className="main-like-button">
                    <MainFavoriteButtonIcon />
                </button>
                <button className="main-dislike-button">
                    <MainDislikeButtonIcon />
                </button>
            </div>
        </div>
    );
};
