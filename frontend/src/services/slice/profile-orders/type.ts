import { RequestStatus } from '@api'
import { OrderData, OrderDataFromServer, OrderDataList } from '../orders/type'

export type TProfileOrdersState = {
    orders: OrderDataList[]
    ordersData: OrderDataFromServer[]
    orderSelected: OrderData | null
    status: RequestStatus
}
