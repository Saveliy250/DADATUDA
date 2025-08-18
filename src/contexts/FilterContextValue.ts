import React, { createContext } from 'react';

import { Event as CustomEvent } from '../shared/models/event';

export interface FilterContextType {
    selectedCategories: string[];
    setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
    price: [number, number];
    setPrice: React.Dispatch<React.SetStateAction<[number, number]>>;
    date: [Date | null, Date | null];
    setDate: React.Dispatch<React.SetStateAction<[Date | null, Date | null]>>;
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    isDirty: boolean;
    handleApplyFilters: () => Promise<void>;
    handleResetFilters: () => void;
    events: CustomEvent[];
    loading: boolean;
    error: string | null;
    removeEventFromDisplay: (eventId: number) => void;
    loadMoreEvents: () => Promise<void>;
    noResults: boolean;
    addEventToDisplay: (event: CustomEvent) => void;
}

export const FilterContext = createContext<FilterContextType | undefined>(undefined);
