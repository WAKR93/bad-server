import crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import { CSRF_TOKEN } from '../config'
import ForbiddenError from '../errors/forbidden-error'

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']
const CSRF_EXEMPT_PATHS = ['/auth/login', '/auth/register']

export function generateCsrfToken(_req: Request, res: Response, next: NextFunction) {
    const { cookies } = _req
    if (!cookies[CSRF_TOKEN.cookie.name]) {
        const token = crypto.randomBytes(32).toString('hex')
        res.cookie(
            CSRF_TOKEN.cookie.name,
            token,
            CSRF_TOKEN.cookie.options
        )
    }
    next()
}

export function validateCsrfToken(req: Request, _res: Response, next: NextFunction) {
    if (SAFE_METHODS.includes(req.method)) {
        return next()
    }

    if (CSRF_EXEMPT_PATHS.includes(req.path)) {
        return next()
    }

    const cookieToken = req.cookies[CSRF_TOKEN.cookie.name]
    const headerToken = req.header(CSRF_TOKEN.headerName)

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return next(new ForbiddenError('Неверный CSRF-токен'))
    }

    return next()
}