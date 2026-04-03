import { CookieOptions } from 'express'
import ms from 'ms'

export const { PORT = '3000' } = process.env
export const { DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek' } = process.env
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const IS_PRODUCTION = NODE_ENV === 'production'
export const ORIGIN_ALLOW = process.env.ORIGIN_ALLOW || 'http://localhost:80'

if (IS_PRODUCTION && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in production')
}
if (IS_PRODUCTION && !process.env.AUTH_ACCESS_TOKEN_SECRET) {
    throw new Error('AUTH_ACCESS_TOKEN_SECRET must be set in production')
}
if (IS_PRODUCTION && !process.env.AUTH_REFRESH_TOKEN_SECRET) {
    throw new Error('AUTH_REFRESH_TOKEN_SECRET must be set in production')
}

export const { JWT_SECRET = 'JWT_SECRET_DEV' } = process.env
export const ACCESS_TOKEN = {
    secret: process.env.AUTH_ACCESS_TOKEN_SECRET || 'access-secret-dev',
    expiry: process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m',
}
export const REFRESH_TOKEN = {
    secret: process.env.AUTH_REFRESH_TOKEN_SECRET || 'refresh-secret-dev',
    expiry: process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d',
    cookie: {
        name: 'refreshToken',
        options: {
            httpOnly: true,
            sameSite: 'strict',
            secure: IS_PRODUCTION,
            maxAge: ms(process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d'),
            path: '/',
        } as CookieOptions,
    },
}
export const CSRF_TOKEN = {
    cookie: {
        name: '_csrf',
        options: {
            httpOnly: false,
            sameSite: 'strict',
            secure: IS_PRODUCTION,
            path: '/',
        } as CookieOptions,
    },
    headerName: 'x-csrf-token',
}