import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import {
    clearTokens,
    getAccessToken,
    getRefreshToken,
    loginUser,
    registerUser,
    saveTokens,
    setOnLogoutCallback,
} from '../tools/api.js';

export const useAuth = () => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    useEffect(() => {
        const hasToken = !!getAccessToken() || !!getRefreshToken();
        setIsAuthenticated(hasToken);
        setLoading(false);

        setOnLogoutCallback(() => {
            logout();
        });
    }, []);

    async function registration(data) {
        setLoading(true);
        setError(null);
        try {
            const response = await registerUser(data);
            navigate('/login');
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }

    async function login(username, password) {
        setLoading(true);
        setError(null);

        try {
            const { accessToken, refreshToken } = await loginUser(username, password);
            saveTokens(accessToken, refreshToken);
            setIsAuthenticated(true);
            navigate('/');
        } catch (error) {
            setError(error);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }

    function logout() {
        clearTokens();
        setIsAuthenticated(false);
        navigate('/login');
    }

    return {
        registration,
        loading,
        isAuthenticated,
        error,
        login,
        logout,
    };
};
