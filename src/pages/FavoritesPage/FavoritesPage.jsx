import { useEffect, useState } from 'react';

import '../../index.css';
import './favoritesPage.css';

import { useAuth } from '../../hooks/useAuth.js';
import { getShortlist, toggleFavorite } from '../../tools/api.js';

import { Navigation } from '../MainPage/components/Navigation.jsx';
import { LoadingScreen } from '../../shared/ui/LoadingScreen.jsx';
import { CardList } from './components/CardList.jsx';

export const FavoritesPage = () => {
    const { isAuthenticated } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            loadShortlist();
        }
    }, [isAuthenticated]);

    const onFavoriteClick = (event) => {
        try {
            const response = toggleFavorite(event.isFavorite, event.id);
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
            setError(error);
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
            <p className="favorites-header">Ваши мероприятия</p>

            <div className="favoritesPage">
                <CardList cardList={favoriteItems} title="избранное" color="#FF6CF1" handleClick={onFavoriteClick} />
                <CardList
                    cardList={notFavoriteItems}
                    title="понравившиеся"
                    color="#8CF63B"
                    handleClick={onFavoriteClick}
                />
            </div>
            <Navigation />
        </>
    );
};
