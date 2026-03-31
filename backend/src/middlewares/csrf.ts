import crypto from 'crypto'
import { Request, Response, NextFunction } from 'express'
import ForbiddenError from '../errors/forbidden-error'

export const generateCsrfToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let csrfToken = req.cookies['XSRF-TOKEN']

    if (!csrfToken) {
        csrfToken = crypto.randomBytes(32).toString('hex')

        res.cookie('XSRF-TOKEN', csrfToken, {
            httpOnly: false,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
        })
    }

    res.locals.csrfToken = csrfToken

    next()
}

export const csrfProtection = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next()
    }

    const tokenFromCookie = req.cookies['XSRF-TOKEN']
    const tokenFromHeader = req.headers['x-csrf-token']

    if (!tokenFromCookie) {
        return next(new ForbiddenError('CSRF token missing'))
    }

    if (tokenFromHeader && tokenFromHeader !== tokenFromCookie) {
        return next(new ForbiddenError('CSRF token invalid'))
    }

    next()
}
