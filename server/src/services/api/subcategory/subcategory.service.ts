import { Service } from "typedi"
import { InjectRepository } from "typeorm-typedi-extensions"

import SubcategoryRepository from "./subcategory.repository"
import Subcategory from "../../../db/entities/subcategory"
import Addition from "../../../db/entities/addition"

@Service()
export default class SubcategoryService {
    @InjectRepository()
    private readonly repository: SubcategoryRepository

    public async getSubcategoryById(id: number): Promise<Subcategory> {
        return this.repository.findOne({ id })
    }

    public async getAdditionsFromSubcategoryById(id: number): Promise<Addition[]> {
        return (await this.repository.findOne({ id })).additions
    }
}
