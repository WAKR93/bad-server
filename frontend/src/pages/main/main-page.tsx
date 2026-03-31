import Pagination from '@components/pagination'
import usePagination from '@components/pagination/helpers/usePagination'
import { productsSelector } from '@slices/products'
import { getProducts } from '@slices/products/thunk'
import { IProduct, IProductPaginationResult } from '@types'
import { Link } from 'react-router-dom'
import Card from '../../components/card/card'
import Gallery from '../../components/gallery/gallery'

export default function MainPage() {
    const {
        data: products,
        totalPages,
        currentPage,
        limit,
        nextPage,
        prevPage,
    } = usePagination<IProductPaginationResult, IProduct>(
        getProducts,
        productsSelector.selectProducts,
        10
    )
    return (
        <>
            <Gallery>
                {products.map((product) => (
                    <Card
                        key={product._id}
                        dataCard={product}
                        component={Link}
                    />
                ))}
            </Gallery>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                limit={limit}
                onNextPage={nextPage}
                onPrevPage={prevPage}
            />
        </>
    )
}
