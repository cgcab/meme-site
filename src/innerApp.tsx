import { RouterProvider } from '@tanstack/react-router';
import { useAuthentication } from './contexts/authentication';
import { router } from './main';

function InnerApp() {
    const { state } = useAuthentication();
    return <RouterProvider router={router} context={{ authState: state }} />;
}

export default InnerApp;
