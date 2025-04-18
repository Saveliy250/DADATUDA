import React, {useEffect, useState} from "react";
import './index.css'
import './FavoritesPageStyle.css'
import {Footer} from "./MainScreen.jsx";
import formatDate from "../src/tools/FormatDate.jsx"
import useAuth from "./hooks/useAuth.js";
import {getShortlist} from "./tools/api.js";


const YourFavorites = () => {
    return (
        <div className={"arrow-favorites"}>
            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.4745 18.7925L23.8558 18.7925" stroke="#FF6CF1" strokeWidth="3.35446"/>
                <path d="M19.0019 10.0492L26.0002 18.8338L19.0019 27.4502" stroke="#FF6CF1" strokeWidth="3.35446" strokeLinejoin="round"/>
                <path d="M25.9548 2H11.6037C-1.20125 2 -1.20122 18.7921 11.6037 18.7921H25.9548" stroke="#FF6CF1" strokeWidth="3.35446"/>
            </svg>
            <p>избранное</p>
        </div>
    )
}

const YourLiked = () => {
    return (
        <div className={"arrow-liked"}>
            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.4745 18.7925L23.8558 18.7925" stroke="#8CF63B" strokeWidth="3.35446"/>
                <path d="M19.0019 10.0492L26.0002 18.8338L19.0019 27.4502" stroke="#8CF63B" strokeWidth="3.35446" strokeLinejoin="round"/>
                <path d="M25.9548 2H11.6037C-1.20125 2 -1.20122 18.7921 11.6037 18.7921H25.9548" stroke="#8CF63B" strokeWidth="3.35446"/>
            </svg>
            <p>понравившиеся</p>
        </div>
    )
}

const FavoriteButton = () => {
    return (
        <button className={"favorite-button"}>
            <svg width="26" height="24" viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.9559 0C17.7365 0.019926 16.5437 0.377534 15.498 1.03671C14.4522 1.69589 13.5906 2.63329 13 3.75426C12.4094 2.63329 11.5478 1.69589 10.502 1.03671C9.45627 0.377534 8.26346 0.019926 7.04407 0C5.10021 0.0887265 3.26877 0.982085 1.94989 2.4849C0.631004 3.98772 -0.0681244 5.97784 0.00524241 8.02047C0.00524241 13.1934 5.18798 18.843 9.53473 22.6735C10.5052 23.5303 11.7323 24 13 24C14.2677 24 15.4948 23.5303 16.4653 22.6735C20.812 18.843 25.9948 13.1934 25.9948 8.02047C26.0681 5.97784 25.369 3.98772 24.0501 2.4849C22.7312 0.982085 20.8998 0.0887265 18.9559 0Z" fill="#FF6CF1"/>
            </svg>
        </button>
    )
}

const FavoriteButtonBlank = () => {
    return (
        <button className={"favorite-button"}>
            <svg width="26" height="24" viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.9559 0C17.7365 0.019926 16.5437 0.377535 15.498 1.03671C14.4522 1.69589 13.5906 2.63329 13 3.75426C12.4094 2.63329 11.5478 1.69589 10.502 1.03671C9.45627 0.377535 8.26346 0.019926 7.04407 0C5.10021 0.0887265 3.26877 0.982085 1.94989 2.4849C0.631004 3.98772 -0.0681244 5.97784 0.00524241 8.02047C0.00524241 13.1934 5.18798 18.843 9.53473 22.6735C10.5052 23.5303 11.7323 24 13 24C14.2677 24 15.4948 23.5303 16.4653 22.6735C20.812 18.843 25.9948 13.1934 25.9948 8.02047C26.0681 5.97784 25.369 3.98772 24.0501 2.4849C22.7312 0.982085 20.8998 0.0887265 18.9559 0ZM15.0737 20.9329C14.4933 21.4464 13.7588 21.728 13 21.728C12.2412 21.728 11.5067 21.4464 10.9263 20.9329C5.36233 16.0284 2.17104 11.3231 2.17104 8.02047C2.09701 6.58101 2.56777 5.1692 3.48065 4.09294C4.39353 3.01669 5.67446 2.36331 7.04407 2.27531C8.41368 2.36331 9.69461 3.01669 10.6075 4.09294C11.5204 5.1692 11.9911 6.58101 11.9171 8.02047C11.9171 8.32219 12.0312 8.61156 12.2343 8.82491C12.4374 9.03826 12.7128 9.15812 13 9.15812C13.2872 9.15812 13.5626 9.03826 13.7657 8.82491C13.9688 8.61156 14.0829 8.32219 14.0829 8.02047C14.0089 6.58101 14.4796 5.1692 15.3925 4.09294C16.3054 3.01669 17.5863 2.36331 18.9559 2.27531C20.3255 2.36331 21.6065 3.01669 22.5194 4.09294C23.4322 5.1692 23.903 6.58101 23.829 8.02047C23.829 11.3231 20.6377 16.0284 15.0737 20.9283V20.9329Z" fill="#FF6CF1"/>
            </svg>
        </button>
    )
}

const TrashButton = () => {
    return (
        <button className={"trash-button"}>
            <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 4H15.9C15.6679 2.87141 15.0538 1.85735 14.1613 1.12872C13.2687 0.40009 12.1522 0.00145452 11 0L9 0C7.8478 0.00145452 6.73132 0.40009 5.83875 1.12872C4.94618 1.85735 4.3321 2.87141 4.1 4H1C0.734784 4 0.48043 4.10536 0.292893 4.29289C0.105357 4.48043 0 4.73478 0 5C0 5.26522 0.105357 5.51957 0.292893 5.70711C0.48043 5.89464 0.734784 6 1 6H2V19C2.00159 20.3256 2.52888 21.5964 3.46622 22.5338C4.40356 23.4711 5.67441 23.9984 7 24H13C14.3256 23.9984 15.5964 23.4711 16.5338 22.5338C17.4711 21.5964 17.9984 20.3256 18 19V6H19C19.2652 6 19.5196 5.89464 19.7071 5.70711C19.8946 5.51957 20 5.26522 20 5C20 4.73478 19.8946 4.48043 19.7071 4.29289C19.5196 4.10536 19.2652 4 19 4ZM9 2H11C11.6203 2.00076 12.2251 2.19338 12.7316 2.55144C13.2381 2.90951 13.6214 3.41549 13.829 4H6.171C6.37858 3.41549 6.7619 2.90951 7.26839 2.55144C7.77487 2.19338 8.37973 2.00076 9 2ZM16 19C16 19.7956 15.6839 20.5587 15.1213 21.1213C14.5587 21.6839 13.7956 22 13 22H7C6.20435 22 5.44129 21.6839 4.87868 21.1213C4.31607 20.5587 4 19.7956 4 19V6H16V19Z" fill="white"/>
                <path d="M8 18C8.26522 18 8.51957 17.8946 8.70711 17.7071C8.89464 17.5196 9 17.2652 9 17V11C9 10.7348 8.89464 10.4804 8.70711 10.2929C8.51957 10.1054 8.26522 10 8 10C7.73478 10 7.48043 10.1054 7.29289 10.2929C7.10536 10.4804 7 10.7348 7 11V17C7 17.2652 7.10536 17.5196 7.29289 17.7071C7.48043 17.8946 7.73478 18 8 18Z" fill="white"/>
                <path d="M12 18C12.2652 18 12.5196 17.8946 12.7071 17.7071C12.8946 17.5196 13 17.2652 13 17V11C13 10.7348 12.8946 10.4804 12.7071 10.2929C12.5196 10.1054 12.2652 10 12 10C11.7348 10 11.4804 10.1054 11.2929 10.2929C11.1054 10.4804 11 10.7348 11 11V17C11 17.2652 11.1054 17.5196 11.2929 17.7071C11.4804 17.8946 11.7348 18 12 18Z" fill="white"/>
            </svg>
        </button>
    )
}

const LikedCard = ({event}) => {
    const formattedDate = formatDate(event.date)
    const [datePart, timePart] = formattedDate.split(' ')

    return (
        <div className={"liked-card"}>
            <div className={"liked-card-img-wrapper"}>
                <img src={event.imageURL[event.imageURL.length -1]} alt={event.name} className={"liked-card-img"}/>
                {(event.starred) ? <FavoriteButton /> : <FavoriteButtonBlank />}
                <TrashButton />
                <p className={"liked-card-date"}>{datePart}<br />{timePart}</p>
            </div>
            <div className={"liked-card-content"}>
                <p className={"liked-card-title"}>{event.name}</p>
                <p className={"liked-card-address"}>{event.address}</p>
            </div>
        </div>
    )
}

function Favorites() {
    const {isAuthenticated, logout} = useAuth()
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            loadShortlist();
        }
    }, [isAuthenticated])

    async function loadShortlist() {
        setLoading(true);
        try {
            const shortlist = await getShortlist(10, 0)
            setFavorites(shortlist)
        } catch (error) {
            setError(error)
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error.message}</div>;
    }

    const starredEvents = favorites.filter(event => event.starred === true);
    const notStarredEvents = favorites.filter(event => !event.starred);

    return (
        <>
            <p className={"favorites-header"}>Ваши мероприятия</p>
            <YourFavorites />
            <div className={"liked-cards"}>
                {starredEvents.map((event) => (
                    <LikedCard key={event.id} event={event} />
                ))}
            </div>
            <YourLiked />
            <div className={"liked-cards"}>
                {notStarredEvents.map((event) => (
                    <LikedCard key={event.id} event={event} />
                ))}
            </div>
            <Footer />
        </>
    )
}
export default Favorites;