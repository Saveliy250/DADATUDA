import React, { useEffect } from 'react';
import './index.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { logTelegramVersion } from './tools/logTelegramVersion';

import { init, retrieveRawInitData, swipeBehavior } from '@telegram-apps/sdk';

import { MainPage } from './pages/MainPage/MainPage';
import { FiltersPage } from './pages/FiltersPage/FiltersPage';
import { FavoritesPage } from './pages/FavoritesPage/FavoritesPage';
import { EventPage } from './pages/EventPage/EventPage';
import { PrivateRoute } from './shared/components/PrivateRoute';
import { Navigation } from './shared/components/Navigation/Navigation';
import { LoginPage } from './pages/AuthorizationPages/LoginPage/LoginPage';
import { RegistrationPage } from './pages/AuthorizationPages/RegistrationPage/RegistrationPage';
import { getAccessToken, saveInitData, clearTokens } from './tools/storageHelpers';
import { setOnLogoutCallback } from './tools/api/api';
import { logger } from './tools/logger';

import { FilterProvider } from './contexts/FilterContext';

export const App = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        try {
            logger.info('[App] init start');
            init();
            logTelegramVersion();

            // Set up logout callback
            setOnLogoutCallback(() => {
                logger.info('[App] onLogoutCallback');
                clearTokens();
                navigate('/login', { replace: true });
            });

            const rawInitData = retrieveRawInitData();
            logger.info('[App] retrieveRawInitData', Boolean(rawInitData));
            if (rawInitData) {
                saveInitData(rawInitData);
            }

            if (swipeBehavior.mount.isAvailable()) {
                swipeBehavior.mount();
                logger.info('[App] swipeBehavior mounted', swipeBehavior.isMounted());
            }
            if (swipeBehavior.disableVertical.isAvailable()) {
                swipeBehavior.disableVertical();
                logger.info('[App] swipe vertical enabled', swipeBehavior.isVerticalEnabled());
            }
        } catch (e) {
            logger.error(e, 'TWA init error');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
