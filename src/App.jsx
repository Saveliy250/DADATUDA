import React from 'react';
import './index.css'
import {Route, Routes} from "react-router-dom";
import MainScreen from "./MainScreen.jsx";
import Filters from "./filters";
import Favorites from "./FavoritesPage.jsx";
import EventPage from "./EventPage.jsx";
import LogInPage from "./LogInPage.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import {RegistrationPage} from "./RegistrationPage.jsx";
import WebApp from '@twa-dev/sdk';
import {useEffect} from "react";


function App() {
    useEffect(() => {
        if (!WebApp.initData) {            // значит, мы не внутри Telegram
            console.log('Run inside Telegram to get WebApp features');
            return;
        }

        WebApp.ready();                    // сообщаем, что мини-апп загрузилась
        WebApp.expand();                   // опционально
        WebApp.setupSwipeBehavior({        // 🔒 блокируем «смахни вниз»
            allow_vertical_swipe: false
        });

        return () => {                     // при размонтировании → возвращаем по умолчанию
            WebApp.setupSwipeBehavior({ allow_vertical_swipe: true });
        };
    }, []);
    return (
        <>
            <Routes>
                <Route path="/login" element={<LogInPage/>} />
                <Route path="/registration" element={<RegistrationPage/>} />
                <Route path="/" element={
                    <PrivateRoute>
                        <MainScreen />
                    </PrivateRoute>} />
                <Route path="/filters" element={
                    <PrivateRoute>
                        <Filters />
                    </PrivateRoute>
                    }  />
                <Route path="/favorites" element={
                    <PrivateRoute>
                        <Favorites />
                    </PrivateRoute>
                    } />
                <Route path="/events/:eventId" element={<EventPage />} />
            </Routes>
        </>
    )
}

export default App