import { ReactNode } from 'react';
import { ConcertIcon } from '../shared/icons/ConcertIcon.jsx';
import { ExhibitionIcon } from '../shared/icons/ExhibitionIcon.jsx';
import { StandupIcon } from '../shared/icons/StandupIcon.jsx';
import { SportIcon } from '../shared/icons/SportIcon.jsx';
import { BarIcon } from '../shared/icons/BarIcon.jsx';
import { RestaurantIcon } from '../shared/icons/RestaurantIcon.jsx';
import { CafeIcon } from '../shared/icons/CafeIcon.jsx';
import { ExcursionIcon } from '../shared/icons/ExcursionIcon.jsx';
import { TheaterIcon } from '../shared/icons/EventIcons/TheaterIcon';

interface Category {
    id: number;
    dataValue: string;
    value: string;
    icon: ReactNode;
}

export const filterCategories: Category[] = [
    { id: 1, dataValue: 'theater', value: 'Спектакли', icon: <TheaterIcon /> },
    { id: 2, dataValue: 'concert', value: 'Концерты', icon: <ConcertIcon /> },
    { id: 3, dataValue: 'exhibition', value: 'Выставки', icon: <ExhibitionIcon /> },
    { id: 4, dataValue: 'standup', value: 'Стендапы', icon: <StandupIcon /> },
    { id: 5, dataValue: 'excursion', value: 'Экскурсии', icon: <ExcursionIcon /> },
    { id: 6, dataValue: 'sport', value: 'Спорт', icon: <SportIcon /> },
    { id: 7, dataValue: 'bar', value: 'Бары', icon: <BarIcon /> },
    { id: 8, dataValue: 'restaurant', value: 'Рестораны', icon: <RestaurantIcon /> },
    { id: 9, dataValue: 'cafe', value: 'Кофейни', icon: <CafeIcon /> },
];
