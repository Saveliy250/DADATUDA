import { useCallback, useRef, useState } from 'react';
import { getShortlist, sendFeedback, toggleFavorite } from '../../tools/api';
import { readCachedFeedback, clearCachedFeedback, writeCachedFeedback } from '../../tools/feedbackCache';
import type { FavoritePageEvent } from './types';

type Id = string | number;

type ShortlistItemDto = {
  id: Id;
  name: string;
  date: string;
  address?: string;
  imageURL: string[] | string;
  description?: string;
  starred?: boolean;
  addedAt?: string;
  favoriteAddedAt?: string;
  createdAt?: string;
};

type ShortlistEnvelope = {
  items?: unknown;
  hasNextPage?: unknown;
  totalPages?: unknown;
  totalCount?: unknown;
  last?: unknown;
};

type ParseResult = {
  rows: ShortlistItemDto[];
  meta: {
    hasNextPage?: boolean;
    totalPages?: number;
    totalCount?: number;
    last?: boolean;
  };
};

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object';
const asBoolean = (v: unknown) => (typeof v === 'boolean' ? v : undefined);
const asNumber = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const arrOf = <T,>(v: unknown, guard: (x: unknown) => x is T): T[] => (Array.isArray(v) ? v.filter(guard) : []);

const isItem = (v: unknown): v is ShortlistItemDto => {
  if (!isObject(v)) return false;
  return 'id' in v && 'name' in v && 'date' in v;
};

const parseResponse = (data: unknown): ParseResult => {
  if (Array.isArray(data)) return { rows: arrOf<ShortlistItemDto>(data, isItem), meta: {} };
  if (isObject(data)) {
    const env = data as ShortlistEnvelope;
    return {
      rows: arrOf<ShortlistItemDto>(env.items, isItem),
      meta: {
        hasNextPage: asBoolean(env.hasNextPage),
        totalPages: asNumber(env.totalPages),
        totalCount: asNumber(env.totalCount),
        last: asBoolean(env.last),
      },
    };
  }
  return { rows: [], meta: {} };
};

const computeHasMore = (
  meta: ParseResult['meta'],
  page: number,
  pageSize: number,
  addedCount: number,
) => {
  if (typeof meta.last === 'boolean') return !meta.last;
  if (typeof meta.hasNextPage === 'boolean') return meta.hasNextPage;
  if (typeof meta.totalPages === 'number') return page + 1 < meta.totalPages;
  if (typeof meta.totalCount === 'number') return (page + 1) * pageSize < meta.totalCount;
  return addedCount > 0;
};

const formatEventDateTime = (dateString: string): { date: string; time: string } => {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { date: '??.??', time: '??:??' };
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return { date: `${dd}.${mm}`, time: `${hh}:${mi}` };
  } catch {
    return { date: '??.??', time: '??:??' };
  }
};

const adaptItems = (rows: ShortlistItemDto[]): FavoritePageEvent[] =>
  rows.map((a) => {
    const { date, time } = formatEventDateTime(a.date);
    const imgs = Array.isArray(a.imageURL) ? a.imageURL : a.imageURL ? [a.imageURL] : [];
    return {
      id: a.id,
      name: a.name,
      date: a.date,
      address: a.address,
      imageURL: imgs,
      description: a.description,
      isFavorite: true,
      starred: !!a.starred,
      formattedDate: date,
      formattedTime: time,
      addedAt: a.addedAt,
      favoriteAddedAt: a.favoriteAddedAt,
      createdAt: a.createdAt,
    } as FavoritePageEvent;
  });

function mergeAppendUnique<T extends { id: string | number }>(prev: T[], incoming: T[]) {
  const seen = new Set(prev.map((e) => String(e.id)));
  const onlyNew = incoming.filter((e) => !seen.has(String(e.id)));
  return [...prev, ...onlyNew];
}

export function useFavorites(pageSize = 10) {
  const [items, setItems] = useState<FavoritePageEvent[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reqIdRef = useRef(0);

  const loadPage = useCallback(
    async (targetPage: number, append: boolean) => {
      if (isFetching) return;
      const myReq = ++reqIdRef.current;
      setIsFetching(true);
      setError(null);
      try {
        const raw: unknown = await getShortlist(pageSize, targetPage);
        if (myReq !== reqIdRef.current) return;

        const { rows, meta } = parseResponse(raw);
        const adapted = adaptItems(rows);

        let addedCount = adapted.length;
        if (append) {
          const prevIds = new Set(items.map((e) => String(e.id)));
          const unique = adapted.filter((e) => !prevIds.has(String(e.id)));
          addedCount = unique.length;
          setItems((prev) => mergeAppendUnique(prev, unique));
        } else {
          setItems(adapted);
        }

        const nextHasMore = computeHasMore(meta, targetPage, pageSize, addedCount);
        setHasMore(nextHasMore);
        setPage((p) => Math.max(p, targetPage));
      } catch (e) {
        if (myReq === reqIdRef.current) setError(e as Error);
      } finally {
        if (myReq === reqIdRef.current) {
          setIsFetching(false);
          setLoading(false);
        }
      }
    },
    [isFetching, items, pageSize],
  );

  const resetAndLoad = useCallback(async () => {
    setLoading(true);
    setItems([]);
    setPage(0);
    setHasMore(true);
    await loadPage(0, false);
  }, [loadPage]);

  const loadNext = useCallback(async () => {
    if (!hasMore || isFetching) return;
    await loadPage(page + 1, true);
  }, [hasMore, isFetching, loadPage, page]);

  const onStarToggle = useCallback(
    async (eventId: Id) => {
      const id = String(eventId);
      const prev = items;
      const next = prev.map((e) => (String(e.id) === id ? { ...e, starred: !e.starred } : e));
      setItems(next);
      writeCachedFeedback(id, { starred: !!next.find((e) => String(e.id) === id)?.starred });
      try {
        const prevStar = !!prev.find((e) => String(e.id) === id)?.starred;
        await toggleFavorite(prevStar, id);
      } catch {
        setItems(prev);
      }
    },
    [items],
  );

  const onDislike = useCallback(
    async (eventId: Id) => {
      const id = String(eventId);
      const removed = items.find((e) => String(e.id) === id);
      const prev = items;
      const next = items.filter((e) => String(e.id) !== id);
      setItems(next);

      const expectedMin = pageSize * (page + 1);
      if (next.length < expectedMin && hasMore && !isFetching) {
        void loadPage(page + 1, true);
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
          starredFromUI,
        );
        clearCachedFeedback(id);
      } catch {
        setItems(prev);
      }
    },
    [items, page, hasMore, isFetching, loadPage, pageSize],
  );

  return {
    items,
    page,
    hasMore,
    loading,
    isFetching,
    error,
    resetAndLoad,
    loadNext,
    onStarToggle,
    onDislike,
  };
}