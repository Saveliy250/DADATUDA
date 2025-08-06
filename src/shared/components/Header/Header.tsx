import React from 'react';

import styles from './Header.module.css';

import { Link } from 'react-router-dom';

interface HeaderProps {
    handleClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    title: string;
    withIcon?: boolean;
}

export const Header = ({ handleClick, title, withIcon }: HeaderProps) => {
    return (
        <header className={styles.header}>
            {withIcon && (
                <div className={styles.icon}>
                    <Link to={'/'} id="applyBtn" onClick={handleClick}>
                        <svg width="34" height="31" viewBox="0 0 34 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 1.5L2 15.5L16 29.5" stroke="#FFFFFF" strokeWidth="2" />
                            <path d="M15.5 16H32.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </Link>
                </div>
            )}

            <div className={styles.title}>
                <h1>{title}</h1>
            </div>
        </header>
    );
};
