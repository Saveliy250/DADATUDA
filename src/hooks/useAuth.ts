import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    clearTokens,
    getAccessToken,
    getRefreshToken,
    loginUser,
    registerUser,
    saveTokens,
    setOnLogoutCallback,
} from '../tools/api';

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
        clearTokens();
        setIsAuthenticated(false);
        void navigate('/login');
    }, [navigate]);

    useEffect(() => {
        const hasToken = !!getAccessToken() || !!getRefreshToken();
        setIsAuthenticated(hasToken);
        setLoading(false);

        setOnLogoutCallback(() => {
            logout();
        });
    }, [logout]);

    async function registration(data: string): Promise<void> {
        setLoading(true);
        setError(null);
        try {
            await registerUser(data);
            void navigate('/login');
        } catch (error: unknown) {
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    }

    async function login(username?: string, password?: string): Promise<void> {
        setLoading(true);
        setError(null);

        return new Promise((resolve, reject) => {
            loginUser(username, password)
                .then(({ accessToken, refreshToken }) => {
                    saveTokens(accessToken, refreshToken);
                    setIsAuthenticated(true);
                    resolve();
                })
                .catch((error: unknown) => {
                    const err = error instanceof Error ? error : new Error('An unknown error occurred');
                    setError(err);
                    setIsAuthenticated(false);
                    reject(err);
                })
                .finally(() => {
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
