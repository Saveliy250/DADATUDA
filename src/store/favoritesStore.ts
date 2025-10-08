import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getShortlist, toggleFavorite } from '../tools/api/api';
import { clearCachedFeedback, writeCachedFeedback } from '../tools/feedbackCache';
import type { FavoritePageEvent } from '../pages/FavoritesPage/types';
import { Event as CustomEvent } from '../shared/models/event';
import { logger } from '../tools/logger';

import { formatEventDateTime } from '../tools/FormatDate';

import { normalize } from '../tools/stringUtils';

interface FavoritesState {
    events: FavoritePageEvent[];
    loading: boolean;
    error: Error | null;
    searchTerm: string;
    showStarredOnly: boolean;
}

interface FavoritesActions {
    setSearchTerm: (term: string) => void;
    setShowStarredOnly: (show: boolean) => void;
    loadShortlist: () => Promise<void>;
    toggleStar: (eventId: string | number) => Promise<void>;
    removeFavorite: (eventId: string | number) => Promise<void>;
    addFavorite: (event: CustomEvent) => Promise<void>;
    getFilteredEvents: () => FavoritePageEvent[];
}

export const useFavoritesStore = create<FavoritesState & FavoritesActions>()(
    devtools((set, get) => ({
        events: [],
        loading: true,
        error: null,
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
            logger.info('[favoritesStore.loadShortlist] start');
            set({ loading: true, error: null });
            try {
                const apiData = await getShortlist(10, 0);
                const adapted: FavoritePageEvent[] = apiData.map((a) => {
                    const { date, time } = formatEventDateTime(a.date);
                    return {
                        id: a.id,
                        name: a.name,
                        date: a.date,
                        address: a.address,
                        imageURL: a.imageURL,
                        description: a.description,
                        isFavorite: a.starred || false,
                        starred: a.starred,
                        formattedDate: date,
                        formattedTime: time,
                    };
                });
                set({ events: adapted });
                logger.info('[favoritesStore.loadShortlist] success', { count: adapted.length });
            } catch (e) {
                const err = e instanceof Error ? e : new Error('An unknown error occurred');
                logger.error(err, '[favoritesStore.loadShortlist] failed');
                set({ error: err });
            } finally {
                set({ loading: false });
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
                set((state) => ({
                    events: state.events.filter((e) => e.id !== event.id),
                }));
            }
        },

        toggleStar: async (eventId) => {
            const id = String(eventId);
            logger.info('[favoritesStore.toggleStar] start', { eventId: id });
            const prevEvent = get().events.find((e) => e.id === eventId);
            const prevStarred = !!prevEvent?.starred;
            const nextStarred = !prevStarred;

            set((state) => ({
                events: state.events.map((e) => (e.id === eventId ? { ...e, starred: nextStarred } : e)),
            }));
            writeCachedFeedback(id, { starred: nextStarred });

            try {
                await toggleFavorite(prevStarred, id);
                logger.info('[favoritesStore.toggleStar] success', { eventId: id, starred: nextStarred });
            } catch (e) {
                const err = e instanceof Error ? e : new Error('An unknown error occurred');
                logger.error(err, '[favoritesStore.toggleStar] failed');
                set((state) => ({
                    events: state.events.map((e) => (e.id === eventId ? { ...e, starred: prevStarred } : e)),
                }));
                writeCachedFeedback(id, { starred: prevStarred });
            }
        },

        removeFavorite: async (eventId) => {
            const id = String(eventId);
            logger.info('[favoritesStore.removeFavorite] start', { eventId: id });
            const prevEvents = get().events;

            set((state) => ({
                events: state.events.filter((e) => e.id !== eventId),
            }));

            try {
                await toggleFavorite(true, id);
                clearCachedFeedback(id);
                logger.info('[favoritesStore.removeFavorite] success', { eventId: id });
            } catch (e) {
                const err = e instanceof Error ? e : new Error('An unknown error occurred');
                logger.error(err, '[favoritesStore.removeFavorite] failed');
                set({ events: prevEvents });
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
        },
    })),
);