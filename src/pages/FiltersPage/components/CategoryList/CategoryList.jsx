import styles from './CategoryList.module.css';

import { filterCategories } from '../../../../tools/filterCategories.jsx';
import { CategoryButton } from '../CategoryButtons/CategoryButtons.jsx';

export const CategoryList = ({ selectedCategories, setSelectedCategories }) => {
    const handleCategoryClick = (category) => {
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
