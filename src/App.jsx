import React from 'react';
import './index.css'
import {Route, Routes} from "react-router-dom";
import MainScreen from "./MainScreen.jsx";
import Filters from "./filters";




function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<MainScreen />} />
                <Route path="/filters" element={<Filters />}  />
            </Routes>
        </>
    )
}

export default App