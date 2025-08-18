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
import { getAccessToken, saveInitData, saveTokens } from './tools/storageHelpers';
import { loginWithInitData } from './tools/api/api';

export const App = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        try {
            init();
            logTelegramVersion();


            const rawInitData = retrieveRawInitData();
            if (rawInitData) {
                saveInitData(rawInitData);

                const alreadyAuthed = !!getAccessToken();
                if (!alreadyAuthed) {
                    (async () => {
                        try {
                            const tokenDto = await loginWithInitData(rawInitData);
                            const access = tokenDto?.access_token ?? null;
                            const refresh = tokenDto?.refresh_token ?? null;
                            if (access && refresh) {
                                saveTokens(access, refresh);
                                if (location.pathname === '/login' || location.pathname === '/registration') {
                                    navigate('/', { replace: true });
                                }
                            }
                        } catch (e) {
                            console.warn('Auto-login by initData failed:', e);
                        }
                    })();
                }
                if (swipeBehavior.mount.isAvailable()) {
                    swipeBehavior.mount();
                    console.log(swipeBehavior.isMounted()); // true
                }
                if (swipeBehavior.disableVertical.isAvailable()) {
                    swipeBehavior.disableVertical();
                    console.log(swipeBehavior.isVerticalEnabled()); // false
                }
            }
        } catch (e) {
            console.warn('TWA init error:', e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                            <Navigation />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/filters"
                    element={
                        <PrivateRoute>
                            <FiltersPage />
                            <Navigation />
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
        </>
    );
};
