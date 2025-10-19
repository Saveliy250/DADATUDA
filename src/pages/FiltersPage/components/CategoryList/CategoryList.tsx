import React from 'react';

import styles from './CategoryList.module.css';

import { filterCategories } from '../../../../tools/filterCategories';

import { CategoryButton } from '../CategoryButtons/CategoryButtons';

interface CategoryListProps {
    selectedCategories: string[];
    setSelectedCategories: (categories: string[]) => void;
}

export const CategoryList = ({ selectedCategories, setSelectedCategories }: CategoryListProps) => {
    const handleCategoryClick = (category: string) => {
        const newCategories = selectedCategories.includes(category)
            ? selectedCategories.filter((item) => item !== category)
            : [...selectedCategories, category];
        setSelectedCategories(newCategories);
    };

    return (
        <div className={styles.categories}>
            {filterCategories.map((category) => (
                <CategoryButton
                    key={category.id}
                    dataValue={category.dataValue}
                    onClick={() => handleCategoryClick(category.dataValue)}
                    selected={selectedCategories.includes(category.dataValue)}
                >
                    {category.icon}
                    {category.value}
                </CategoryButton>
            ))}
        </div>
    );
};
