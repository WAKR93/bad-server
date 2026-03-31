import { Router } from 'express'
import {
    getCsrfToken,
    getCurrentUser,
    getCurrentUserRoles,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
} from '../controllers/auth'
import auth from '../middlewares/auth'
import {
    validateAuthentication,
    validateUserBody,
} from '../middlewares/validations'
import { routesConfig } from './routesConfig'
import { csrfProtection } from '../middlewares/csrf'

const authRouter = Router()

authRouter.get(routesConfig.AuthUser.path, auth, getCurrentUser)
authRouter.get('/auth/csrf-token', getCsrfToken)
authRouter.patch(routesConfig.AuthMe.path, auth, updateCurrentUser)
authRouter.get(routesConfig.AuthRoles.path, auth, getCurrentUserRoles)
authRouter.post(
    routesConfig.AuthLogin.path,
    csrfProtection,
    validateAuthentication,
    login
)
authRouter.get(routesConfig.AuthToken.path, refreshAccessToken)
authRouter.get(
    routesConfig.AuthLogout.path,
    csrfProtection,
    logout
)
authRouter.post(
    routesConfig.AuthRegister.path,
    csrfProtection,
    validateUserBody,
    register
)

export default authRouter
