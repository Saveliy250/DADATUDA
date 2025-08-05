import React from 'react';

import styles from './CategoryList.module.css';

import { filterCategories } from '../../../../tools/filterCategories';

import { CategoryButton } from '../CategoryButtons/CategoryButtons';

interface CategoryListProps {
    selectedCategories: string[];
    setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

export const CategoryList: React.FC<CategoryListProps> = ({ selectedCategories, setSelectedCategories }) => {
    const handleCategoryClick = (category: string) => {
        setSelectedCategories((prev) => {
            if (prev.includes(category)) {
                return prev.filter((item) => item !== category);
            } else {
                return [...prev, category];
            }
        });
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
