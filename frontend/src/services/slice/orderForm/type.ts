import { IOrder } from '@types'
import { RequestStatus } from '@api'

export type TOrderState = {
    info: IOrder
    status: RequestStatus
}
