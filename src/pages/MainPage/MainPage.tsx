import React, { useEffect, useState } from 'react';

import styles from './MainPage.module.css';

import { AnimatePresence } from 'framer-motion';

import { eventForUser, sendFeedback } from '../../tools/api';

import { useAuth } from '../../hooks/useAuth';

import { MainPageCard } from './components/MainPageCards/MainPageCard';
import { LoadingScreen } from '../../shared/ui/LoadingScreen';

import { Event } from '../../shared/models/event';

export const MainPage = () => {
    const { isAuthenticated } = useAuth();
    const [error, setError] = useState<Error | null>(null);

    const [lastAction, setLastAction] = useState<{ card: Event; liked: boolean } | null>(null);
    const [returnedCardId, setReturnedCardId] = useState<number | null>(null);

    const [cards, setCards] = useState<Event[]>(() => {
        const saved = localStorage.getItem('сards');
        if (saved) {
            try {
                return JSON.parse(saved) as Event[];
            } catch (e) {
                console.error('Could not parse cards from localStorage', e);
                return [];
            }
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem('сards', JSON.stringify(cards));
    }, [cards]);

    useEffect(() => {
        if (!isAuthenticated) return;
        if (cards.length < 1) {
            const need = 10 - cards.length;
            void prefetch(Math.max(2, need));
        }
    }, [isAuthenticated, cards]);

    async function prefetch(n = 1) {
        try {
            const next = await eventForUser(n, '');
            if (next.length > 0) {
                setCards((prev) => {
                    const seen = new Set(prev.map((e) => e.id)); // уже на экране
                    const unique = next.filter((e) => !seen.has(e.id)); // только «новые»
                    return [...prev, ...unique];
                });
            }
        } catch (error) {
            setError(error as Error);
        }
    }

    const onReturnAnimationComplete = () => {
        setReturnedCardId(null);
    };

    function handleCardFinish(victim: Event, liked: boolean) {
        setLastAction({ card: victim, liked: liked });
        setCards((prev) => prev.filter((c) => c.id !== victim.id));
    }

    const handleGoBack = async () => {
        if (lastAction) {
            if (lastAction.liked) {
                try {
                    await sendFeedback(String(lastAction.card.id), false, 0, false, false);
                } catch (err) {
                    console.warn('Failed to undo like', err);
                }
            }
            setReturnedCardId(lastAction.card.id);
            setCards((prev) => [...prev, lastAction.card]);
            setLastAction(null);
        }
    };

    if (!cards.length) return <LoadingScreen />;
    if (error) return <div>Ошибка: {error.message}</div>;

    return (
        <>
            <AnimatePresence>
                {cards.map((ev) => (
                    <div className={styles.cardWrapper} key={ev.id}>
                        <MainPageCard
                            key={ev.id}
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
        </>
    );
};
