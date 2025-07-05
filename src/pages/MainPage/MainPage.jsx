import { useEffect, useState } from 'react';

import './mainPage.css';

import { AnimatePresence } from 'framer-motion';

import { eventForUser } from '../../tools/api.js';

import { useAuth } from '../../hooks/useAuth.js';

import { MainCard } from './components/MainCard.jsx';
import { LoadingScreen } from '../../shared/ui/LoadingScreen.jsx';
import { Navigation } from './components/Navigation.jsx';

export const MainPage = () => {
    const { isAuthenticated, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cards, setCards] = useState(() => {
        const saved = localStorage.getItem('сards');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('сards', JSON.stringify(cards));
    }, [cards]);

    useEffect(() => {
        if (!isAuthenticated) return;
        if (cards.length < 1) {
            const need = 10 - cards.length;
            prefetch(Math.max(2, need));
        }
    }, [isAuthenticated, cards]);

    async function prefetch(n = 1) {
        const next = await eventForUser(n, '');
        setCards((prev) => {
            const seen = new Set(prev.map((e) => e.id)); // уже на экране
            const unique = next.filter((e) => !seen.has(e.id)); // только «новые»
            return [...prev, ...unique];
        });
    }

    function handleCardFinish(victimId) {
        setCards((prev) => prev.filter((c) => c.id !== victimId));
    }

    if (!cards.length) return <LoadingScreen />;
    if (error) return <div>Ошибка: {error.message}</div>;

    return (
        <>
            <AnimatePresence>
                {cards.map((ev, i) => (
                    <div className={'card-holder'} key={ev.id}>
                        <MainCard key={ev.id} event={ev} canDrag={i === 0} loadNext={handleCardFinish} />
                    </div>
                ))}
            </AnimatePresence>
            <Navigation />
        </>
    );
};
