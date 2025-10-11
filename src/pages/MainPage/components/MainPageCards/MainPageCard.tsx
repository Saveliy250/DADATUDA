import { useEffect, useRef, useState } from 'react';

import { Link } from 'react-router-dom';

import styles from './MainPageCard.module.css';

import { AnimatePresence, motion, PanInfo, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { Skeleton } from '@mantine/core';
import moment from 'moment';

import { sendFeedback } from '../../../../tools/api/api';

import { CurvedArrowIcon } from '../../../../shared/icons/MainPage/CurvedArrowIcon.jsx';
import { MainPageDislikeButton } from '../MainPageActionButtons/MainPageDislikeButton';
import { MainPageLikeButton } from '../MainPageActionButtons/MainPageLikeButton';
import { StarIcon } from '../../../../shared/icons/MainPage/StarIcon.jsx';
import { FilterIcon } from '../../../../shared/icons/MainPage/FilterIcon.jsx';
import { TheaterIcon } from '../../../../shared/icons/EventIcons/TheaterIcon.jsx';

import { Event as CustomEvent } from '../../../../shared/models/event';
import { useFavoritesStore } from '../../../../store/favoritesStore';

interface MainPageCardProps {
    event: CustomEvent;
    loadNext: (liked: boolean) => void;
    onGoBack: () => void;
    returnedCardId: number | null;
    onReturnAnimationComplete: () => void;
    isBackAvailable: boolean;
}

export const MainPageCard = ({
    event,
    loadNext,
    onGoBack,
    returnedCardId,
    onReturnAnimationComplete,
    isBackAvailable,
}: MainPageCardProps) => {
    const { toggleStar } = useFavoritesStore();

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

    useEffect(() => {
        const runReturnAnimation = async () => {
            await controls.start({ x: [-window.innerWidth, 0], opacity: 1, transition: { duration: 0.25 } });
            onReturnAnimationComplete();
        };

        if (event.id === returnedCardId) {
            void runReturnAnimation();
        }
    }, [returnedCardId, event.id, controls, x, onReturnAnimationComplete]);

    async function finishCard(like: boolean): Promise<void> {
        console.log(event.imageURL[0], event.referralLink);
        const viewedSeconds: number = Math.round((Date.now() - start.current) / 1000);

        try {
            await sendFeedback(String(event.id), like, viewedSeconds, moreOpened, refClicked);
        } catch (err) {
            console.warn('Произошла ошибка добавление в понравившиеся, попробуйте позже...', err);
        }
        loadNext(like);
    }

    const addToFavorites = async () => {
        try {
            await toggleStar(event.id);

            await controls.start({
                x: window.innerWidth,
                opacity: 0,
                transition: { duration: 0.25 },
            });

            loadNext(true);
        } catch (err) {
            console.warn('Произошла ошибка добавление в избранное, попробуйте позже...', err);
        }
    };

    const [isDragging, setIsDragging] = useState<boolean>(false);

    const toggleMore = (e?: { stopPropagation: () => void }): void => {
        if (e) e.stopPropagation();
        setExpanded((prev: boolean) => !prev);
        setMoreOpened((prev: boolean) => !prev);
    };

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

    return (
        <motion.div
            className={styles.card}
            style={{ x, rotate }}
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
                <motion.img
                    key={slide}
                    draggable={false}
                    src={"/Users/savelijpoplavskij/WebstormProjects/DADATUDA/public/img/colorful-rectangle-banners-4136919.webp"}
                    onLoad={loadHandler}
                    onError={errorHandler}
                    alt={event.name}
                    className={styles.cardImg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoading ? 0 : 1 }}
                    transition={{ opacity: { duration: 0.4 } }}
                />

                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            key="loader"
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Skeleton width="100%" height="100vh" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {imageError && <div className={styles.errorMessage}>Изображение не загрузилось...</div>}

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

                <AnimatePresence initial={false} mode="wait">
                    {!moreOpened && (
                        <motion.div
                            key="upper-info"
                            className={styles.upperInfo}
                            initial={{ y: -16, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -16, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div>
                                <TheaterIcon />
                                {event.categories![0]}
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                                <Link to="/filters">
                                    <FilterIcon />
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={styles.cardInfo}>
                    <AnimatePresence mode="wait">
                        {moreOpened ? (
                            <motion.div
                            key="text-open"
                            className={styles.textScrollAreaOpened}
                            initial={{ y: 16, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -16, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            layout
                            >
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

                                    <motion.p
                                        className={styles.eventDescriptionOpened}
                                        onClick={(e) => toggleMore(e)}
                                    >
                                        {event.description}
                                    </motion.p>
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
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                            key="text-closed"
                            className={styles.textScrollArea}
                            initial={{ y: -16, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 16, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            layout
                            >
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

                                    <p
                                        className={styles.eventDescription}
                                        onClick={(e) => toggleMore(e)}
                                    >
                                        {event.description}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={styles.mainActionsWrapper}>
                        <MainPageDislikeButton controls={controls} finishCard={(liked) => void finishCard(liked)} />

                        <button
                            className={`${styles.backButton} ${!isBackAvailable ? styles.disabled : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isBackAvailable) {
                                    onGoBack();
                                }
                            }}
                            disabled={!isBackAvailable}
                        >
                            <CurvedArrowIcon />
                        </button>

                        <button
                            className={styles.moreButton}
                            onClick={(e) => toggleMore(e)}
                        >
                            {moreOpened ? 'Скрыть' : 'Подробнее'}
                        </button>

                        <div className={styles.starButton}>
                            <button onClick={() => void addToFavorites()}>
                                <StarIcon />
                            </button>
                        </div>

                        <MainPageLikeButton controls={controls} finishCard={(liked) => void finishCard(liked)} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
