import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/user/userSlice';

const RequireAuth: React.FC = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated); // Получаем состояние аутентификации из Redux
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Если пользователь авторизован, но пытается попасть на страницу "/auth" или "/" (главная),
    // перенаправляем его на страницу магазина
    if (location.pathname === '/auth' || location.pathname === '/') {
        return <Navigate to="/store" replace />;
    }

    return <Outlet />;
};

export default RequireAuth;
