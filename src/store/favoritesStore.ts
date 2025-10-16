import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getShortlist, toggleFavorite } from '../tools/api/api';
import { clearCachedFeedback, writeCachedFeedback } from '../tools/feedbackCache';
import type { FavoritePageEvent } from '../pages/FavoritesPage/types';
import { Event as CustomEvent } from '../shared/models/event';
import { logger } from '../tools/logger';
import { formatEventDateTime } from '../tools/FormatDate';
import { normalize } from '../tools/stringUtils';

type Id = string | number;

interface FavoritesState {
  events: FavoritePageEvent[];
  loading: boolean;
  isFetching: boolean;
  error: Error | null;
  page: number;
  hasMore: boolean;
  searchTerm: string;
  showStarredOnly: boolean;
}

interface FavoritesActions {
  setSearchTerm: (term: string) => void;
  setShowStarredOnly: (show: boolean) => void;
  loadShortlist: () => Promise<void>;
  loadNext: () => Promise<void>;
  toggleStar: (eventId: Id) => Promise<void>;
  removeFavorite: (eventId: Id) => Promise<void>;
  addFavorite: (event: CustomEvent) => Promise<void>;
  getFilteredEvents: () => FavoritePageEvent[];
}

type Meta = { last?: boolean; hasNextPage?: boolean; totalPages?: number; totalCount?: number };

type ShortlistItemDto = {
  id: Id;
  name: string;
  date: string;
  address?: string;
  imageURL?: string[] | string;
  description?: string;
  starred?: boolean;
  addedAt?: string;
  favoriteAddedAt?: string;
  createdAt?: string;
};

const PAGE_SIZE = 10;

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object';
const asBool = (v: unknown) => (typeof v === 'boolean' ? v : undefined);
const asNum = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const arrOf = <T,>(v: unknown, guard: (x: unknown) => x is T): T[] => (Array.isArray(v) ? v.filter(guard) : []);
const isItem = (v: unknown): v is ShortlistItemDto => isObj(v) && 'id' in v && 'name' in v && 'date' in v;

const parseResponse = (data: unknown): { rows: ShortlistItemDto[]; meta: Meta } => {
  if (Array.isArray(data)) return { rows: arrOf<ShortlistItemDto>(data, isItem), meta: {} };
  if (isObj(data)) {
    const rows = arrOf<ShortlistItemDto>((data as any).items, isItem);
    const meta: Meta = {
      last: asBool((data as any).last),
      hasNextPage: asBool((data as any).hasNextPage),
      totalPages: asNum((data as any).totalPages),
      totalCount: asNum((data as any).totalCount),
    };
    return { rows, meta };
  }
  return { rows: [], meta: {} };
};

const computeHasMore = (meta: Meta, page: number, pageSize: number, added: number) => {
  if (typeof meta.last === 'boolean') return !meta.last;
  if (typeof meta.hasNextPage === 'boolean') return meta.hasNextPage;
  if (typeof meta.totalPages === 'number') return page + 1 < meta.totalPages;
  if (typeof meta.totalCount === 'number') return (page + 1) * pageSize < meta.totalCount;
  return added > 0;
};

const adapt = (rows: ShortlistItemDto[]): FavoritePageEvent[] =>
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
      isFavorite: a.starred || false,
      starred: !!a.starred,
      formattedDate: date,
      formattedTime: time,
      addedAt: a.addedAt,
      favoriteAddedAt: a.favoriteAddedAt,
      createdAt: a.createdAt,
    } as FavoritePageEvent;
  });

const mergeAppendUnique = <T extends { id: Id }>(prev: T[], incoming: T[]) => {
  const seen = new Set(prev.map((e) => String(e.id)));
  const onlyNew = incoming.filter((e) => !seen.has(String(e.id)));
  return [...prev, ...onlyNew];
};

export const useFavoritesStore = create<FavoritesState & FavoritesActions>()(
  devtools((set, get) => ({
    events: [],
    loading: true,
    isFetching: false,
    error: null,
    page: 0,
    hasMore: true,
    searchTerm: '',
    showStarredOnly: true,

    setSearchTerm: (term) => {
      logger.info('[favoritesStore.setSearchTerm]', { term });
      set({ searchTerm: term });
    },
    setShowStarredOnly: (show) => {
      logger.info('[favoritesStore.setShowStarredOnly]', { show });
      set({ showStarredOnly: show });
    },

    loadShortlist: async () => {
      const { isFetching } = get();
      if (isFetching) return;
      logger.info('[favoritesStore.loadShortlist] start');
      set({ loading: true, isFetching: true, error: null, events: [], page: 0, hasMore: true });
      try {
        const raw: unknown = await getShortlist(PAGE_SIZE, 0);
        const { rows, meta } = parseResponse(raw);
        const adaptedRows = adapt(rows);
        const addedCount = adaptedRows.length;
        const hasMore = computeHasMore(meta, 0, PAGE_SIZE, addedCount);
        set({ events: adaptedRows, page: 0, hasMore, error: null });
        logger.info('[favoritesStore.loadShortlist] success', { count: adaptedRows.length, hasMore });
      } catch (e) {
        const err = e instanceof Error ? e : new Error('An unknown error occurred');
        logger.error(err, '[favoritesStore.loadShortlist] failed');
        set({ error: err });
      } finally {
        set({ loading: false, isFetching: false });
      }
    },

    loadNext: async () => {
      const { isFetching, hasMore, page, events } = get();
      if (isFetching || !hasMore) return;
      const nextPage = page + 1;
      logger.info('[favoritesStore.loadNext] start', { nextPage });
      set({ isFetching: true, error: null });
      try {
        const raw: unknown = await getShortlist(PAGE_SIZE, nextPage);
        const { rows, meta } = parseResponse(raw);
        const adaptedRows = adapt(rows);
        const prevIds = new Set(events.map((e) => String(e.id)));
        const unique = adaptedRows.filter((e) => !prevIds.has(String(e.id)));
        const addedCount = unique.length;
        const merged = mergeAppendUnique(events, unique);
        const nextHasMore = computeHasMore(meta, nextPage, PAGE_SIZE, addedCount);
        set({ events: merged, page: nextPage, hasMore: nextHasMore, error: null });
        logger.info('[favoritesStore.loadNext] success', {
          nextPage,
          received: adaptedRows.length,
          added: addedCount,
          hasMore: nextHasMore,
        });
      } catch (e) {
        const err = e instanceof Error ? e : new Error('An unknown error occurred');
        logger.error(err, '[favoritesStore.loadNext] failed');
        set({ error: err });
      } finally {
        set({ isFetching: false });
      }
    },

    toggleStar: async (eventId) => {
      const id = String(eventId);
      logger.info('[favoritesStore.toggleStar] start', { eventId: id });
      const prev = get().events;
      const prevStar = !!prev.find((e) => String(e.id) === id)?.starred;
      const next = prev.map((e) => (String(e.id) === id ? { ...e, starred: !e.starred } : e));
      set({ events: next });
      writeCachedFeedback(id, { starred: !prevStar });
      try {
        await toggleFavorite(prevStar, id);
        logger.info('[favoritesStore.toggleStar] success', { eventId: id, starred: !prevStar });
      } catch (e) {
        const err = e instanceof Error ? e : new Error('An unknown error occurred');
        logger.error(err, '[favoritesStore.toggleStar] failed');
        set({ events: prev });
        writeCachedFeedback(id, { starred: prevStar });
      }
    },

    removeFavorite: async (eventId) => {
      const id = String(eventId);
      logger.info('[favoritesStore.removeFavorite] start', { eventId: id });
      const { events, page, hasMore, isFetching } = get();
      const prev = events;
      const next = events.filter((e) => String(e.id) !== id);
      set({ events: next });
      try {
        await toggleFavorite(true, id);
        clearCachedFeedback(id);
        logger.info('[favoritesStore.removeFavorite] success', { eventId: id });
        const expectedMin = PAGE_SIZE * (page + 1);
        if (next.length < expectedMin && hasMore && !isFetching) {
          await get().loadNext();
        }
      } catch (e) {
        const err = e instanceof Error ? e : new Error('An unknown error occurred');
        logger.error(err, '[favoritesStore.removeFavorite] failed');
        set({ events: prev });
      }
    },

    addFavorite: async (event: CustomEvent) => {
      logger.info('[favoritesStore.addFavorite] start', { eventId: event.id });
      const { date, time } = formatEventDateTime(event.date);
      const favoriteEvent: FavoritePageEvent = {
        ...event,
        isFavorite: true,
        starred: false,
        formattedDate: date,
        formattedTime: time,
      };
      set((state) => ({ events: [...state.events, favoriteEvent] }));
      try {
        await toggleFavorite(false, String(event.id));
        logger.info('[favoritesStore.addFavorite] success', { eventId: event.id });
      } catch (e) {
        const err = e instanceof Error ? e : new Error('An unknown error occurred');
        logger.error(err, '[favoritesStore.addFavorite] failed');
        set((state) => ({ events: state.events.filter((e) => e.id !== event.id) }));
      }
    },

    getFilteredEvents: () => {
      const { events, searchTerm, showStarredOnly } = get();
      let filtered = events;
      if (showStarredOnly) filtered = filtered.filter((e) => e.starred);
      const raw = searchTerm.trim();
      if (raw) {
        const q = normalize(raw);
        filtered = filtered.filter((e) => {
          const haystack = [e.name || '', e.description || '', e.address || '', `${e.formattedDate || ''} ${e.formattedTime || ''}`];
          return haystack.some((field) => normalize(field).includes(q));
        });
      }
      return filtered;
    },
  })),
);