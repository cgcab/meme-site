/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root';
import { Route as LoginImport } from './routes/login';
import { Route as AuthenticationImport } from './routes/_authentication';
import { Route as AuthenticationIndexImport } from './routes/_authentication/index';
import { Route as AuthenticationCreateImport } from './routes/_authentication/create';

// Create/Update Routes

const LoginRoute = LoginImport.update({
    path: '/login',
    getParentRoute: () => rootRoute,
} as any);

const AuthenticationRoute = AuthenticationImport.update({
    id: '/_authentication',
    getParentRoute: () => rootRoute,
} as any);

const AuthenticationIndexRoute = AuthenticationIndexImport.update({
    path: '/',
    getParentRoute: () => AuthenticationRoute,
} as any);

const AuthenticationCreateRoute = AuthenticationCreateImport.update({
    path: '/create',
    getParentRoute: () => AuthenticationRoute,
} as any);

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
    interface FileRoutesByPath {
        '/_authentication': {
            id: '/_authentication';
            path: '';
            fullPath: '';
            preLoaderRoute: typeof AuthenticationImport;
            parentRoute: typeof rootRoute;
        };
        '/login': {
            id: '/login';
            path: '/login';
            fullPath: '/login';
            preLoaderRoute: typeof LoginImport;
            parentRoute: typeof rootRoute;
        };
        '/_authentication/create': {
            id: '/_authentication/create';
            path: '/create';
            fullPath: '/create';
            preLoaderRoute: typeof AuthenticationCreateImport;
            parentRoute: typeof AuthenticationImport;
        };
        '/_authentication/': {
            id: '/_authentication/';
            path: '/';
            fullPath: '/';
            preLoaderRoute: typeof AuthenticationIndexImport;
            parentRoute: typeof AuthenticationImport;
        };
    }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
    AuthenticationRoute: AuthenticationRoute.addChildren({
        AuthenticationCreateRoute,
        AuthenticationIndexRoute,
    }),
    LoginRoute,
});

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_authentication",
        "/login"
      ]
    },
    "/_authentication": {
      "filePath": "_authentication.tsx",
      "children": [
        "/_authentication/create",
        "/_authentication/"
      ]
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/_authentication/create": {
      "filePath": "_authentication/create.tsx",
      "parent": "/_authentication"
    },
    "/_authentication/": {
      "filePath": "_authentication/index.tsx",
      "parent": "/_authentication"
    }
  }
}
ROUTE_MANIFEST_END */
