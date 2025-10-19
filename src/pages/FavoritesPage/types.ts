import type { Event } from '../../shared/models/event';

export type FavoritePageEvent = Omit<Event, 'id'> & {
    id: string | number;
    likesCount?: number;
    starred?: boolean;
    isFavorite: boolean;
    formattedDate: string;
    formattedTime: string;
};