import { useEffect, useRef, useState } from 'react';

import { Link } from 'react-router-dom';

import styles from './MainPageCard.module.css';

import { AnimatePresence, motion, PanInfo, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { Skeleton } from '@mantine/core';
import moment from 'moment';

import { sendFeedback } from '../../../../tools/api.js';

import { CurvedArrowIcon } from '../../../../shared/icons/MainPage/CurvedArrowIcon.jsx';
import { MainPageDislikeButton } from '../MainPageActionButtons/MainPageDislikeButton';
import { MainPageLikeButton } from '../MainPageActionButtons/MainPageLikeButton';
import { StarIcon } from '../../../../shared/icons/MainPage/StarIcon.jsx';
import { FilterIcon } from '../../../../shared/icons/MainPage/FilterIcon.jsx';
import { TheaterIcon } from '../../../../shared/icons/EventIcons/TheaterIcon.jsx';

import { Event } from '../../../../shared/models/event';

interface MainPageCardProps {
    event: Event;
    loadNext: (id: number) => void;
}

export function MainPageCard({ event, loadNext }: MainPageCardProps) {
    const [slide, setSlide] = useState<number>(0);
    const totalImages: number = event.imageURL.length;
    const price: string = event.price !== '0' ? `${event.price} рублей` : 'Бесплатно';

    const [expanded, setExpanded] = useState<boolean>(false);
    const start = useRef<number>(Date.now());
    const [moreOpened, setMoreOpened] = useState<boolean>(false);
    const [refClicked, setRefClicked] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [imageError, setImageError] = useState<boolean>(false);

    const x = useMotionValue(0);
    const rotate = useTransform(x, [-250, 250], [-15, 15]);
    const opacity = useTransform(x, [-250, -160, 0, 160, 250], [0, 1, 1, 1, 0]);
    const controls = useAnimation();

    const currentDate: string = event.date;
    const endDate: string | undefined = event.dateEnd;
    const formattedDate: string = moment(currentDate).format('DD.MM.YYYY в HH:mm');
    const formattedEndDate: string = moment(endDate).format('DD.MM.YYYY в HH:mm');

    async function handleDragEnd(_: any, info: PanInfo): Promise<void> {
        const offsetX: number = info.offset.x;
        const threshold: number = window.innerWidth * 0.25;

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

    function handleRefClicked(): void {
        setRefClicked(true);
    }

    useEffect(() => {
        start.current = Date.now();
    }, [event.id]);

    async function finishCard(like: boolean): Promise<void> {
        console.log(event.imageURL[0], event.referralLink);
        const viewedSeconds: number = Math.round((Date.now() - start.current) / 1000);
        try {
            await sendFeedback(String(event.id), like, viewedSeconds, moreOpened, refClicked);
        } catch (err) {
            console.warn(err);
        }
        loadNext(event.id);
    }

    const [isDragging, setIsDragging] = useState<boolean>(false);

    function handleSlide(): void {
        if (!isDragging) {
            setSlide((n: number) => (n + 1) % totalImages);
        }
    }

    useEffect(() => {
        if (totalImages <= 1) return;
        const interval = setInterval(() => {
            setSlide((prev: number) => (prev + 1) % totalImages);
        }, 5000);
        return () => clearInterval(interval);
    }, [totalImages]);

    useEffect(() => {
        setIsLoading(true);
        setImageError(false);
    }, [event.imageURL[slide]]);

    const loadHandler = (): void => {
        setIsLoading(false);
        setImageError(false);
    };

    const errorHandler = (): void => {
        setIsLoading(false);
        setImageError(true);
    };

    console.log(isLoading);

    return (
        <motion.div
            className={styles.card}
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: -1000, right: 1000 }}
            onDragEnd={(_, info) => {
                void handleDragEnd(_, info);
            }}
            onDragStart={() => setIsDragging(true)}
            onDragTransitionEnd={() => setIsDragging(false)}
            animate={controls}
        >
            <div onClick={handleSlide} className={expanded ? styles.cardWrapperBlacked : styles.cardWrapper}>
                {isLoading && <Skeleton width="100%" height="100vh" />}
                {imageError && <div className={styles.errorMessage}>Изображение не загрузилось...</div>}
                <img
                    draggable={false}
                    src={event.imageURL[slide]}
                    onLoad={loadHandler}
                    onError={errorHandler}
                    alt={event.name}
                    className={styles.cardImg}
                    style={{ opacity: isLoading || imageError ? '0' : '1' }}
                />

                {totalImages > 1 && !isLoading && !imageError && (
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
                        {event.categories![0]}
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
                        <MainPageDislikeButton controls={controls} finishCard={(liked) => void finishCard(liked)} />

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

                        <MainPageLikeButton controls={controls} finishCard={(liked) => void finishCard(liked)} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
