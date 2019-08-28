import Category from "../../../db/entities/category"
import Addition from "../../../db/entities/addition"

interface SubcategoryDTO {
    id: number
    name: string
    minPrice: number
    maxPrice: number
    icon: string
    additions: number[]
    parentCategory: number
}

interface CategoryResponse {
    subcategories: SubcategoryDTO[]
    categories: Category[]
    additions: Addition[]
}

export { SubcategoryDTO, CategoryResponse }
