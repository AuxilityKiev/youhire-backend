import { Authorized, Get, HttpCode, JsonController } from "routing-controllers"
import { Inject } from "typedi"

import CategoryService from "./category.service"
import Category from "../../../db/entities/category"
import envConfig from "../../../config/env.config"

@JsonController(`${envConfig.BASE_URL}/categories`)
export class CategoryController {
    @Inject()
    private readonly service: CategoryService

    @Authorized()
    @HttpCode(200)
    @Get()
    public async getAllCategories(): Promise<Category[]> {
        return this.service.getAllCategoriesWithSubcategories()
    }
}
