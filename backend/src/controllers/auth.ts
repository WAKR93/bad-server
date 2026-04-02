import crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Error as MongooseError } from 'mongoose'
import User from '../models/user'
import { REFRESH_TOKEN } from '../config'
import BadRequestError from '../errors/bad-request-error'
import ConflictError from '../errors/conflict-error'
import NotFoundError from '../errors/not-found-error'
import UnauthorizedError from '../errors/unauthorized-error'

const validateRefreshToken = async (req: Request) => {
    const rfTkn = req.cookies[REFRESH_TOKEN.cookie.name]
    if (!rfTkn) throw new UnauthorizedError('Не валидный refresh-токен')

    const decoded = jwt.verify(rfTkn, REFRESH_TOKEN.secret) as JwtPayload

    const user = await User.findOne({ _id: decoded._id }).orFail(
        () => new UnauthorizedError('Пользователь не найден')
    )

    const rTknHash = crypto
        .createHmac('sha256', REFRESH_TOKEN.secret)
        .update(rfTkn)
        .digest('hex')

    const tokenExists = user.tokens.some((t) => t.token === rTknHash)
    if (!tokenExists) throw new UnauthorizedError('Refresh-токен не найден')

    return { user, oldTokenHash: rTknHash }
}

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body
        const user = await User.findUserByCredentials(email, password)

        const accessToken = user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        res.cookie(
            REFRESH_TOKEN.cookie.name,
            refreshToken,
            REFRESH_TOKEN.cookie.options
        )

        return res.json({ success: true, user, accessToken })
    } catch (err) {
        next(err)
    }
}

const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, name } = req.body
        const newUser = new User({ email, password, name })
        await newUser.save()

        const accessToken = newUser.generateAccessToken()
        const refreshToken = await newUser.generateRefreshToken()

        res.cookie(
            REFRESH_TOKEN.cookie.name,
            refreshToken,
            REFRESH_TOKEN.cookie.options
        )

        return res.status(constants.HTTP_STATUS_CREATED).json({
            success: true,
            user: newUser,
            accessToken,
        })
    } catch (error) {
        if (error instanceof MongooseError.ValidationError) {
            return next(new BadRequestError(error.message))
        }
        if (error instanceof Error && error.message.includes('E11000')) {
            return next(
                new ConflictError('Пользователь с таким email уже существует')
            )
        }
        return next(error)
    }
}

const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user, oldTokenHash } = await validateRefreshToken(req)
        user.tokens = user.tokens.filter((t) => t.token !== oldTokenHash)
        await user.save()

        res.cookie(REFRESH_TOKEN.cookie.name, '', {
            ...REFRESH_TOKEN.cookie.options,
            maxAge: 0,
        })

        res.status(200).json({ success: true })
    } catch (err) {
        next(err)
    }
}

const refreshAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { user, oldTokenHash } = await validateRefreshToken(req)

        // remove old refresh token
        user.tokens = user.tokens.filter((t) => t.token !== oldTokenHash)

        const accessToken = user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        res.cookie(
            REFRESH_TOKEN.cookie.name,
            refreshToken,
            REFRESH_TOKEN.cookie.options
        )

        return res.json({ success: true, user, accessToken })
    } catch (err) {
        next(err)
    }
}

const getCurrentUser = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = res.locals.user._id
        const user = await User.findById(userId).orFail(
            () => new NotFoundError('Пользователь не найден')
        )
        res.json({ success: true, user })
    } catch (err) {
        next(err)
    }
}

const getCurrentUserRoles = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = res.locals.user._id
        const user = await User.findById(userId).orFail(
            () => new NotFoundError('Пользователь не найден')
        )
        res.status(200).json(user.roles)
    } catch (err) {
        next(err)
    }
}

const updateCurrentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = res.locals.user._id
        const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
            new: true,
        }).orFail(() => new NotFoundError('Пользователь не найден'))
        res.status(200).json(updatedUser)
    } catch (err) {
        next(err)
    }
}

const getCsrfToken = (req: Request, res: Response) => {
    let csrfToken = req.cookies['XSRF-TOKEN']

    if (!csrfToken) {
        csrfToken = crypto.randomBytes(32).toString('hex')
    }

    res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
    })

    res.cookie('_csrf', csrfToken, {
        httpOnly: false,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
    })

    res.json({ csrfToken })
}

export {
    login,
    register,
    logout,
    refreshAccessToken,
    getCurrentUser,
    getCurrentUserRoles,
    updateCurrentUser,
    getCsrfToken,
}
