import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    authenticate,
    registerUser,
    setOnLogoutCallback,
} from '../tools/api/api';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '../tools/storageHelpers';
import { logger } from '../tools/logger';

interface UseAuth {
    registration: (data: string) => Promise<void>;
    loading: boolean;
    isAuthenticated: boolean;
    error: Error | null;
    login: (username?: string, password?: string) => Promise<void>;
    logout: () => void;
}

export const useAuth = (): UseAuth => {
    const [loading, setLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const navigate = useNavigate();

    const logout = useCallback((): void => {
        logger.info('[useAuth.logout] called');
        clearTokens();
        setIsAuthenticated(false);
        void navigate('/login');
    }, [navigate]);

    useEffect(() => {
        const hasToken = !!getAccessToken() || !!getRefreshToken();
        logger.info('[useAuth.init] hasToken', hasToken);
        setIsAuthenticated(hasToken);
        setLoading(false);

        setOnLogoutCallback(() => {
            logger.info('[useAuth.onLogoutCallback]');
            logout();
        });
    }, [logout]);

    async function registration(data: string): Promise<void> {
        setLoading(true);
        setError(null);
        try {
            logger.info('[useAuth.registration] start');
            await registerUser(data);
            logger.info('[useAuth.registration] success');
            void navigate('/login');
        } catch (error: unknown) {
            logger.error(error, '[useAuth.registration] failed');
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    }

    async function login(username?: string, password?: string): Promise<void> {
        setLoading(true);
        setError(null);

        return new Promise((resolve, reject) => {
            logger.info('[useAuth.login] start', { hasUsername: !!username });
            authenticate({ username, password })
                .then(({ accessToken, refreshToken }) => {
                    logger.info('[useAuth.login] success, saving tokens');
                    saveTokens(accessToken, refreshToken);
                    setIsAuthenticated(true);
                    resolve();
                })
                .catch((error: unknown) => {
                    const err = error instanceof Error ? error : new Error('An unknown error occurred');
                    logger.error(err, '[useAuth.login] failed');
                    setError(err);
                    setIsAuthenticated(false);
                    reject(err);
                })
                .finally(() => {
                    logger.info('[useAuth.login] finally');
                    setLoading(false);
                });
        });
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
