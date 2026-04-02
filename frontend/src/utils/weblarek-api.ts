import { API_URL, CDN_URL } from '@constants'

import {
    ICustomerPaginationResult,
    ICustomerResult,
    IFile,
    IOrder,
    IOrderPaginationResult,
    IOrderResult,
    IProduct,
    IProductPaginationResult,
    ServerResponse,
    StatusType,
    UserLoginBodyDto,
    UserRegisterBodyDto,
    UserResponse,
    UserResponseToken,
} from '@types'
import { getCookie, setCookie } from './cookie'

export const enum RequestStatus {
    Idle = 'idle',
    Loading = 'loading',
    Success = 'success',
    Failed = 'failed',
}

export type ApiListResponse<Type> = {
    total: number
    items: Type[]
}

class Api {
    protected options: RequestInit
    private readonly baseUrl: string

    constructor(baseUrl: string, options: RequestInit = {}) {
        this.baseUrl = baseUrl
        this.options = {
            headers: {
                ...((options.headers as object) ?? {}),
            },
        }
    }

    protected handleResponse<T>(response: Response): Promise<T> {
        return response.ok
            ? response.json()
            : response
                  .json()
                  .then((err) =>
                      Promise.reject({ ...err, statusCode: response.status })
                  )
    }

    protected async request<T>(endpoint: string, options: RequestInit) {
        try {
            const res = await fetch(`${this.baseUrl}${endpoint}`, {
                ...this.options,
                ...options,
            })
            return await this.handleResponse<T>(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }

    protected requestWithRefresh = async <T>(
        endpoint: string,
        options: RequestInit
    ): Promise<T> => {
        const accessToken = getCookie('accessToken')

        const finalOptions: RequestInit = {
            ...options,
            headers: {
                ...(options.headers || {}),
                ...(accessToken
                    ? { Authorization: `Bearer ${accessToken}` }
                    : {}),
            },
            credentials: 'include',
        }

        try {
            return await this.request<T>(endpoint, finalOptions)
        } catch (error: any) {
            if (error.statusCode === 401) {
                try {
                    const refreshData = await this.request<UserResponseToken>(
                        '/auth/token',
                        {
                            method: 'GET',
                            credentials: 'include',
                        }
                    )
                    setCookie('accessToken', refreshData.accessToken)

                    const retryOptions: RequestInit = {
                        ...options,
                        headers: {
                            ...(options.headers || {}),
                            Authorization: `Bearer ${refreshData.accessToken}`,
                        },
                        credentials: 'include',
                    }
                    return await this.request<T>(endpoint, retryOptions)
                } catch (refreshError) {
                    return Promise.reject(refreshError)
                }
            }
            return Promise.reject(error)
        }
    }
}

export interface IWebLarekAPI {
    getProductList: (
        filters?: Record<string, unknown>
    ) => Promise<IProductPaginationResult>
    getProductItem: (id: string) => Promise<IProduct>
    createOrder: (order: IOrder) => Promise<IOrderResult>
}

export class WebLarekAPI extends Api implements IWebLarekAPI {
    readonly cdn: string

    constructor(cdn: string, baseUrl: string) {
        super(baseUrl)
        this.cdn = cdn
    }

    private attachCDN = <T extends { image: { fileName: string } }>(
        item: T
    ) => ({
        ...item,
        image: { ...item.image, fileName: this.cdn + item.image.fileName },
    })

    getProductItem = (id: string) =>
        this.request<IProduct>(`/products/${id}`, { method: 'GET' }).then(
            this.attachCDN
        )

    getProductList = (filters: Record<string, unknown> = {}) => {
        const queryParams = new URLSearchParams(
            filters as Record<string, string>
        ).toString()
        return this.request<IProductPaginationResult>(
            `/products?${queryParams}`,
            { method: 'GET' }
        ).then((data) => ({
            ...data,
            items: data.items.map(this.attachCDN),
        }))
    }

    createOrder = (order: IOrder) =>
        this.requestWithRefresh<IOrderResult>('/orders', {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' },
        })

    updateOrderStatus = (status: StatusType, orderNumber: string) =>
        this.requestWithRefresh<IOrderResult>(`/orders/${orderNumber}`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
            headers: { 'Content-Type': 'application/json' },
        })

    getAllOrders = (filters: Record<string, unknown> = {}) => {
        const queryParams = new URLSearchParams(
            filters as Record<string, string>
        ).toString()
        return this.requestWithRefresh<IOrderPaginationResult>(
            `/orders/all?${queryParams}`,
            { method: 'GET' }
        )
    }

    getCurrentUserOrders = (filters: Record<string, unknown> = {}) => {
        const queryParams = new URLSearchParams(
            filters as Record<string, string>
        ).toString()
        return this.requestWithRefresh<IOrderPaginationResult>(
            `/orders/all/me?${queryParams}`,
            { method: 'GET' }
        )
    }

    getOrderByNumber = (orderNumber: string) =>
        this.requestWithRefresh<IOrderResult>(`/orders/${orderNumber}`, {
            method: 'GET',
        })

    getOrderCurrentUserByNumber = (orderNumber: string) =>
        this.requestWithRefresh<IOrderResult>(`/orders/me/${orderNumber}`, {
            method: 'GET',
        })

    getCsrfToken = () =>
        this.request<{ csrfToken: string }>('/auth/csrf-token', {
            method: 'GET',
            credentials: 'include',
        })

    loginUser = async (data: UserLoginBodyDto) => {
        const csrfResponse = await this.getCsrfToken()
        const response = await this.request<UserResponseToken>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfResponse.csrfToken,
            },
            credentials: 'include',
        })
        setCookie('accessToken', response.accessToken)
        return response
    }

    registerUser = (data: UserRegisterBodyDto) =>
        this.request<UserResponseToken>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })

    getUser = () =>
        this.requestWithRefresh<UserResponse>('/auth/user', { method: 'GET' })

    getUserRoles = () =>
        this.requestWithRefresh<string[]>('/auth/user/roles', { method: 'GET' })

    getAllCustomers = (filters: Record<string, unknown> = {}) => {
        const queryParams = new URLSearchParams(
            filters as Record<string, string>
        ).toString()
        return this.requestWithRefresh<ICustomerPaginationResult>(
            `/customers?${queryParams}`,
            { method: 'GET' }
        )
    }

    getCustomerById = (idCustomer: string) =>
        this.requestWithRefresh<ICustomerResult>(`/customers/${idCustomer}`, {
            method: 'GET',
        })

    logoutUser = () =>
        this.request<ServerResponse<unknown>>('/auth/logout', {
            method: 'GET',
            credentials: 'include',
        })

    createProduct = (data: Omit<IProduct, '_id'>) =>
        this.requestWithRefresh<IProduct>('/products', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        }).then(this.attachCDN)

    uploadFile = (data: FormData) =>
        this.requestWithRefresh<IFile>('/upload', {
            method: 'POST',
            body: data,
        })

    updateProduct = (data: Partial<Omit<IProduct, '_id'>>, id: string) =>
        this.requestWithRefresh<IProduct>(`/products/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        }).then(this.attachCDN)

    deleteProduct = (id: string) =>
        this.requestWithRefresh<IProduct>(`/products/${id}`, {
            method: 'DELETE',
        })
}

export default new WebLarekAPI(CDN_URL, API_URL)
