import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoutes = () => {
    const token = localStorage.getItem('adminToken');
    const isAuthenticated = token && token !== 'undefined' && token !== 'null';

    const location = useLocation();

    return isAuthenticated ? (
        <Outlet />
    ) : (
        <Navigate to="/auth/login" state={{ from: location }} replace />
    );
};

export default ProtectedRoutes;
