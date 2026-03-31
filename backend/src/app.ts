import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import { serveStatic } from './middlewares/serverStatic'
import routes from './routes'
import { generateCsrfToken } from './middlewares/csrf'
import rateLimitMiddleware from './middlewares/rateLimitMiddleware'

const { PORT = 3000, _ORIGIN_ALLOW = 'http://localhost:5173' } = process.env

const app = express()

app.use(cookieParser())

app.use(
    cors({
        origin: true,
        credentials: true,
    })
)

app.use(generateCsrfToken)

app.use(serveStatic(path.join(__dirname, 'public')))
app.use(urlencoded({ extended: true }))
app.use(json({ limit: '50kb' }))

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)

        if (process.env.RATE_LIMITED === 'true') {
            app.use(rateLimitMiddleware)
        }

        app.use(routes)

        app.use(errors())
        app.use(errorHandler)

        await app.listen(PORT, () => {
            console.log('Сервер успешно запущен')
        })
    } catch (error) {
        console.error('Ошибка запуска:', error)
    }
}

bootstrap()
