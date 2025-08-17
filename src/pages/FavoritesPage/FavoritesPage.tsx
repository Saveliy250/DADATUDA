import React, { useEffect, useState } from 'react';

import styles from './FavoritePage.module.css';

import { useAuth } from '../../hooks/useAuth';

import { getShortlist, toggleFavorite } from '../../tools/api/api';

import { LoadingScreen } from '../../shared/ui/LoadingScreen';
import { FavoriteCardList } from './components/FavoriteCardList/FavoriteCardList';
import { Header } from '../../shared/components/Header/Header';

import { Event } from '../../shared/models/event';

export const FavoritesPage = () => {
    const { isAuthenticated } = useAuth();
    const [favorites, setFavorites] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            void loadShortlist();
        }
    }, [isAuthenticated]);

    const onFavoriteClick = (event: Event) => {
        try {
            const response = toggleFavorite(event.isFavorite, String(event.id));
            console.log(response);
        } catch (error) {
            console.log(error);
        }
        setFavorites((prev) =>
            prev.map((item) => (item.id === event.id ? { ...item, isFavorite: !item.isFavorite } : item)),
        );
    };

    async function loadShortlist() {
        setLoading(true);
        try {
            const shortlist = await getShortlist(10, 0);
            setFavorites(shortlist);
        } catch (error) {
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <LoadingScreen />;
    }

    if (error) {
        return <div>{error.message}</div>;
    }

    const favoriteItems = favorites.filter((event) => event.isFavorite);
    const notFavoriteItems = favorites.filter((event) => !event.isFavorite);

    return (
        <>
            <Header title="мои мероприятия" withIcon={false} />

            <div className={styles.favoritesPage}>
                <FavoriteCardList
                    cardList={favoriteItems}
                    title="избранное"
                    color="#FF6CF1"
                    handleClick={onFavoriteClick}
                />
                <FavoriteCardList
                    cardList={notFavoriteItems}
                    title="понравившиеся"
                    color="#8CF63B"
                    handleClick={onFavoriteClick}
                />
            </div>
        </>
    );
};
