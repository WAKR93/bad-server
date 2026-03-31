const MAX_LIMIT = 10

export const getNormalizeLimit = (limit: number) =>
    Number(limit) >= MAX_LIMIT ? MAX_LIMIT : Number(limit)
