import {useState, useEffect, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {
    clearTokens,
    getAccessToken,
    getRefreshToken,
    loginUser,
    saveTokens,
    setOnLogoutCallback
} from "../tools/api.js";

export default function useAuth() {
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

    function logout() {
        clearTokens();
        setIsAuthenticated(false);
        navigate("/login");
    }



    return {
        loading,
        isAuthenticated,
        error,
        login,
        logout,
    };
}