import { useSelector } from '@store/hooks.ts'
import { basketSelector } from '@slices/basket'

export const useIsBasket = (id: string) => {
    const { selectBasketItems } = basketSelector
    const productsInBasket = useSelector(selectBasketItems)

    const isBasket = productsInBasket.find((product) => product._id === id)

    return Boolean(isBasket)
}
