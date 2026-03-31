import { Router } from 'express'
import {
    deleteCustomer,
    getCustomerById,
    getCustomers,
    updateCustomer,
} from '../controllers/customers'
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import { Role } from '../models/user'
import { routesConfig } from './routesConfig'

const customerRouter = Router()

customerRouter.get(
    routesConfig.Customers.path,
    auth,
    roleGuardMiddleware(Role.Admin),
    getCustomers
)
customerRouter.get(
    routesConfig.CustomerById.path,
    auth,
    roleGuardMiddleware(Role.Admin),
    getCustomerById
)
customerRouter.patch(
    routesConfig.CustomerById.path,
    auth,
    roleGuardMiddleware(Role.Admin),
    updateCustomer
)
customerRouter.delete(
    routesConfig.CustomerById.path,
    auth,
    roleGuardMiddleware(Role.Admin),
    deleteCustomer
)

export default customerRouter
