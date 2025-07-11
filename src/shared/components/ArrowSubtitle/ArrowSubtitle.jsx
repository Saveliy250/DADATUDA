import styles from './ArrowSubtitle.module.css';

import { FilterSubIcon } from '../../icons/FilterSubIcon.jsx';

export const ArrowSubtitle = ({ withText = true, subtitle, color, className = '' }) => {
    return (
        <div className={styles.subtitleWrapper}>
            <FilterSubIcon color={color} />
            {withText && (
                <div style={{ color: `${color}` }} className={`${styles.subtitle} ${className}`}>
                    {subtitle}
                </div>
            )}
        </div>
    );
};
