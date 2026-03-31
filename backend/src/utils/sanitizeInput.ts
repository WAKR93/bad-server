import sanitizeHtml from 'sanitize-html'

export const sanitizeInput = (input: string) => {
    const maxLength = 100

    const cleanHtml = sanitizeHtml(input as string, {
        allowedTags: [],
        allowedAttributes: {},
    })

    const cleanedInput = cleanHtml.replace(/[.*+?^=!:${}()|\]\\]/g, '\\$&')

    if (cleanedInput.length > maxLength) {
        return cleanedInput.slice(0, maxLength)
    }
    return cleanedInput
}

