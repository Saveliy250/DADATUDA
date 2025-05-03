import React, {useEffect} from 'react';
import './index.css'
import {Route, Routes} from "react-router-dom";
import MainScreen from "./MainScreen.jsx";
import Filters from "./filters";
import Favorites from "./FavoritesPage.jsx";
import EventPage from "./EventPage.jsx";
import LogInPage from "./LogInPage.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import {RegistrationPage} from "./RegistrationPage.jsx";
import {initWebApp, versionAtLeast} from '@telegram-apps/sdk'
import {logTelegramVersion} from "./tools/logTelegramVersion.js";


function App() {
    useEffect(() => {
        const WebApp = initWebApp();


        if (!WebApp.platform) {
            console.log('Запустите мини‑приложение внутри Telegram');
            return;
        }
        logTelegramVersion()

        WebApp.ready();

        if (versionAtLeast('7.7')) {
            WebApp.setupSwipeBehavior({ allow_vertical_swipe: false });
        } else {
            console.warn('Клиент Telegram < 7.7 — заблокировать свайп нельзя');
        }

        return () => {
            if (versionAtLeast('7.7')) {
                WebApp.setupSwipeBehavior({ allow_vertical_swipe: true });
            }
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