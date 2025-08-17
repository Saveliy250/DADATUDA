import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navigation.module.css';

export const Navigation = () => {
  const { pathname } = useLocation();
  const isMain = pathname === '/' || pathname === '';
  const isFavorites = pathname.startsWith('/favorites');

  return (
    <nav className={styles.navigation}>
      <div className={styles.fullNavContent}>
        <div className={styles.navButton}>
          <Link to="/">
            <img
              src={isMain ? '/img/eye-yellow.svg' : '/img/eye-gray.svg'}
              alt="Главная"
              className={styles.navImg}
            />
          </Link>
        </div>

        <div className={styles.navButton}>
          <Link to="/favorites">
            <img
              src={isFavorites ? '/img/heart-yellow.svg' : '/img/heart-gray.svg'}
              alt="Избранное"
              className={styles.navImg}
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};