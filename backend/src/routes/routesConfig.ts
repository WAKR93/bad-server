interface RouteConfig {
    path: string
    rateLimited: boolean
}

export const routesConfig: Record<string, RouteConfig> = {
    Products: { path: '/products', rateLimited: false },
    ProductById: { path: '/products/:productId', rateLimited: false },

    Auth: { path: '/auth', rateLimited: false },
    AuthUser: { path: '/auth/user', rateLimited: false },
    AuthMe: { path: '/auth/me', rateLimited: false },
    AuthRoles: { path: '/auth/user/roles', rateLimited: false },

    AuthLogin: { path: '/auth/login', rateLimited: true },
    AuthRegister: { path: '/auth/register', rateLimited: true },

    AuthToken: { path: '/auth/token', rateLimited: false },
    AuthLogout: { path: '/auth/logout', rateLimited: false },

    Orders: { path: '/orders', rateLimited: false },
    OrdersAll: { path: '/orders/all', rateLimited: false },
    OrdersAllMe: { path: '/orders/all/me', rateLimited: false },
    OrderByNumber: { path: '/orders/:orderNumber', rateLimited: false },
    OrderMeByNumber: { path: '/orders/me/:orderNumber', rateLimited: false },
    OrderById: { path: '/orders/:id', rateLimited: false },

    Customers: { path: '/customers', rateLimited: false },
    CustomerById: { path: '/customers/:id', rateLimited: false },

    Upload: { path: '/upload', rateLimited: false },
} as const
