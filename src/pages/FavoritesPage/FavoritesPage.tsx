import React, { useEffect, useState, useMemo } from 'react';
import { toggleFavorite, sendFeedback, getShortlist } from '../../tools/api';
import { readCachedFeedback, clearCachedFeedback, writeCachedFeedback } from '../../tools/feedbackCache';
import { useNavigate } from 'react-router-dom';
import styles from './FavoritePage.module.css';
import { useAuth } from '../../hooks/useAuth';
import { LoadingScreen } from '../../shared/ui/LoadingScreen';
import { FavoriteCardList } from './components/FavoriteCardList/FavoriteCardList';
import type { FavoritePageEvent } from './types';

const formatEventDateTime = (dateString: string): { date: string; time: string } => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { date: '??.??', time: '??:??' };
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return { date: `${day}.${month}`, time: `${hours}:${minutes}` };
  } catch {
    return { date: '??.??', time: '??:??' };
  }
};

const normalize = (s: string) =>
  s.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();

export const FavoritesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [events, setEvents] = useState<FavoritePageEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const mainRef = React.useRef<HTMLDivElement | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (showStarredOnly) filtered = filtered.filter((e) => e.starred);
    const raw = searchTerm.trim();
    if (raw) {
      const q = normalize(raw);
      filtered = filtered.filter((e) => {
        const haystack = [
          e.name || '',
          e.description || '',
          e.address || '',
          `${e.formattedDate || ''} ${e.formattedTime || ''}`,
        ];
        return haystack.some((field) => normalize(field).includes(q));
      });
    }
    return filtered;
  }, [events, searchTerm, showStarredOnly]);

  async function loadShortlistPage(targetPage = 0, { append = false, force = false } = {}) {
    if (isFetching && !force) return;
    setIsFetching(true);
    setError(null);
    try {
      const apiData: any = await getShortlist(PAGE_SIZE, targetPage);
      const rows: any[] = Array.isArray(apiData) ? apiData : apiData?.items ?? [];
      const adapted: FavoritePageEvent[] = rows.map((a) => {
        const { date, time } = formatEventDateTime(a.date);
        return {
          id: a.id,
          name: a.name,
          date: a.date,
          address: a.address,
          imageURL: a.imageURL,
          description: a.description,
          isFavorite: true,
          starred: a.starred,
          formattedDate: date,
          formattedTime: time,
        };
      });

      let addedCount = adapted.length;
      if (append) {
        const prevIds = new Set(events.map((e) => e.id));
        const unique = adapted.filter((e) => !prevIds.has(e.id));
        addedCount = unique.length;
        setEvents((prev) => [...prev, ...unique]);
      } else {
        setEvents(adapted);
      }

      let apiHasMore: boolean;
      if (typeof apiData?.hasNextPage === 'boolean') {
        apiHasMore = apiData.hasNextPage;
      } else if (typeof apiData?.totalPages === 'number') {
        apiHasMore = targetPage + 1 < apiData.totalPages;
      } else if (typeof apiData?.totalCount === 'number') {
        apiHasMore = (targetPage + 1) * PAGE_SIZE < apiData.totalCount;
      } else {
        apiHasMore = addedCount > 0;
      }

      setHasMore(apiHasMore);
      setPage((p) => Math.max(p, targetPage));
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    setEvents([]);
    setPage(0);
    setHasMore(true);
    void loadShortlistPage(0, { append: false });
  }, [isAuthenticated]);

  useEffect(() => {
    const root = mainRef.current;
    const target = sentinelRef.current;
    if (!root || !target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isFetching) {
          void loadShortlistPage(page + 1, { append: true });
        }
      },
      { root, rootMargin: '0px 0px 1000px 0px', threshold: 0.01 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isFetching, page]);

  const handleCardStarClick = async (eventId: string | number) => {
    const id = String(eventId);
    const prevEvent = events.find((e) => e.id === eventId);
    const prevStarred = !!prevEvent?.starred;
    const nextStarred = !prevStarred;
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, starred: nextStarred } : e)));
    writeCachedFeedback(id, { starred: nextStarred });
    try {
      await toggleFavorite(prevStarred, id);
    } catch (e) {
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, starred: prevStarred } : e)));
      writeCachedFeedback(id, { starred: prevStarred });
    }
  };

  const handleCardDislike = async (eventId: string | number) => {
    const id = String(eventId);
    const removed = events.find((e) => e.id === eventId);
    const prev = events;
    const nextEvents = events.filter((e) => e.id !== eventId);
    setEvents(nextEvents);
    const expectedMin = PAGE_SIZE * (page + 1);
    if (nextEvents.length < expectedMin && hasMore && !isFetching) {
      void loadShortlistPage(page + 1, { append: true });
    }
    try {
      const cached = readCachedFeedback(id);
      const starredFromUI = !!removed?.starred;
      await sendFeedback(
        id,
        false,
        cached.viewedSeconds ?? 0,
        cached.moreOpened ?? false,
        cached.referralLinkOpened ?? false,
        starredFromUI
      );
      clearCachedFeedback(id);
    } catch {
      setEvents(prev);
    }
  };

  const handleGoBack = () => navigate(-1);

  if (loading) return <LoadingScreen />;
  if (error) return <div>{error.message}</div>;

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
          cardList={filteredEvents}
          onStarClick={handleCardStarClick}
          onDislike={handleCardDislike}
        />
        <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
        {isFetching && <div className={styles.loaderRow}>Загружаем ещё…</div>}
      </main>
    </div>
  );
};
