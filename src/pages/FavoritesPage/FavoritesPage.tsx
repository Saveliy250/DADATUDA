import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-expect-error CSS module types are provided via custom.d.ts
import styles from './FavoritePage.module.css';
import { LoadingScreen } from '../../shared/ui/LoadingScreen';
import { FavoriteCardList } from './components/FavoriteCardList/FavoriteCardList';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useShortlist } from './hooks/useShortlist';
import { useOptimisticShortlist } from './hooks/useOptimisticShortlist';
import { useOptimisticToggleStarred } from './hooks/useOptimisticToggleStarred';

export const FavoritesPage = () => {
  const navigate = useNavigate();

  const { searchTerm, showStarredOnly, setSearchTerm, setShowStarredOnly } = useFavoritesStore();

  const { data, isLoading, isFetching, fetchNextPage, hasNextPage, error: queryError } = useShortlist();
  const { optimisticRemove } = useOptimisticShortlist();
  const { toggle } = useOptimisticToggleStarred();

  const mainRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Подгрузка следующей страницы при пересечении сентинела (замена loadNext)

  useEffect(() => {
    const root = mainRef.current;
    const target = sentinelRef.current;
    if (!root || !target) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetching) void fetchNextPage();
      },
      { root, rootMargin: '0px 0px 800px 0px', threshold: 0.01 },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [hasNextPage, isFetching, fetchNextPage]);

  const handleGoBack = () => navigate(-1);

  // Мгновенный рендер из персиста: если уже есть data.flat — не блокируем экран
  if (isLoading && !(data && (data as any).flat?.length)) return <LoadingScreen />;
  if (queryError) return <div>Ошибка: {(queryError as Error).message}</div>;

  const filtered = useMemo(() => {
    const src = (data && (data as any).flat) || [];
    const raw = searchTerm.trim();
    const byStar = showStarredOnly ? src.filter((e: any) => e.starred) : src;
    if (!raw) return byStar;
    const q = raw.toLowerCase();
    return byStar.filter((e: any) => {
      const hay = [
        e.name || '',
        e.description || '',
        e.address || '',
        `${e.formattedDate || ''} ${e.formattedTime || ''}`,
      ];
      return hay.some((v) => String(v).toLowerCase().includes(q));
    });
  }, [data, searchTerm, showStarredOnly]);

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

      <main className={styles.mainContent} ref={mainRef}>
        <FavoriteCardList
          cardList={filtered}
          onStarClick={(id) => {
            const ev = filtered.find((e: any) => String(e.id) === String(id));
            if (ev) void toggle(id, !!ev.starred);
          }}
          onDislike={optimisticRemove}
        />
        <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
        {isFetching && <div className={styles.loaderRow}>Загружаем ещё…</div>}
      </main>
    </div>
  );
};