import {useState, useEffect, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {clearTokens, getAccessToken, getRefreshToken, loginUser, saveTokens} from "../tools/api.js";

export default function useAuth() {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    useEffect(() => {
        const hasToken = !!getAccessToken() || !!getRefreshToken();
        setIsAuthenticated(hasToken);
        setLoading(false);
    }, []);

    async function login(username, password) {
        setLoading(true);
        setError(null);

        try {
            const {accessToken, refreshToken} = await loginUser(username, password);
            saveTokens(accessToken, refreshToken);
            setIsAuthenticated(true);
            navigate("/");
        } catch (error) {
            setError(error);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }

    async function logout() {
        clearTokens();
        setIsAuthenticated(false);
        navigate("/login");
    }

    const authFetch = useCallback(
        async (path, options = {}) => {
            const accessToken = getAccessToken();
            const refreshToken = getRefreshToken();

            const headers = {
                "Content-Type": "application/json",
                ...options.headers,
            };

            if (accessToken) {
                headers["Authorization"] = accessToken;
            }
            if (refreshToken) {
                headers["RefreshToken"] = refreshToken;
            }

            try {
                const response = fetch(path, {
                    ...options,
                    headers,
                });
                const newAccessToken = response.headers.get("Access-Token");
                const newRefreshToken = response.headers.get("Refresh-Token");

                if (newRefreshToken && newAccessToken) {
                    saveTokens(newAccessToken, newRefreshToken);
                    setIsAuthenticated(true);
                }

                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(`Ошибка в авторизованном запросе: ${errorText}`);
                }

                return response.json();

            } catch (error) {
                console.error(`error in authFetch`, error);
                // logout() nahui
            }
        }, []
    );

    return {
        loading,
        isAuthenticated,
        error,
        login,
        logout,
        authFetch,
    };
}