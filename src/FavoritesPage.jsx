import React, {useEffect, useState} from "react";
import './index.css'
import {Footer} from "./MainScreen.jsx";

const YourFavorites = () => {
    return (
        <div className={"arrow-favorites"}>

            избранное
        </div>
    )
}

const YourLiked = () => {
    return (
        <div className={"arrow-liked"}>

            понравившиеся
        </div>
    )
}

const LikedCard = ({event}) => {
    return (
        <div className={"liked-card"}>
            <div className={"liked-card-content"}>
                <p className={"liked-card-title"}>{event.name}</p>
                <p className={"liked-card-text"}>{event.description}</p>
            </div>
        </div>
    )
}

function Favorites() {
    const [favorites, setFavorites] = useState([]);
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
                setFavorites(data);
                setLoading(false);
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            })
    })

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error.message}</div>;
    }

    return (
        <>
            <h1>ваши мероприятия</h1>
            <YourFavorites />
            <YourLiked />
            <div className={"liked-cards"}>
                {favorites.map((event) => (
                    <LikedCard key={event.id} event={event} />
                ))}
            </div>
            <Footer />
        </>
    )
}
export default Favorites;