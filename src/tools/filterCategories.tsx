import { ReactNode } from 'react';

import { TheaterIcon } from '../shared/icons/EventIcons/TheaterIcon';

interface Category {
    id: number;
    dataValue: string;
    value: string;
    icon: ReactNode;
}

export const filterCategories: Category[] = [
    { id: 1, dataValue: 'Культура и творчество', value: 'культура и творчество', icon: <TheaterIcon color="gray" /> },
    { id: 2, dataValue: 'Активный отдых', value: 'активный отдых', icon: <TheaterIcon color="gray" /> },
    { id: 3, dataValue: 'Еда и гастрономия', value: 'еда и гастрономия', icon: <TheaterIcon color="gray" /> },
    { id: 4, dataValue: 'Красота и здоровье', value: 'красота и здоровье', icon: <TheaterIcon color="gray" /> },
    { id: 5, dataValue: 'Развлечения и досуг', value: 'развлечения и досуг', icon: <TheaterIcon color="gray" /> },
    { id: 6, dataValue: 'Клубы и вечеринки', value: 'клубы и вечеринки', icon: <TheaterIcon color="gray" /> },
    { id: 7, dataValue: 'Образование и развитие', value: 'образование и развитие', icon: <TheaterIcon color="gray" /> },
    { id: 8, dataValue: 'Другое', value: 'другое', icon: <TheaterIcon color="gray" /> },
];
