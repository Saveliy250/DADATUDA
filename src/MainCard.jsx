import React, {useState, useRef, useEffect} from "react";
import "./MainScreen.css"
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
import {cutWords} from "./tools/strings.js";
import {sendFeedback} from "./tools/api.js";


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

export function MainCard({event, onSwipeLeft, onSwipeRight, loadNext}) {
    const [slide , setSlide]      = useState(0);          // будущее слайд-шоу
    const [expanded, setExpanded] = useState(false);      // режим «подробнее»
    const [datePart,timePart] = formatDate(event.date).split(" ");
    const price = event.price !== '0' ? `${event.price} рублей` : "Бесплатно"
    const start = useRef(Date.now());
    const [moreOpened , setMoreOpened ] = useState(false);
    const [refClicked    , setRefClicked    ] = useState(false);

    function handleTap(){
        if (!expanded){
            setSlide( n => (n+1) % event.imageURL.length );
        }
    }

    function handleRefClicked(){
        setRefClicked(true)
    }

    function handleMoreOpened(){
        setMoreOpened(true);
    }

    useEffect(() => {
        start.current = Date.now();
    }, [event.id]);

    async function finishCard(like) {
        const viewedSeconds = Math.round((Date.now() - start.current)/1000);
        console.log(like, viewedSeconds, moreOpened, refClicked);
        try {
            await sendFeedback(event.id, like, viewedSeconds, moreOpened, refClicked);
        } catch (err) {
            console.warn(err);
        }
        loadNext();
    }

    // Позже добавить обработчик свайпа
    return (
        <div className="MainCard" >
            <div className={"main-card-img-wrapper"} >
                <img
                    src={event.imageURL[0]}
                    alt={event.name}
                    className="main-card-img"
                />
                <div className={"main-card-category"}>{event.categories[0]}</div>
                <div className={"main-category-ico"}><TheaterIcon/></div>
                <div className={`card-compact ${expanded ? "hide" : ""}`}>
                    <div className="main-card-name-flex">
                        <RoundBackArrowIco/>
                        <p className="main-card-name">{cutWords(event.name, 3)}</p>
                    </div>
                    <p className="main-card-address">{cutWords(event.address, 5)}</p>
                    <p className="main-card-date">Ближайшее {datePart} {timePart}</p>
                    <p className="main-card-price">{price}</p>
                    <button className="main-more-btn"              /* << ========= */
                            onClick={(e)=>{e.stopPropagation();setExpanded(true);handleMoreOpened()}}>
                        Подробнее
                    </button>
                </div>

                {/* ---------- РАСШИРЕННЫЙ ВИД ---------- */}
                <div className={`card-details ${expanded ? "show" : ""}`}>
                    <div className="card-details__scroll">
                        <h2>{event.name}</h2>
                        <h3>Адрес:</h3>
                        <p>{event.address}</p>
                        <h3>Время:</h3>
                        <p>Ближайшее {datePart} {timePart}</p>
                        <h3>Цена:</h3>
                        <p>{price}</p>
                        <h3>О мероприятии:</h3>
                        <p>{event.description}</p>
                    </div>
                    <div className="card-details__actions">
                        {event.referralLink && (
                            <a className="card-details__go" href={event.referralLink}
                               target="_blank" rel="noreferrer" onClick={handleRefClicked}>Перейти на сайт мероприятия</a>
                        )}
                        <button className="card-details__hide"
                                onClick={(e)=>{e.stopPropagation();setExpanded(false);}}>
                            Скрыть
                        </button>
                    </div>
                </div>

                <button className={"main-like-button"} onClick={(e) => {
                    e.stopPropagation();
                    finishCard(true);
                }}><MainFavoriteButtonIco/>
                </button>
                <button className={"main-dislike-button"} onClick={(e) => {
                    e.stopPropagation();
                    finishCard(false);
                }}>
                    <MainDislikeButtonIco/>
                </button>
            </div>

        </div>
    )
}