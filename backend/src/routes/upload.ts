import { Router } from 'express'
import { uploadFile } from '../controllers/upload'
import fileMiddleware from '../middlewares/file'
import { validateImageMetadata } from '../middlewares/validateImageMetadata'
import { routesConfig } from './routesConfig'

const uploadRouter = Router()
uploadRouter.post(
    routesConfig.Upload.path,
    fileMiddleware.single('file'),
    validateImageMetadata,
    uploadFile
)

export default uploadRouter
