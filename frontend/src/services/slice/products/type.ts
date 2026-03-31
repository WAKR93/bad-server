import { IProduct } from '@types'
import { RequestStatus } from '@api'

export type TProductState = {
    data: IProduct[]
    status: RequestStatus
}
