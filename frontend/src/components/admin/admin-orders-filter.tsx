import { ordersActions, ordersSelector } from '@slices/orders'
import { useActionCreators, useDispatch, useSelector } from '@store/hooks'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchOrdersWithFilters } from '../../services/slice/orders/thunk'
import { AppRoute } from '../../utils/constants'
import { StatusType } from '../../utils/types'
import Filter from '../filter'
import styles from './admin.module.scss'
import { ordersFilterFields } from './helpers/ordersFilterFields'

export default function AdminFilterOrders() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [_, setSearchParams] = useSearchParams()

    const { updateFilter, clearFilters } = useActionCreators(ordersActions)
    const filterOrderOption = useSelector(ordersSelector.selectFilterOption)

    const handleFilter = (filters: Record<string, unknown>) => {
        const statusValue =
            typeof filters.status === 'object' &&
            filters.status !== null &&
            'value' in filters.status
                ? (filters.status as { value: unknown }).value
                : filters.status

        const normalizedStatus: StatusType | '' =
            typeof statusValue === 'string' ? (statusValue as StatusType) : ''

        dispatch(updateFilter({ ...filters, status: normalizedStatus }))
        const queryParams: { [key: string]: string } = {}
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                const optionValue =
                    typeof value === 'object' && value !== null && 'value' in value
                        ? (value as { value: unknown }).value
                        : value
                queryParams[key] =
                    String(optionValue)
            }
        })
        setSearchParams(queryParams)
        navigate(
            `${AppRoute.AdminOrders}?${new URLSearchParams(queryParams).toString()}`
        )
    }

    const handleClearFilters = () => {
        dispatch(clearFilters())
        setSearchParams({})
        dispatch(fetchOrdersWithFilters({}))
        navigate(AppRoute.AdminOrders)
    }

    return (
        <>
            <h2 className={styles.admin__title}>Фильтры</h2>
            <Filter
                fields={ordersFilterFields}
                onFilter={handleFilter}
                onClear={handleClearFilters}
                defaultValue={filterOrderOption}
            />
        </>
    )
}
