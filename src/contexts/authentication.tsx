import { useToast } from '@chakra-ui/react';
import { jwtDecode } from 'jwt-decode';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MINUTE_MS, TOKEN_EXPIRE_TOAST_DELAY } from '../utils/constants';
import { stringsRes } from '../resources/strings';

export type AuthenticationState = {
    isAuthenticated: boolean;
    token?: string;
    userId?: string;
};

export type Authentication = {
    state: AuthenticationState;
    authenticate: (token: string) => void;
    signout: () => void;
};

export const AuthenticationContext = createContext<Authentication | undefined>(undefined);

const setAuthState = (token: string, decodedToken: { id: string; exp: number }) => {
    localStorage.setItem('authToken', token);
    return {
        isAuthenticated: true,
        token,
        userId: decodedToken.id,
    };
};

const handleTokenExpiration = (
    tokenExpirationDate: number,
    toast: ReturnType<typeof useToast>,
    signout: () => void,
) => {
    const expirationThreshold = tokenExpirationDate - Date.now() - TOKEN_EXPIRE_TOAST_DELAY * MINUTE_MS;
    const toastTimeoutId = setTimeout(() => {
        toast({
            title: `${stringsRes.toast.tokenExpired} ${TOKEN_EXPIRE_TOAST_DELAY} ${stringsRes.time.minutes}`,
            status: 'warning',
            duration: 5000,
            isClosable: true,
        });
    }, expirationThreshold);

    const timeoutId = setTimeout(() => {
        signout();
    }, tokenExpirationDate - Date.now());

    return () => {
        clearTimeout(timeoutId);
        clearTimeout(toastTimeoutId);
    };
};

export const AuthenticationProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const toast = useToast();
    const [state, setState] = useState<AuthenticationState>({ isAuthenticated: false });

    const signout = useCallback(() => {
        setState({ isAuthenticated: false });
        localStorage.removeItem('authToken');
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const decodedToken = jwtDecode<{ id: string; exp: number }>(token);
            const expirationDate = decodedToken.exp * 1000;
            if (Date.now() < expirationDate) {
                setState(setAuthState(token, decodedToken));
                return handleTokenExpiration(expirationDate, toast, signout);
            }
        }
    }, [toast, signout]);

    const authenticate = useCallback(
        (token: string) => {
            const decodedToken = jwtDecode<{ id: string; exp: number }>(token);
            const expirationDate = decodedToken.exp * 1000;
            setState(setAuthState(token, decodedToken));
            return handleTokenExpiration(expirationDate, toast, signout);
        },
        [toast, signout],
    );

    const contextValue = useMemo(() => ({ state, authenticate, signout }), [state, authenticate, signout]);

    return <AuthenticationContext.Provider value={contextValue}>{children}</AuthenticationContext.Provider>;
};

export function useAuthentication() {
    const context = useContext(AuthenticationContext);
    if (!context) {
        throw new Error('useAuthentication must be used within an AuthenticationProvider');
    }
    return context;
}

export function useAuthToken() {
    const { state } = useAuthentication();
    if (!state.isAuthenticated) {
        throw new Error('User is not authenticated');
    }
    return state.token;
}
