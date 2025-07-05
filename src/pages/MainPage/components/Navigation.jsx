import '../mainPage.css';

import { Link, useLocation } from 'react-router-dom';
import { MainScreenOnIcon } from '../../../shared/icons/MainScreenOnIcon.jsx';
import { MainScreenOffIcon } from '../../../shared/icons/MainScreenOffIcon.jsx';
import { WhiteLogoIcon } from '../../../shared/icons/WhiteLogoIcon.jsx';
import { HeartIconOn } from '../../../shared/icons/HeartIconOn.jsx';
import { HeartIconOff } from '../../../shared/icons/HeartIconOff.jsx';

export const Navigation = () => {
    const location = useLocation();
    const isFavorites = location.pathname === '/favorites';
    const isMain = location.pathname === '/';

    return (
        <nav className="navigation">
            <div className="navigation-content">
                <Link to={'/'} className="mainButton">
                    {isMain ? <MainScreenOnIcon /> : <MainScreenOffIcon />}
                </Link>
                <WhiteLogoIcon />
                <Link to={'/favorites'} className="likedButton">
                    {isFavorites ? <HeartIconOn /> : <HeartIconOff />}
                </Link>
            </div>
        </nav>
    );
};
