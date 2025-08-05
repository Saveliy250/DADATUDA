import React from 'react';

import { TheaterIcon } from '../../../../shared/icons/EventIcons/TheaterIcon';
import { MainFavoriteButtonIcon } from '../../../../shared/icons/MainFavoriteButtonIcon';
import { MainDislikeButtonIcon } from '../../../../shared/icons/MainDislikeButtonIcon';

export const DefaultCard: React.FC = () => {
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
