import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { logger } from '../tools/logger';

interface FavoritesUIState {
  searchTerm: string;
  showStarredOnly: boolean;
}

interface FavoritesUIActions {
  setSearchTerm: (term: string) => void;
  setShowStarredOnly: (show: boolean) => void;
}

export const useFavoritesStore = create<FavoritesUIState & FavoritesUIActions>()(
  devtools((set) => ({
    searchTerm: '',
    showStarredOnly: (() => {
      try {
        const raw = localStorage.getItem('favorites.showStarredOnly');
        return raw ? JSON.parse(raw) === true : false;
      } catch {
        return false;
      }
    })(),

    setSearchTerm: (term) => {
      logger.info('[favoritesStore.setSearchTerm]', { term });
      set({ searchTerm: term });
    },
    setShowStarredOnly: (show) => {
      logger.info('[favoritesStore.setShowStarredOnly]', { show });
      try {
        localStorage.setItem('favorites.showStarredOnly', JSON.stringify(show));
      } catch {}
      set({ showStarredOnly: show });
    },
  })),
);