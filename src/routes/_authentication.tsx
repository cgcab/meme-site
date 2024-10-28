import { createFileRoute, Navigate, Outlet, useLocation } from '@tanstack/react-router';
import { useAuthentication } from '../contexts/authentication';

// Separate functional component
const AuthenticationRouteComponent = () => {
    const { state } = useAuthentication();
    const { pathname } = useLocation();

    if (!state.isAuthenticated) {
        return <Navigate to="/login" search={{ redirect: pathname }} replace />;
    }

    return <Outlet />;
};

// Define the route with the component
export const Route = createFileRoute('/_authentication')({
    component: AuthenticationRouteComponent,
});
