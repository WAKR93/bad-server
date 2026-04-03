const MAX_LIMIT = 10
const DEFAULT_LIMIT = 10
const DEFAULT_PAGE = 1

export function sanitizePagination(
    rawPage: unknown,
    rawLimit: unknown,
    defaultLimit: number = DEFAULT_LIMIT
) {
    let page = Number(rawPage) || DEFAULT_PAGE
    let limit = Number(rawLimit) || defaultLimit

    if (page < 1) page = DEFAULT_PAGE
    if (limit < 1) limit = defaultLimit
    if (limit > MAX_LIMIT) limit = MAX_LIMIT

    page = Math.floor(page)
    limit = Math.floor(limit)

    return { page, limit, skip: (page - 1) * limit }
}