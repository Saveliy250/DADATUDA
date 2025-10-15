import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Event as CustomEvent } from '../shared/models/event';
import { eventForUser } from '../tools/api/api';
import { formatDate } from '../tools/FormatDate';
import { logger } from '../tools/logger';

const INITIAL_PRICE: [number, number] = [0, 5000];
const INITIAL_DATE: [Date | null, Date | null] = [null, null];
const INITIAL_SEARCH_QUERY: string = '';
const PAGE_SIZE = 10;

interface FilterState {
    selectedCategories: string[];
    price: [number, number];
    date: [Date | null, Date | null];
    searchQuery: string;
    isDirty: boolean;
    events: CustomEvent[];
    loading: boolean;
    error: string | null;
    page: number;
    hasMore: boolean;
    noResults: boolean;
}

interface FilterActions {
    setSelectedCategories: (categories: string[]) => void;
    setPrice: (price: [number, number]) => void;
    setDate: (date: [Date | null, Date | null]) => void;
    setSearchQuery: (query: string) => void;
    resetFilters: () => void;
    applyFilters: () => Promise<void>;
    loadMoreEvents: () => Promise<void>;
    removeEventFromDisplay: (eventId: number) => void;
    addEventToDisplay: (event: CustomEvent) => void;
    fetchEvents: (pageNumber: number, append: boolean) => Promise<void>;
    checkDirty: () => void;
}

export const useFilterStore = create<FilterState & FilterActions>()(
    devtools((set, get) => ({
        selectedCategories: [],
        price: INITIAL_PRICE,
        date: INITIAL_DATE,
        searchQuery: INITIAL_SEARCH_QUERY,
        isDirty: false,
        events: [],
        loading: false,
        error: null,
        page: 1,
        hasMore: true,
        noResults: false,

        setSelectedCategories: (categories) => {
            logger.info('[filterStore.setSelectedCategories]', categories);
            set({ selectedCategories: categories });
            get().checkDirty();
        },
        setPrice: (price) => {
            logger.info('[filterStore.setPrice]', price);
            set({ price });
            get().checkDirty();
        },
        setDate: (date) => {
            logger.info('[filterStore.setDate]', date);
            set({ date });
            get().checkDirty();
        },
        setSearchQuery: (query) => {
            logger.info('[filterStore.setSearchQuery]', query);
            set({ searchQuery: query });
            get().checkDirty();
        },
        checkDirty: () => {
            const { selectedCategories, price, date, searchQuery } = get();
            const isCategoriesChanged = selectedCategories.length > 0;
            const isPriceChanged = price[0] !== INITIAL_PRICE[0] || price[1] !== INITIAL_PRICE[1];
            const isDateChanged = date[0] !== INITIAL_DATE[0] || date[1] !== INITIAL_DATE[1];
            const isSearchQueryChanged = searchQuery !== INITIAL_SEARCH_QUERY;
            set({ isDirty: isCategoriesChanged || isPriceChanged || isDateChanged || isSearchQueryChanged });
        },
        resetFilters: () => {
            logger.info('[filterStore.resetFilters] called');
            set({
                selectedCategories: [],
                price: INITIAL_PRICE,
                date: INITIAL_DATE,
                searchQuery: INITIAL_SEARCH_QUERY,
                page: 1,
                noResults: false,
            });
            get().checkDirty();
        },
        fetchEvents: async (pageNumber, append) => {
            const { selectedCategories, price, date, searchQuery, events } = get();
            logger.info('[filterStore.fetchEvents] start', { pageNumber, append });
            set({ loading: true, error: null, noResults: false });

            const areFiltersActive =
                selectedCategories.length > 0 ||
                price[0] !== INITIAL_PRICE[0] ||
                price[1] !== INITIAL_PRICE[1] ||
                (date[0] !== INITIAL_DATE[0] && date[0] !== null) ||
                (date[1] !== INITIAL_DATE[1] && date[1] !== null) ||
                searchQuery !== INITIAL_SEARCH_QUERY;

            try {
                const filterData = {
                    categories: selectedCategories.join(','),
                    price_min: price[0],
                    price_max: price[1],
                    start_date_time: formatDate(date[0]),
                    end_date_time: formatDate(date[1]),
                    search: searchQuery,
                };

                const currentFetchedEvents = await eventForUser(
                    PAGE_SIZE,
                    filterData.categories,
                    filterData.search,
                    filterData.price_min,
                    filterData.price_max,
                    filterData.start_date_time,
                    filterData.end_date_time,
                    pageNumber,
                );
                logger.info('[filterStore.fetchEvents] success', { count: currentFetchedEvents.length });

                if (areFiltersActive && currentFetchedEvents.length === 0 && pageNumber === 1) {
                    set({ noResults: true, events: [], hasMore: false });
                } else {
                    const newEvents = append ? [...events, ...currentFetchedEvents] : currentFetchedEvents;
                    const uniqueEvents = Array.from(new Map(newEvents.map((event) => [event.id, event])).values());
                    set({ events: uniqueEvents, hasMore: currentFetchedEvents.length === PAGE_SIZE });
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
                logger.error(err, '[filterStore.fetchEvents] failed');
                set({ error: errorMessage, events: [], hasMore: false });
            } finally {
                set({ loading: false });
            }
        },
        applyFilters: async () => {
            logger.info('[filterStore.applyFilters] called');
            set({ page: 1 });
            await get().fetchEvents(1, false);
        },
        loadMoreEvents: async () => {
            const { loading, hasMore, page } = get();
            if (loading || !hasMore) return;
            logger.info('[filterStore.loadMoreEvents] called');
            const nextPage = page + 1;
            set({ page: nextPage });
            await get().fetchEvents(nextPage, true);
        },
        removeEventFromDisplay: (eventId) => {
            logger.info('[filterStore.removeEventFromDisplay]', { eventId });
            const { events, hasMore, loading } = get();
            const updatedEvents = events.filter((event) => event.id !== eventId);
            set({ events: updatedEvents });

            if (updatedEvents.length < PAGE_SIZE / 2 && hasMore && !loading) {
                get().loadMoreEvents();
            }
        },
        addEventToDisplay: (event) => {
            logger.info('[filterStore.addEventToDisplay]', { eventId: event.id });
            set((state) => ({ events: [...state.events, event] }));
        },
    })),
);