import React, {useEffect, useState} from "react";
import './index.css'
import './MainScreenStyle.css'
import {Link, useLocation} from 'react-router-dom'
import MainScreenOnIco from "./icons/MainScreenOnIco.jsx";
import WhiteLogoIco from "./icons/WhiteLogoIco.jsx";
import HeartIcoOff from "./icons/HeartIcoOff.jsx";
import MainScreenOffIco from "./icons/MainScreenOffIco.jsx";
import HeartIcoOn from "./icons/HeartIcoOn.jsx";
import MainCard from "./MainCard.jsx";
import FullscreenToggle from "./tools/FullScreenToggle.jsx";

function Footer () {
    const location = useLocation();
    const isFavorites = location.pathname === "/favorites";
    const isMain = location.pathname === "/";

    return (
        <footer className="fixed-footer">
            <div className="footer-content">
                <Link to={"/"} className="mainButton">
                    {isMain ? <MainScreenOnIco/> : <MainScreenOffIco/>}
                </Link>
                <WhiteLogoIco/>
                <Link to={"/favorites"} className="likedButton">
                    {isFavorites ? <HeartIcoOn/> : <HeartIcoOff/>}
                </Link>

            </div>
        </footer>
    )
}

const FiltersButton = () => {
    return(
        <Link to={'/filters'}>
            <button className="filter-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_1232_447)">
                        <path d="M1 4.75002H3.736C3.95064 5.53975 4.41917 6.23691 5.06933 6.73395C5.71948 7.23098 6.51512 7.50027 7.3335 7.50027C8.15188 7.50027 8.94752 7.23098 9.59767 6.73395C10.2478 6.23691 10.7164 5.53975 10.931 4.75002H23C23.2652 4.75002 23.5196 4.64466 23.7071 4.45712C23.8946 4.26959 24 4.01523 24 3.75002C24 3.4848 23.8946 3.23044 23.7071 3.04291C23.5196 2.85537 23.2652 2.75002 23 2.75002H10.931C10.7164 1.96028 10.2478 1.26312 9.59767 0.766084C8.94752 0.269047 8.15188 -0.000244141 7.3335 -0.000244141C6.51512 -0.000244141 5.71948 0.269047 5.06933 0.766084C4.41917 1.26312 3.95064 1.96028 3.736 2.75002H1C0.734784 2.75002 0.48043 2.85537 0.292893 3.04291C0.105357 3.23044 0 3.4848 0 3.75002C0 4.01523 0.105357 4.26959 0.292893 4.45712C0.48043 4.64466 0.734784 4.75002 1 4.75002ZM7.333 2.00002C7.67912 2.00002 8.01746 2.10265 8.30525 2.29494C8.59303 2.48724 8.81734 2.76055 8.94979 3.08032C9.08224 3.40009 9.1169 3.75196 9.04937 4.09142C8.98185 4.43089 8.81518 4.74271 8.57044 4.98745C8.3257 5.23219 8.01388 5.39887 7.67441 5.46639C7.33494 5.53391 6.98307 5.49926 6.6633 5.3668C6.34353 5.23435 6.07022 5.01005 5.87793 4.72226C5.68564 4.43448 5.583 4.09613 5.583 3.75002C5.58353 3.28605 5.76807 2.84124 6.09615 2.51316C6.42422 2.18509 6.86903 2.00054 7.333 2.00002Z" fill="white"/>
                        <path d="M23 11H20.264C20.0497 10.2101 19.5814 9.51268 18.9313 9.01544C18.2812 8.5182 17.4855 8.24878 16.667 8.24878C15.8485 8.24878 15.0528 8.5182 14.4027 9.01544C13.7526 9.51268 13.2843 10.2101 13.07 11H1C0.734784 11 0.48043 11.1054 0.292893 11.2929C0.105357 11.4804 0 11.7348 0 12C0 12.2652 0.105357 12.5196 0.292893 12.7071C0.48043 12.8947 0.734784 13 1 13H13.07C13.2843 13.7899 13.7526 14.4873 14.4027 14.9846C15.0528 15.4818 15.8485 15.7512 16.667 15.7512C17.4855 15.7512 18.2812 15.4818 18.9313 14.9846C19.5814 14.4873 20.0497 13.7899 20.264 13H23C23.2652 13 23.5196 12.8947 23.7071 12.7071C23.8946 12.5196 24 12.2652 24 12C24 11.7348 23.8946 11.4804 23.7071 11.2929C23.5196 11.1054 23.2652 11 23 11ZM16.667 13.75C16.3209 13.75 15.9825 13.6474 15.6948 13.4551C15.407 13.2628 15.1827 12.9895 15.0502 12.6697C14.9178 12.3499 14.8831 11.9981 14.9506 11.6586C15.0181 11.3191 15.1848 11.0073 15.4296 10.7626C15.6743 10.5178 15.9861 10.3512 16.3256 10.2836C16.6651 10.2161 17.0169 10.2508 17.3367 10.3832C17.6565 10.5157 17.9298 10.74 18.1221 11.0278C18.3144 11.3156 18.417 11.6539 18.417 12C18.4165 12.464 18.2319 12.9088 17.9039 13.2369C17.5758 13.5649 17.131 13.7495 16.667 13.75Z" fill="white"/>
                        <path d="M23 19.25H10.931C10.7164 18.4603 10.2478 17.7631 9.59767 17.2661C8.94752 16.769 8.15188 16.4998 7.3335 16.4998C6.51512 16.4998 5.71948 16.769 5.06933 17.2661C4.41917 17.7631 3.95064 18.4603 3.736 19.25H1C0.734784 19.25 0.48043 19.3554 0.292893 19.5429C0.105357 19.7304 0 19.9848 0 20.25C0 20.5152 0.105357 20.7696 0.292893 20.9571C0.48043 21.1447 0.734784 21.25 1 21.25H3.736C3.95064 22.0397 4.41917 22.7369 5.06933 23.2339C5.71948 23.731 6.51512 24.0003 7.3335 24.0003C8.15188 24.0003 8.94752 23.731 9.59767 23.2339C10.2478 22.7369 10.7164 22.0397 10.931 21.25H23C23.2652 21.25 23.5196 21.1447 23.7071 20.9571C23.8946 20.7696 24 20.5152 24 20.25C24 19.9848 23.8946 19.7304 23.7071 19.5429C23.5196 19.3554 23.2652 19.25 23 19.25ZM7.333 22C6.98688 22 6.64854 21.8974 6.36075 21.7051C6.07297 21.5128 5.84866 21.2395 5.71621 20.9197C5.58376 20.5999 5.5491 20.2481 5.61663 19.9086C5.68415 19.5691 5.85082 19.2573 6.09556 19.0126C6.3403 18.7678 6.65213 18.6012 6.99159 18.5336C7.33106 18.4661 7.68293 18.5008 8.0027 18.6332C8.32247 18.7657 8.59578 18.99 8.78807 19.2778C8.98036 19.5656 9.083 19.9039 9.083 20.25C9.08221 20.7139 8.89758 21.1586 8.56956 21.4866C8.24154 21.8146 7.79689 21.9992 7.333 22Z" fill="white"/>
                    </g>
                    <defs>
                        <clipPath id="clip0_1232_447">
                            <rect width="24" height="24" fill="white"/>
                        </clipPath>
                    </defs>
                </svg>
                <span>Фильтры</span>
            </button>
        </Link>
    )
}


function MainScreen() {
    const [events, setEvents] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://90.156.170.125:8080/feedback-service/shortlist/1?page_size=10&page_number=0")
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Ошибка при загрузке данных');
                }
                return response.json();
            })
            .then((data) => {
                setEvents(data);
                setLoading(false);
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            })
    }, [])

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error.message}</div>;
    }

    const currentEvent = events[currentIndex];



    return (
        <>
            <FiltersButton/>
            <MainCard
            event={currentEvent}

            />
            <Footer/>
        </>
    )
}
export  {Footer}
export default MainScreen