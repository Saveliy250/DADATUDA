import React from "react";
import TheaterIcon from "./icons/TheatreIcon.jsx";
import RoundBackArrowIco from "./icons/RoundBackArrowIco.jsx";
import MainFavoriteButtonIco from "./icons/MainFavoriteButtonIco.jsx";
import MainDislikeButtonIco from "./icons/MainDislikeButtonIco.jsx";

const DefaultCard = () => {
    return (
        <div className="MainCard">
            <div className={"main-card-img-wrapper"} >
                <img
                    src=" /img/loading.webp"
                    alt="default"
                    className="main-card-img"
                />
                <div className={"main-card-category"}></div>
                <div className={"main-category-ico"}><TheaterIcon/></div>
                <div className={"main-card-content"}>
                    <div className={"main-card-name-flex"}>
                        <RoundBackArrowIco/>
                        <p className={"main-card-name"}></p>
                    </div>
                    <p className={"main-card-address"}></p>
                    <p className={"main-card-date"}></p>
                    <p className={"main-card-price"}></p>
                </div>
                <button className={"main-like-button"}><MainFavoriteButtonIco/>
                </button>
                <button className={"main-dislike-button"}>
                    <MainDislikeButtonIco/>
                </button>
            </div>

        </div>
    )
}
export default DefaultCard;