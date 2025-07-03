import { useEffect } from 'react';

import './index.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { Route, Routes } from 'react-router-dom';

import { logTelegramVersion } from './tools/logTelegramVersion.js';
import { init, retrieveLaunchParams, retrieveRawInitData, swipeBehavior } from '@telegram-apps/sdk';

import { MainPage } from './pages/MainPage/MainPage.jsx';
import { FiltersPage } from './pages/FiltersPage/FiltersPage.jsx';
import { FavoritesPage } from './pages/FavoritesPage/FavoritesPage.jsx';
import { EventPage } from './pages/EventPage/EventPage.jsx';
import { LoginPage } from './pages/LoginPage/LoginPage.jsx';
import { RegistrationPage } from './pages/RegistrationPage/RegistrationPage.jsx';

import { PrivateRoute } from './shared/components/PrivateRoute.jsx';

export const App = () => {
    useEffect(() => {
        try {
            init();
            logTelegramVersion();
            const launchParams = retrieveLaunchParams();
            console.log(launchParams);

            const rawInitData = retrieveRawInitData();
            console.log(rawInitData);

            if (swipeBehavior.mount.isAvailable()) {
                swipeBehavior.mount();
                console.log(swipeBehavior.isMounted()); // true
            }
            if (swipeBehavior.disableVertical.isAvailable()) {
                swipeBehavior.disableVertical();
                console.log(swipeBehavior.isVerticalEnabled()); // false
            }
        } catch (e) {
            console.log(e);
        }
    }, []);

    return (
        <>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registration" element={<RegistrationPage />} />
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <MainPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/filters"
                    element={
                        <PrivateRoute>
                            <FiltersPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/favorites"
                    element={
                        <PrivateRoute>
                            <FavoritesPage />
                        </PrivateRoute>
                    }
                />
                <Route path="/events/:eventId" element={<EventPage />} />
            </Routes>
        </>
    );
};
