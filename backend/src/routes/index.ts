import { NextFunction, Request, Response, Router } from 'express'
import NotFoundError from '../errors/not-found-error'
import { csrfProtection } from '../middlewares/csrf'
import auth from '../middlewares/auth'
import authRouter from './auth'
import customerRouter from './customers'
import orderRouter from './order'
import productRouter from './product'
import uploadRouter from './upload'

const router = Router()

router.use(authRouter)

router.use(productRouter)

router.use(auth, csrfProtection, orderRouter)
router.use(auth, csrfProtection, uploadRouter)
router.use(auth, csrfProtection, customerRouter)

router.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError('Маршрут не найден'))
})

export default router
