import { JsonController, Authorized, HttpCode, Get, Param } from "routing-controllers"
import { Inject } from "typedi"

import SubcategoryService from "./subcategory.service"
import Addition from "../../../db/entities/addition"
import envConfig from "../../../config/env.config"

@JsonController(`${envConfig.BASE_URL}/subcategories`)
export class SubcategoryController {
    @Inject()
    private readonly service: SubcategoryService

    @Authorized()
    @HttpCode(200)
    @Get("/:id/additions")
    public async getAdditionsFromSubcategory(@Param("id") id: number): Promise<Addition[]> {
        return this.service.getAdditionsFromSubcategoryById(id)
    }
}
