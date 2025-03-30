import React, {useState} from "react";
import "./MainScreenStyle.css"
import formatDate from "../src/tools/FormatDate.jsx"
import MainFavoriteButtonIco from "./icons/MainFavoriteButtonIco.jsx";
import MainDislikeButtonIco from "./icons/MainDislikeButtonIco.jsx";
import ConcertIcon from "./icons/ConcertIcon.jsx";
import TheatreIcon from "./icons/TheatreIcon.jsx";
import ExhibitionIco from "./icons/ExhibitionIco.jsx";
import ExcursionIco from "./icons/ExcursionIco.jsx";
import BarIco from "./icons/BarIco.jsx";
import RestaurantIco from "./icons/RestaurantIco.jsx";
import SportIco from "./icons/SportIco.jsx";
import StandupIco from "./icons/StandupIco.jsx";
import CafeIco from "./icons/CafeIco.jsx";
import RoundBackArrowIco from "./icons/RoundBackArrowIco.jsx";
import TheaterIcon from "./icons/TheatreIcon.jsx";


const CategoryIcons = {
    concert: [ConcertIcon, "Концерт"],
    theatre: [TheatreIcon, "Спектакль"],
    exhibition: [ExhibitionIco, "Выставка"],
    excursion: [ExcursionIco, "Экскурсия"],
    bar: [BarIco, "Бар"],
    restaurant: [RestaurantIco, "Ресторан"],
    sport: [SportIco, "Спорт"],
    standup: [StandupIco, "Стендап"],
    cafe: [CafeIco, "Кафе"],
}

function MainCard({event, onSwipeLeft, onSwipeRight, onLike, onDisLike}) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const formattedDate = formatDate(event.date)
    const [datePart, timePart] = formattedDate.split(' ')

    const handleNextSlide = () => {
        setCurrentSlide((prev) => {
            const next = prev + 1;
            return next < event.imageURL.length ? next : 0;
        })
    }

    const handleLike = () => {
        onLike(event);
    }
    const handleDisLike = () => {
        onDisLike(event);
    }

    // Позже добавить обработчик свайпа
    return (
        <div className="MainCard" onClick={handleNextSlide}>
            <div className={"main-card-img-wrapper"} >
                <img
                    src={"https://cs6.pikabu.ru/post_img/big/2015/06/08/3/1433735650_472905306.jpg"}
                    alt={event.name}
                    className="main-card-img"
                />
                <div className={"main-card-category"}>{event.categories[0]}</div>
                <div className={"main-category-ico"}><TheaterIcon/></div>
                <div className={"main-card-content"}>
                    <div className={"main-card-name-flex"}>
                        <RoundBackArrowIco/>
                        <p className={"main-card-name"}>{event.name}</p>
                    </div>
                    <p className={"main-card-address"}>{event.address}</p>
                    <p className={"main-card-date"}>Ближайшее {datePart} {timePart}</p>
                    <p className={"main-card-price"}>{event.price}</p>
                </div>
                <button className={"main-like-button"} onClick={(e) => {
                    e.stopPropagation();
                    handleLike();
                }}><MainFavoriteButtonIco/>
                </button>
                <button className={"main-dislike-button"} onClick={(e) => {
                    e.stopPropagation();
                    handleDisLike();
                }}>
                    <MainDislikeButtonIco/>
                </button>
            </div>

        </div>
    )
}

export default MainCard;