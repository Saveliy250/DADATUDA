import React, { useEffect } from 'react';
import './index.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { Route, Routes } from 'react-router-dom';

import { logTelegramVersion } from './tools/logTelegramVersion';

import { init, retrieveLaunchParams, retrieveRawInitData, swipeBehavior } from '@telegram-apps/sdk';

import { MainPage } from './pages/MainPage/MainPage';
import { FiltersPage } from './pages/FiltersPage/FiltersPage';
import { FavoritesPage } from './pages/FavoritesPage/FavoritesPage';
import { EventPage } from './pages/EventPage/EventPage';
import { PrivateRoute } from './shared/components/PrivateRoute';
import { Navigation } from './shared/components/Navigation/Navigation';
import { LoginPage } from './pages/AuthorizationPages/LoginPage/LoginPage';
import { RegistrationPage } from './pages/AuthorizationPages/RegistrationPage/RegistrationPage';

import { FilterProvider } from './contexts/FilterContext';

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
        <FilterProvider>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registration" element={<RegistrationPage />} />
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <MainPage />
                            <Navigation />
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
                            <Navigation />
                        </PrivateRoute>
                    }
                />
                <Route path="/events/:eventId" element={<EventPage />} />
            </Routes>
        </FilterProvider>
    );
};
