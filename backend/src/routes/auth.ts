import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
    getCsrfToken,
    getCurrentUser,
    getCurrentUserRoles,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
    verifyCsrf,
} from '../controllers/auth'
import auth from '../middlewares/auth'

const authRouter = Router()

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
})

const authStrictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
})

authRouter.get('/user', auth, getCurrentUser)
authRouter.patch('/me', auth, verifyCsrf, updateCurrentUser)
authRouter.get('/user/roles', auth, getCurrentUserRoles)
authRouter.get('/csrf-token', authLimiter, getCsrfToken)
authRouter.post('/login', authStrictLimiter, login)
authRouter.get('/token', authLimiter, verifyCsrf, refreshAccessToken)
authRouter.get('/logout', verifyCsrf, logout)
authRouter.post('/register', authStrictLimiter, register)

export default authRouter
