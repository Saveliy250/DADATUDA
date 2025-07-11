import styles from './Navigation.module.css';

import { Link, useLocation } from 'react-router-dom';
import { MainScreenOnIcon } from '../../icons/MainScreenOnIcon.jsx';
import { MainScreenOffIcon } from '../../icons/MainScreenOffIcon.jsx';
import { WhiteLogoIcon } from '../../icons/WhiteLogoIcon.jsx';
import { HeartIconOn } from '../../icons/HeartIconOn.jsx';
import { HeartIconOff } from '../../icons/HeartIconOff.jsx';

export const Navigation = ({ size = 'full' }) => {
    const location = useLocation();
    const isFavorites = location.pathname === '/favorites';
    const isMain = location.pathname === '/';

    return (
        <nav className={styles.navigation}>
            {size === 'full' && (
                <div className={styles.fullNavContent}>
                    <Link to={'/'}>{isMain ? <MainScreenOnIcon /> : <MainScreenOffIcon />}</Link>
                    <WhiteLogoIcon />
                    <Link to={'/favorites'}>{isFavorites ? <HeartIconOn /> : <HeartIconOff />}</Link>
                </div>
            )}
            {size === 'small' && (
                <div className={styles.smallNavContent}>
                    <Link to={'/'}>{<WhiteLogoIcon />}</Link>
                </div>
            )}
        </nav>
    );
};
