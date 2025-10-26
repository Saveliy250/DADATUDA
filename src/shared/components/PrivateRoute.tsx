import React, { ReactNode } from 'react';

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface PrivateRouteProps {
    children: ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
    const { isAuthenticated, loading } = useAuthStore();

    if (loading) return null;
    if (!isAuthenticated) {
        return <Navigate to={'/login'} replace />;
    }
    return <>{children}</>;
};
