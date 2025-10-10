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
import { logger } from '../../../../tools/logger';

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

    // Refs for touch handling and exclusions
    const touchSurfaceRef = useRef<HTMLDivElement | null>(null);
    const actionsBarRef = useRef<HTMLDivElement | null>(null);
    const verticalGestureRef = useRef<boolean>(false);
    const descriptionWrapperRef = useRef<HTMLDivElement | null>(null);

    // Persist expanded state per event
    const storageKey = `mpc-expanded-${event.id}`;
    useEffect(() => {
        const persisted = localStorage.getItem(storageKey);
        if (persisted === '1') {
            setExpanded(true);
            setMoreOpened(true);
        } else {
            setExpanded(false);
            setMoreOpened(false);
        }
        // reset start time on new card
        start.current = Date.now();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event.id]);

    const setMoreOpenedPersisted = (open: boolean, reason: 'button' | 'swipe'): void => {
        setExpanded(open);
        setMoreOpened(open);
        try {
            localStorage.setItem(storageKey, open ? '1' : '0');
        } catch {}
        if (reason === 'swipe') {
            if (open) {
                logger.info('details_opened_swipe_up', { eventId: event.id });
            } else {
                logger.info('details_closed_swipe_down', { eventId: event.id });
            }
        }
    };

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

    // Native touch gesture handling for vertical open/close (mobile only)
    useEffect(() => {
        const el = touchSurfaceRef.current;
        if (!el) return;

        const isMobile = typeof window !== 'undefined' && (('ontouchstart' in window) || window.matchMedia('(pointer: coarse)').matches);
        if (!isMobile) return;

        let startX = 0;
        let startY = 0;
        let lastX = 0;
        let lastY = 0;
        let startTs = 0;
        let verticalActive = false;
        let cancelledByHorizontal = false;
        let inScrollableArea = false;
        let startScrollTop = 0;
        const HORIZONTAL_CANCEL_THRESHOLD = 10; // px
        const VERTICAL_ACTIVATE_THRESHOLD = 10; // px
        const OPEN_DISTANCE = 70; // px, swipe up to open
        const CLOSE_DISTANCE = 90; // px, swipe down to close
        const VELOCITY_THRESHOLD = 0.5; // px/ms

        const isInActions = (target: EventTarget | null): boolean => {
            if (!(target instanceof Node)) return false;
            return !!actionsBarRef.current && actionsBarRef.current.contains(target);
        };

        const onTouchStart = (e: TouchEvent) => {
            if (!e.touches || e.touches.length === 0) return;
            if (isInActions(e.target)) return; // exclude actions bar zone
            const t = e.touches[0];
            startX = lastX = t.clientX;
            startY = lastY = t.clientY;
            startTs = e.timeStamp;
            verticalActive = false;
            cancelledByHorizontal = false;
            inScrollableArea = !!(moreOpened && descriptionWrapperRef.current && descriptionWrapperRef.current.contains(e.target as Node));
            startScrollTop = descriptionWrapperRef.current ? descriptionWrapperRef.current.scrollTop : 0;
        };

        const onTouchMove = (e: TouchEvent) => {
            if (!e.touches || e.touches.length === 0) return;
            if (isInActions(e.target)) return;
            const t = e.touches[0];
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;
            lastX = t.clientX;
            lastY = t.clientY;

            if (!verticalActive) {
                if (Math.abs(dx) > HORIZONTAL_CANCEL_THRESHOLD) {
                    cancelledByHorizontal = true;
                    return;
                }
                if (Math.abs(dy) > VERTICAL_ACTIVATE_THRESHOLD) {
                    if (inScrollableArea) {
                        if (dy > 0 && startScrollTop <= 0) {
                            verticalActive = true;
                        } else {
                            verticalActive = false;
                            return;
                        }
                    } else {
                        verticalActive = true;
                    }
                }
            }

            if (verticalActive && !cancelledByHorizontal) {
                try { e.preventDefault(); } catch {}
            }
        };

        const onTouchEnd = (e: TouchEvent) => {
            if (cancelledByHorizontal) return;
            const dt = Math.max(1, e.timeStamp - startTs);
            const dx = lastX - startX;
            const dy = lastY - startY;
            const vy = Math.abs(dy) / dt;

            if (!verticalActive) return;
            if (dy < 0) {
                const distance = Math.abs(dy);
                if (!moreOpened && (distance > OPEN_DISTANCE || (distance > OPEN_DISTANCE / 2 && vy > VELOCITY_THRESHOLD))) {
                    setMoreOpenedPersisted(true, 'swipe');
                }
            } else if (dy > 0) {
                if (moreOpened && (dy > CLOSE_DISTANCE || (dy > CLOSE_DISTANCE / 2 && vy > VELOCITY_THRESHOLD))) {
                    setMoreOpenedPersisted(false, 'swipe');
                }
            }
            verticalGestureRef.current = true;
        };

        el.addEventListener('touchstart', onTouchStart, { passive: true });
        // touchmove needs passive: false to be able to preventDefault when verticalActive
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        el.addEventListener('touchend', onTouchEnd, { passive: true });

        return () => {
            el.removeEventListener('touchstart', onTouchStart as EventListener);
            el.removeEventListener('touchmove', onTouchMove as EventListener);
            el.removeEventListener('touchend', onTouchEnd as EventListener);
        };
    }, [moreOpened]);

    function handleSlide(): void {
        if (verticalGestureRef.current) {
            verticalGestureRef.current = false;
            return;
        }
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
            <div
                ref={touchSurfaceRef}
                onClick={handleSlide}
                className={expanded ? styles.cardWrapperBlacked : styles.cardWrapper}
            >
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

                {!moreOpened && (
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
                )}

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
                                    <motion.div className={styles.eventDescriptionOpenedWrapper} ref={descriptionWrapperRef}>
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

                    <div className={styles.mainActionsWrapper} ref={actionsBarRef}>
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
                            onClick={(e) => {
                                e.stopPropagation();
                                setMoreOpenedPersisted(!moreOpened, 'button');
                            }}
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
