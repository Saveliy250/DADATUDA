import React, { ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
    children: ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
    const token = localStorage.getItem('access-token');
    if (!token) {
        return <Navigate to={'/login'} replace />;
    }
    return <>{children}</>;
};
