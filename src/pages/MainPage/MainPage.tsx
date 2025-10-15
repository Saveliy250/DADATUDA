import React, { useEffect, useState } from 'react';

import { useFilterStore } from '../../store/filterStore';
import { useFavoritesStore } from '../../store/favoritesStore';

import { useNavigate } from 'react-router-dom';

import styles from './MainPage.module.css';

import { AnimatePresence } from 'framer-motion';

import { sendFeedback } from '../../tools/api/api';

import { LoadingScreen } from '../../shared/ui/LoadingScreen';

import { MainPageCard } from './components/MainPageCards/MainPageCard';
import { Event as CustomEvent } from '../../shared/models/event';

const CARD_THRESHOLD = 3;

export const MainPage = () => {
    const {
        events,
        loading,
        error,
        applyFilters,
        removeEventFromDisplay,
        loadMoreEvents,
        resetFilters,
        addEventToDisplay,
    } = useFilterStore();
    const { addFavorite } = useFavoritesStore();
    const navigate = useNavigate();

    const [lastAction, setLastAction] = useState<{ card: CustomEvent; liked: boolean } | null>(null);
    const [returnedCardId, setReturnedCardId] = useState<number | null>(null);

    useEffect(() => {
        void applyFilters();
    }, [applyFilters]);

    useEffect(() => {
        if (!loading && events.length > 0 && events.length <= CARD_THRESHOLD) {
            void loadMoreEvents();
        }
    }, [events, loading, loadMoreEvents]);

    const handleGoBack = () => {
        if (lastAction) {
            if (lastAction.liked) {
                sendFeedback(String(lastAction.card.id), false, 0, false, false).catch((err) => {
                    console.warn('Failed to undo like', err);
                });
            }
            addEventToDisplay(lastAction.card);
            setReturnedCardId(lastAction.card.id);
            setLastAction(null);
        }
    };

    const handleCardFinish = (card: CustomEvent, liked: boolean) => {
        if (liked) {
            addFavorite(card).catch((err) => {
                console.warn('Failed to add favorite', err);
            });
        }
        setLastAction({ card, liked });
        removeEventFromDisplay(card.id);
    };

    const onReturnAnimationComplete = () => {
        setReturnedCardId(null);
    };

    if (loading && events.length === 0) return <LoadingScreen />;
    if (error) return <div>Ошибка: {error}</div>;
    if (!events.length && !loading) {
        return (
            <div className={styles.noResultsContainer}>
                <p>Нет карточек с необходимыми параметрами</p>
                <button
                    onClick={() => {
                        resetFilters();
                        void applyFilters();
                    }}
                >
                    Загрузить все карточки
                </button>
                <button onClick={() => navigate('/filters')}>Перейти в фильтры</button>
            </div>
        );
    }

    return (
        <>
            <AnimatePresence>
                {events.map((ev) => (
                    <div className={styles.cardWrapper} key={ev.id}>
                        <MainPageCard
                            event={ev}
                            loadNext={(liked) => handleCardFinish(ev, liked)}
                            onGoBack={handleGoBack}
                            returnedCardId={returnedCardId}
                            onReturnAnimationComplete={onReturnAnimationComplete}
                            isBackAvailable={lastAction !== null}
                        />
                    </div>
                ))}
            </AnimatePresence>
            {loading && events.length > 0 && <LoadingScreen />}
        </>
    );
};
