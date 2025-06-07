import React, {useState, useRef, useEffect} from "react";
import "./MainScreen.css"
import {
    motion,
    useMotionValue,
    useTransform,
    useAnimation, AnimatePresence,
} from "framer-motion";
import formatDate from "../src/tools/FormatDate.jsx"
import MainFavoriteButtonIco from "./icons/MainFavoriteButtonIco.jsx";
import MainDislikeButtonIco from "./icons/MainDislikeButtonIco.jsx";
import RoundBackArrowIco from "./icons/RoundBackArrowIco.jsx";
import {cutWords} from "./tools/strings.js";
import {sendFeedback} from "./tools/api.js";



export function MainCard({event,canDrag, loadNext}) {
    const [slide , setSlide]      = useState(0);
    const [datePart,timePart] = formatDate(event.date).split(" ");
    const price = event.price !== '0' ? `${event.price} рублей` : "Бесплатно"

    const [expanded, setExpanded] = useState(false);
    const start = useRef(Date.now());
    const [moreOpened , setMoreOpened ] = useState(false);
    const [refClicked    , setRefClicked    ] = useState(false);

    const x         = useMotionValue(0);
    const rotate    = useTransform(x, [-250, 250], [-15, 15]);
    const opacity   = useTransform(x, [-250, -160, 0, 160, 250],
        [0,     1,   1,   1,   0]);
    const controls  = useAnimation();

    async function handleDragEnd(_, info){
        const offsetX   = info.offset.x;
        const threshold = window.innerWidth * .25;

        if (Math.abs(offsetX) < threshold){
            await controls.start({x:0, rotate:0});
            return;
        }

        await controls.start({
            x: offsetX < 0 ? -window.innerWidth : window.innerWidth,
            opacity:0, transition:{duration:.25}
        });
        await finishCard(offsetX > 0);
    }

    const [isDragging, setIsDragging] = useState(false);
    function onTap() {
        if (!isDragging) {
            setSlide((n) => (n + 1) % event.imageURL.length);
        }
    }

    function handleRefClicked(){
        setRefClicked(true)
    }

    const openDetails = () => {
        setMoreOpened(true);
        setExpanded(true);
    };

    useEffect(() => {
        start.current = Date.now();
    }, [event.id]);

    async function finishCard(like) {
        console.log(event.imageURL[0], event.referralLink);
        const viewedSeconds = Math.round((Date.now() - start.current)/1000);
        try {
            sendFeedback(event.id, like, viewedSeconds, moreOpened, refClicked);
        } catch (err) {
            console.warn(err);
        }
        loadNext(event.id);
    }

    return (
        <motion.div
    className="MainCard"
    style={{ x, rotate, opacity }}
    drag={"x"}
    dragConstraints={{ left: -1000, right: 1000 }}
    onDragEnd={handleDragEnd}
    onDragStart={() => setIsDragging(true)}
    onDragTransitionEnd={() => setIsDragging(false)}
    animate={controls}
    onTap={onTap}>
            <div className={"main-card-img-wrapper"} >
                <img
                    src={event.imageURL[slide]}
                    alt={event.name}
                    className="main-card-img"
                />
                <motion.div
                    className="card-compact"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: .2 }}>
                    <div className="main-card-name-flex">
                        <RoundBackArrowIco/>
                        <p className="main-card-name">{cutWords(event.name, 6)}</p>
                    </div>
                    <p className="main-card-price">{price}</p>
                    <button className="main-more-btn"
                            onClick={(e)=>{e.stopPropagation();openDetails()}}>
                        Подробнее
                    </button>
                </motion.div>

                <AnimatePresence motion={"wait"}>
                    {expanded && (
                        <motion.div
                        key = "details"
                        className={`card-details`}
                        initial={{ y: '40%', opacity: 0 }}
                        animate={{ y: 0,        opacity: 1 }}
                        exit={{   y: '40%', opacity: 0 }}
                        transition={{ duration: .28, ease: 'easeOut' }}
                        onClick={e => e.stopPropagation()} >
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
                    </motion.div>
                        )}
                </AnimatePresence>

                <button className={"main-like-button"} onClick={(e) => {
                    e.stopPropagation();
                    controls.start({ x: window.innerWidth, opacity: 0, transition: { duration: 0.25 } })
                        .then(() => finishCard(true));
                }}><MainFavoriteButtonIco/>
                </button>
                <button className={"main-dislike-button"} onClick={(e) => {
                    e.stopPropagation();
                    controls.start({ x: -window.innerWidth, opacity: 0, transition: { duration: 0.25 } })
                        .then(() => finishCard(false));
                }}>
                    <MainDislikeButtonIco/>
                </button>
            </div>

        </motion.div>
    )
}