import styles from './Navigation.module.css';

import { Link } from 'react-router-dom';

import { FavoriteIcon } from '../../icons/Navigation/FavoriteIcon.jsx';
import { MainIcon } from '../../icons/Navigation/MainIcon.jsx';

export const Navigation = () => {
    return (
        <nav className={styles.navigation}>
            <div className={styles.fullNavContent}>
                <div className={styles.navButton}>
                    <Link to={'/favorites'}>
                        <FavoriteIcon />
                    </Link>
                </div>
                <div className={styles.navButton}>
                    <Link to={'/'}>
                        <MainIcon />
                    </Link>
                </div>
            </div>
        </nav>
    );
};
