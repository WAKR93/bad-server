import { existsSync, mkdirSync, rename } from 'fs'
import { basename, join, resolve } from 'path'

function movingFile(imagePath: string, from: string, to: string) {
    const fileName = basename(imagePath)
    const imagePathTemp = join(from, fileName)
    const imagePathPermanent = join(to, fileName)

    // Проверяем, что пути не выходят за пределы разрешённых директорий
    const resolvedFrom = resolve(from)
    const resolvedTo = resolve(to)

    if (!resolve(imagePathTemp).startsWith(resolvedFrom)) {
        throw new Error('Недопустимый путь к файлу')
    }

    if (!resolve(imagePathPermanent).startsWith(resolvedTo)) {
        throw new Error('Недопустимый путь к файлу')
    }

    mkdirSync(to, { recursive: true })
    if (!existsSync(imagePathTemp)) {
        throw new Error('Ошибка при сохранении файла')
    }

    rename(imagePathTemp, imagePathPermanent, (err) => {
        if (err) {
            throw new Error('Ошибка при сохранении файла')
        }
    })
}

export default movingFile