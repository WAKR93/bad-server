import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export function serveStatic(baseDir: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const filePath = path.join(baseDir, req.path)

        fs.access(filePath, fs.constants.F_OK, (accessErr) => {
            if (accessErr) {
                return next()
            }

            res.sendFile(filePath, (sendErr) => {
                console.log('err', sendErr)
                if (sendErr) {
                    next(sendErr)
                }
            })
        })
    }
}
