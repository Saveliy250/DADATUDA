import React from 'react';
import './index.css'
import {Route, Routes} from "react-router-dom";
import MainScreen from "./MainScreen.jsx";
import Filters from "./filters";
import Favorites from "./FavoritesPage.jsx";
import EventPage from "./EventPage.jsx";




function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<MainScreen />} />
                <Route path="/filters" element={<Filters />}  />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/events/:eventId" element={<EventPage />} />
            </Routes>
        </>
    )
}

export default App