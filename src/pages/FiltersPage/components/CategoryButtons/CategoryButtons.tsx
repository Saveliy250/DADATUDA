import React from 'react';
import styles from './CategoryButtons.module.css';

interface CategoryButtonProps {
    children: React.ReactNode;
    dataValue: string;
    className?: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    selected: boolean;
}

export const CategoryButton = ({ children, dataValue, className = '', onClick, selected }: CategoryButtonProps) => {
    return (
        <button
            className={`${styles.categoryButton} ${className} ${selected ? `${styles.selected}` : ''}`}
            data-value={dataValue}
            onClick={onClick}
        >
            <div className={styles.icon}>{children}</div>
        </button>
    );
};
