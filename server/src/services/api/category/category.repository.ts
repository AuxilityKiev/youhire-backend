import { Service } from "typedi"
import { EntityRepository, Repository } from "typeorm"
import Category from "../../../db/entities/category"

@Service()
@EntityRepository(Category)
export default class CategoryRepository extends Repository<Category> {
    public async findAllCategoriesWithSubcategories(): Promise<Category[]> {
        return this.find({ relations: ["subcategories"] })
    }
}
