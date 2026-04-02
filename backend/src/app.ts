import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000 } = process.env
const app = express()

app.use(cookieParser())

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
})

app.use((req, res, next) => {
    if (req.path.startsWith('/auth') || req.path.startsWith('/api/auth')) {
        return next()
    }
    return apiLimiter(req, res, next)
})

const allowedOrigins = (process.env.ORIGIN_ALLOW || 'http://localhost,http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
)

app.use(serveStatic(`${__dirname}/public`))

app.use(urlencoded({ extended: true, limit: '1mb' }))
app.use(json({ limit: '1mb' }))

app.options('*', cors())
app.use(routes)
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
