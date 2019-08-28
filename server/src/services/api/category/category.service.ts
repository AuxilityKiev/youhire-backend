import { Service } from "typedi"
import { InjectRepository } from "typeorm-typedi-extensions"

import Category from "../../../db/entities/category"
import CategoryRepository from "./category.repository"

@Service()
export default class CategoryService {
    @InjectRepository()
    private readonly categoryRepository: CategoryRepository

    public async getAllCategoriesWithSubcategories(): Promise<Category[]> {
        return this.categoryRepository.find({ relations: ["subcategories"] })
    }
}
