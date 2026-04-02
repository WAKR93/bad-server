import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import { constants } from 'http2'
import sharp from 'sharp'
import BadRequestError from '../errors/bad-request-error'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    try {
        if (typeof req.file.size === 'number' && req.file.size <= 2 * 1024) {
            return next(new BadRequestError('Файл слишком маленький'))
        }

        if (req.file.mimetype === 'image/png') {
            try {
                const header = Buffer.from(
                    fs.readFileSync(req.file.path).subarray(0, 8) as Uint8Array
                )
                const pngSignature = Buffer.from([
                    0x89,
                    0x50,
                    0x4e,
                    0x47,
                    0x0d,
                    0x0a,
                    0x1a,
                    0x0a,
                ])
                if (!header.equals(pngSignature)) {
                    return next(new BadRequestError('Некорректный файл'))
                }

                const metadata = await sharp(req.file.path).metadata()
                if (!metadata.width || !metadata.height || metadata.format !== 'png') {
                    return next(new BadRequestError('Некорректный файл'))
                }
            } catch (e) {
                return next(new BadRequestError('Некорректный файл'))
            }
        }

        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file?.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file?.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
