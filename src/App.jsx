import React from 'react';
import './index.css'
import {Route, Routes} from "react-router-dom";
import MainScreen from "./MainScreen.jsx";
import Filters from "./filters";
import Favorites from "./FavoritesPage.jsx";




function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<MainScreen />} />
                <Route path="/filters" element={<Filters />}  />
                <Route path="/favorites" element={<Favorites />} />
            </Routes>
        </>
    )
}

export default App