import { Router } from 'express'
import {
    createOrder,
    deleteOrder,
    getOrderByNumber,
    getOrderCurrentUserByNumber,
    getOrders,
    getOrdersCurrentUser,
    updateOrder,
} from '../controllers/order'
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import { validateOrderBody } from '../middlewares/validations'
import { Role } from '../models/user'
import { routesConfig } from './routesConfig'

const orderRouter = Router()

orderRouter.post(routesConfig.Orders.path, auth, validateOrderBody, createOrder)
orderRouter.get(
    routesConfig.OrdersAll.path,
    auth,
    roleGuardMiddleware(Role.Admin),
    getOrders
)
orderRouter.get(routesConfig.OrdersAllMe.path, auth, getOrdersCurrentUser)
orderRouter.get(
    routesConfig.OrderByNumber.path,
    auth,
    roleGuardMiddleware(Role.Admin),
    getOrderByNumber
)
orderRouter.get(
    routesConfig.OrderMeByNumber.path,
    auth,
    getOrderCurrentUserByNumber
)
orderRouter.patch(
    routesConfig.OrderByNumber.path,
    auth,
    roleGuardMiddleware(Role.Admin),
    updateOrder
)

orderRouter.delete(
    routesConfig.OrderById.path,
    auth,
    roleGuardMiddleware(Role.Admin),
    deleteOrder
)

export default orderRouter
