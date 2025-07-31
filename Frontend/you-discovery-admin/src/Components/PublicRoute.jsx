import { Navigate, useLocation } from 'react-router-dom';

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('adminToken');
    const isAuthenticated = token && token !== 'undefined' && token !== 'null';
    const location = useLocation();

    if (isAuthenticated) {
        const previousRoute = location.state?.from?.pathname || "/";
        return <Navigate to={previousRoute} replace />;
    }

    return children;
};

export default PublicRoute;
