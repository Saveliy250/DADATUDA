import React from 'react';

import styles from './Header.module.css';

interface HeaderProps {
    handleClick?: (event: React.MouseEvent) => void;
    title: string;
    withIcon?: boolean;
}

export const Header = ({ handleClick, title, withIcon }: HeaderProps) => {
    return (
        <header className={styles.headerFilter}>
            <div className={styles.headerLeft}>
                {withIcon && (
                    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.14258 15.1523L19.4206 15.1523" stroke="black" strokeWidth="1.68566" />
                        <path
                            d="M15.3301 7.78421L21.2285 15.1881L15.3301 22.4502"
                            stroke="black"
                            strokeWidth="1.68566"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M21.1897 1H9.09424C-1.69809 1 -1.69807 15.1528 9.09424 15.1528H21.1897"
                            stroke="black"
                            strokeWidth="1.68566"
                        />
                    </svg>
                )}

                <h1>{title}</h1>
            </div>
            <div className={styles.headerRight}>
                <button className={styles.closeButton} onClick={handleClick}></button>
            </div>
        </header>
    );
};
