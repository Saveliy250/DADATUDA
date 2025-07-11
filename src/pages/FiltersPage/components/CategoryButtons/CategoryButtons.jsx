import styles from './CategoryButtons.module.css';

export const CategoryButton = ({ children, dataValue, className = '', onClick, selected }) => {
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
