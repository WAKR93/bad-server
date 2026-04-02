import { IProduct } from '@types'

export interface ProductFormValues
    extends Pick<IProduct, 'title' | 'description' | 'price'> {}
