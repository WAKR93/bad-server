class ManyRequestError extends Error {
    public statusCode: number

    constructor(message: string) {
        super(message)
        this.statusCode = 429
    }
}

export default ManyRequestError
