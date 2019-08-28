import { EntityRepository, Repository } from "typeorm"

import Subcategory from "../../../db/entities/subcategory"
import Category from "../../../db/entities/category"

@EntityRepository(Subcategory)
export default class SubcategoryRepository extends Repository<Subcategory> {
    public async findSubcategoriesByIdsWithCategory(ids: number[]): Promise<Subcategory[]> {
        return this.findByIds(ids, {
            relations: ["category"]
        })
    }

    public async findSubcategoriesByByCategory(category: Category): Promise<Subcategory[]> {
        return this.find({ category })
    }
}
