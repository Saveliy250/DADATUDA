import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './MainPage.module.css';

import { AnimatePresence } from 'framer-motion';

import { useFilter } from '../../hooks/useFilter';
import { sendFeedback } from '../../tools/api';

import { LoadingScreen } from '../../shared/ui/LoadingScreen';

import { MainPageCard } from './components/MainPageCards/MainPageCard';
import { Event as CustomEvent } from '../../shared/models/event';

const CARD_THRESHOLD = 3;

export const MainPage = () => {
    const {
        events,
        loading,
        error,
        handleApplyFilters,
        removeEventFromDisplay,
        loadMoreEvents,
        handleResetFilters,
        addEventToDisplay,
    } = useFilter();
    const navigate = useNavigate();

    const [lastAction, setLastAction] = useState<{ card: CustomEvent; liked: boolean } | null>(null);
    const [returnedCardId, setReturnedCardId] = useState<number | null>(null);

    useEffect(() => {
        void handleApplyFilters();
    }, [handleApplyFilters]);

    useEffect(() => {
        if (!loading && events.length > 0 && events.length <= CARD_THRESHOLD) {
            void loadMoreEvents();
        }
    }, [events, loading, loadMoreEvents]);

    const handleGoBack = async () => {
        if (lastAction) {
            if (lastAction.liked) {
                try {
                    await sendFeedback(String(lastAction.card.id), false, 0, false, false);
                } catch (err) {
                    console.warn('Failed to undo like', err);
                }
            }
            addEventToDisplay(lastAction.card);
            setReturnedCardId(lastAction.card.id);
            setLastAction(null);
        }
    };

    const handleCardFinish = (card: CustomEvent, liked: boolean) => {
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
                        handleResetFilters();
                        void handleApplyFilters();
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
                            onGoBack={() => void handleGoBack()}
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
