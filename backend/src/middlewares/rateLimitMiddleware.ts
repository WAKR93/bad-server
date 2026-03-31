import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { match } from 'path-to-regexp'
import { RateLimiterMongo, IRateLimiterRes } from 'rate-limiter-flexible'
import ManyRequestError from '../errors/many-request-error'
import { routesConfig } from '../routes/routesConfig'
import {
    RATE_LIMIT_BLOCK,
    RATE_LIMIT_DURATION,
    RATE_LIMIT_POINTS,
} from '../config'

const rateLimiter = new RateLimiterMongo({
    storeClient: mongoose.connection,
    points: RATE_LIMIT_POINTS,
    duration: RATE_LIMIT_DURATION,
    blockDuration: RATE_LIMIT_BLOCK,
    keyPrefix: 'rate_mongo',
})

const isRateLimitResource = (x: unknown): x is IRateLimiterRes =>
    typeof x === 'object'
        ? typeof (x as IRateLimiterRes).remainingPoints === 'number'
        : false

const rateLimitMiddleware = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    const ip = req.ip || 'unknown_ip'

    const matchingRoute = Object.values(routesConfig).find((routeConfig) => {
        const matchPath = match(routeConfig.path)
        return matchPath(req.path) && routeConfig.rateLimited
    })

    if (!matchingRoute) {
        return next()
    }

    try {
        await rateLimiter.consume(ip)
        return next()
    } catch (error) {
        if (isRateLimitResource(error) && error.remainingPoints === 0) {
            return next(
                new ManyRequestError('Слишком много запросов к серверу')
            )
        }

        return next(error)
    }
}

export default rateLimitMiddleware
