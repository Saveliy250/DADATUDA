import React, { ReactNode, useCallback, useEffect, useState } from 'react';

import { eventForUser } from '../tools/api/api';

import { Event as CustomEvent } from '../shared/models/event';

import { formatDate } from '../tools/FormatDate';

import { FilterContext } from './FilterContextValue';

const INITIAL_PRICE: [number, number] = [0, 5000];
const INITIAL_DATE: [Date | null, Date | null] = [null, null];
const INITIAL_SEARCH_QUERY: string = '';

const PAGE_SIZE = 10;

interface FilterProviderProps {
    children: ReactNode;
}

export const FilterProvider = ({ children }: FilterProviderProps) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [price, setPrice] = useState<[number, number]>(INITIAL_PRICE);
    const [date, setDate] = useState<[Date | null, Date | null]>(INITIAL_DATE);
    const [searchQuery, setSearchQuery] = useState<string>(INITIAL_SEARCH_QUERY);
    const [isDirty, setIsDirty] = useState(false);

    const [events, setEvents] = useState<CustomEvent[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [noResults, setNoResults] = useState(false);

    const handleResetFilters = useCallback(() => {
        setSelectedCategories([]);
        setPrice(INITIAL_PRICE);
        setDate(INITIAL_DATE);
        setSearchQuery(INITIAL_SEARCH_QUERY);
        setPage(1);
        setNoResults(false);
    }, []);

    useEffect(() => {
        const isCategoriesChanged = selectedCategories.length > 0;
        const isPriceChanged = price[0] !== INITIAL_PRICE[0] || price[1] !== INITIAL_PRICE[1];
        const isDateChanged = date[0] !== INITIAL_DATE[0] || date[1] !== INITIAL_DATE[1];
        const isSearchQueryChanged = searchQuery !== INITIAL_SEARCH_QUERY;

        setIsDirty(isCategoriesChanged || isPriceChanged || isDateChanged || isSearchQueryChanged);
    }, [selectedCategories, price, date, searchQuery]);

    const fetchEvents = useCallback(
        async (pageNumber: number, append: boolean) => {
            setLoading(true);
            setError(null);
            setNoResults(false);

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

                if (areFiltersActive && currentFetchedEvents.length === 0 && pageNumber === 1) {
                    setNoResults(true);
                    setEvents([]);
                    setHasMore(false);
                } else {
                    setEvents((prevEvents) => {
                        const newEvents = append ? [...prevEvents, ...currentFetchedEvents] : currentFetchedEvents;
                        return Array.from(new Map(newEvents.map((event) => [event.id, event])).values());
                    });
                    setHasMore(currentFetchedEvents.length === PAGE_SIZE);
                }
            } catch (err) {
                let errorMessage = 'Failed to fetch events';
                if (err instanceof Error && err.message) {
                    errorMessage = err.message;
                }
                setError(errorMessage);
                setEvents([]);
                setHasMore(false);
            } finally {
                setLoading(false);
            }
        },
        [selectedCategories, price, date, searchQuery],
    );

    const handleApplyFilters = useCallback(async () => {
        setPage(1);
        await fetchEvents(1, false);
    }, [fetchEvents]);

    const loadMoreEvents = useCallback(async () => {
        if (loading || !hasMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        await fetchEvents(nextPage, true);
    }, [loading, hasMore, page, fetchEvents]);

    useEffect(() => {
        void handleApplyFilters();
    }, [handleApplyFilters]);

    const removeEventFromDisplay = useCallback(
        (eventId: number) => {
            setEvents((prevEvents) => {
                const updatedEvents = prevEvents.filter((event) => event.id !== eventId);

                if (updatedEvents.length < PAGE_SIZE / 2 && hasMore && !loading) {
                    void loadMoreEvents();
                }
                return updatedEvents;
            });
        },
        [loading, hasMore, page, fetchEvents],
    );

    const addEventToDisplay = useCallback((event: CustomEvent) => {
        setEvents((prevEvents) => [...prevEvents, event]);
    }, []);

    const contextValue = {
        selectedCategories,
        setSelectedCategories,
        price,
        setPrice,
        date,
        setDate,
        searchQuery,
        setSearchQuery,
        isDirty,
        handleApplyFilters,
        handleResetFilters,
        events,
        loading,
        error,
        removeEventFromDisplay,
        loadMoreEvents,
        noResults,
        addEventToDisplay,
    };

    return <FilterContext.Provider value={contextValue}>{children}</FilterContext.Provider>;
};
