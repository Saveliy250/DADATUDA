import React from 'react';

import styles from './ArrowSubtitle.module.css';

import { FilterSubIcon } from '../../icons/FilterSubIcon';

interface ArrowSubtitleProps {
    withText?: boolean;
    subtitle?: React.ReactNode;
    color?: string;
    className?: string;
}

export const ArrowSubtitle: React.FC<ArrowSubtitleProps> = ({ withText = true, subtitle, color, className = '' }) => {
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
