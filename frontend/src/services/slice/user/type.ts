import { IUser } from '@types'
import { RequestStatus } from '@api'

export type TUserState = {
    isAuthChecked: boolean
    data: IUser | null
    roles: string[]
    requestStatus: RequestStatus
}
