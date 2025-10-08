import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FavoritePage.module.css';
import { LoadingScreen } from '../../shared/ui/LoadingScreen';
import { FavoriteCardList } from './components/FavoriteCardList/FavoriteCardList';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useAuthStore } from '../../store/authStore';

export const FavoritesPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const {
        loading,
        error,
        searchTerm,
        showStarredOnly,
        setSearchTerm,
        setShowStarredOnly,
        loadShortlist,
        toggleStar,
        removeFavorite,
        getFilteredEvents,
    } = useFavoritesStore();

    useEffect(() => {
        if (isAuthenticated) void loadShortlist();
    }, [isAuthenticated, loadShortlist]);

    const handleGoBack = () => {
        navigate(-1);
    };

    if (loading) return <LoadingScreen />;
    if (error) return <div>Ошибка: {error.message}</div>;

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.header}>
                <div className={styles.headerTopRow}>
                    <img
                        src="/img/черная изогнутая стрелка.svg"
                        alt="Назад"
                        className={styles.headerIcon}
                        onClick={handleGoBack}
                    />
                    <h1 className={styles.headerTitle}>Ваши мероприятия</h1>

                    <div className={styles.headerActions}>
                        <img
                            src={showStarredOnly ? '/img/star-en.svg' : '/img/star-dis.svg'}
                            alt="Показать только избранные"
                            className={styles.headerStar}
                            onClick={() => setShowStarredOnly(!showStarredOnly)}
                        />
                        <img
                            src="/img/фильтры иконка.svg"
                            alt="Фильтры"
                            className={`${styles.headerIcon} ${styles.filterIcon}`}
                        />
                    </div>
                </div>

                <div className={styles.searchContainer}>
                    <img src="/img/поиск.svg" alt="Поиск" className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Поиск"
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <main className={styles.mainContent}>
                <FavoriteCardList cardList={getFilteredEvents()} onStarClick={toggleStar} onDislike={removeFavorite} />
            </main>
        </div>
    );
};
