import { useEffect, useRef, useState } from 'react';

import styles from './MainPageCard.module.css';

import { AnimatePresence, motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { sendFeedback } from '../../../../tools/api.js';
import { CurvedArrowIcon } from '../../../../shared/icons/MainPage/CurvedArrowIcon.jsx';
import moment from 'moment';
import { MainPageDislikeButton } from '../MainPageActionButtons/MainPageDislikeButton.jsx';
import { MainPageLikeButton } from '../MainPageActionButtons/MainPageLikeButton.jsx';
import { StarIcon } from '../../../../shared/icons/MainPage/StarIcon.jsx';
import { Link } from 'react-router-dom';
import { FilterIcon } from '../../../../shared/icons/MainPage/FilterIcon.jsx';
import { TheaterIcon } from '../../../../shared/icons/EventIcons/TheaterIcon.jsx';

export const MainPageCard = ({ event, canDrag, loadNext }) => {
    const [slide, setSlide] = useState(0);
    const totalImages = event.imageURL.length;
    const price = event.price !== '0' ? `${event.price} рублей` : 'Бесплатно';

    const [expanded, setExpanded] = useState(false);
    const start = useRef(Date.now());
    const [moreOpened, setMoreOpened] = useState(false);
    const [refClicked, setRefClicked] = useState(false);

    const x = useMotionValue(0);
    const rotate = useTransform(x, [-250, 250], [-15, 15]);
    const opacity = useTransform(x, [-250, -160, 0, 160, 250], [0, 1, 1, 1, 0]);
    const controls = useAnimation();

    const currentDate = event.date;
    const endDate = event.dateEnd;
    const formattedDate = moment(currentDate).format('DD.MM.YYYY в HH:mm');
    const formattedEndDate = moment(endDate).format('DD.MM.YYYY в HH:mm');

    async function handleDragEnd(_, info) {
        const offsetX = info.offset.x;
        const threshold = window.innerWidth * 0.25;

        if (Math.abs(offsetX) < threshold) {
            await controls.start({ x: 0, rotate: 0 });
            return;
        }

        await controls.start({
            x: offsetX < 0 ? -window.innerWidth : window.innerWidth,
            opacity: 0,
            transition: { duration: 0.25 },
        });
        await finishCard(offsetX > 0);
    }

    function handleRefClicked() {
        setRefClicked(true);
    }

    useEffect(() => {
        start.current = Date.now();
    }, [event.id]);

    async function finishCard(like) {
        console.log(event.imageURL[0], event.referralLink);
        const viewedSeconds = Math.round((Date.now() - start.current) / 1000);
        try {
            sendFeedback(event.id, like, viewedSeconds, moreOpened, refClicked);
        } catch (err) {
            console.warn(err);
        }
        loadNext(event.id);
    }

    const [isDragging, setIsDragging] = useState(false);

    function handleSlide() {
        if (!isDragging) {
            setSlide((n) => (n + 1) % totalImages);
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setSlide((prev) => (prev + 1) % totalImages);
        }, 5000);
        return () => clearInterval(interval);
    }, [totalImages, slide]);

    return (
        <motion.div
            className={styles.card}
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: -1000, right: 1000 }}
            onDragEnd={handleDragEnd}
            onDragStart={() => setIsDragging(true)}
            onDragTransitionEnd={() => setIsDragging(false)}
            animate={controls}
        >
            <div onClick={handleSlide} className={expanded ? styles.cardWrapperBlacked : styles.cardWrapper}>
                <img draggable={false} src={event.imageURL[slide]} alt={event.name} className={styles.cardImg} />

                {totalImages > 1 && (
                    <div className={styles.slider}>
                        {totalImages > 1 && (
                            <div className={styles.slideContainer}>
                                {event.imageURL.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.indicator} ${index === slide ? styles.active : ''}`}
                                        onClick={() => setSlide(index)}
                                    ></div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.upperInfo}>
                    <div>
                        <TheaterIcon />
                        {event.categories[0]}
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                        <Link to="/filters">
                            <FilterIcon />
                        </Link>
                    </div>
                </div>

                <div className={styles.cardInfo}>
                    <div className={styles.cardTitle}>
                        <div className={styles.icon}>
                            <CurvedArrowIcon />
                        </div>
                        <h1 className={styles.cardTitleName}>{event.name}</h1>
                    </div>

                    <div className={styles.shortInfo} onClick={(e) => e.stopPropagation()}>
                        <h3>{event.address}</h3>
                        {formattedDate === formattedEndDate ? (
                            <p>Дата мероприятия: {formattedDate}</p>
                        ) : (
                            <>
                                <p>Дата мероприятия: {formattedDate}</p>
                                <p>Дата окончания: {formattedEndDate}</p>
                            </>
                        )}
                        <p className={styles.cardPrice}>Стоимость: {price}</p>

                        <AnimatePresence mode="popLayout">
                            {moreOpened ? (
                                <motion.div
                                    key="details"
                                    initial={{ y: '30%', opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: '20%', opacity: 0 }}
                                    transition={{ duration: 0.2, ease: 'linear' }}
                                >
                                    <motion.div className={styles.eventDescriptionOpenedWrapper}>
                                        <motion.p className={styles.eventDescriptionOpened}>
                                            {event.description}
                                        </motion.p>
                                    </motion.div>
                                    <div className={styles.eventDescriptionOpenedContent}>
                                        <CurvedArrowIcon />
                                        <div>
                                            {event.referralLink && (
                                                <a
                                                    className={styles.cardDetailsLink}
                                                    href={event.referralLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={handleRefClicked}
                                                >
                                                    Перейти на сайт мероприятия
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <p className={styles.eventDescription}>{event.description}</p>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className={styles.mainActionsWrapper}>
                        <MainPageDislikeButton controls={controls} finishCard={finishCard} />

                        <div className={styles.backButton}>
                            <CurvedArrowIcon />
                        </div>

                        <button
                            className={styles.moreButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpanded(!expanded);
                                setMoreOpened(!moreOpened);
                            }}
                        >
                            {moreOpened ? 'Скрыть' : 'Подробнее'}
                        </button>

                        <div className={styles.starButton}>
                            <StarIcon />
                        </div>

                        <MainPageLikeButton controls={controls} finishCard={finishCard} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
