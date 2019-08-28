import { Authorized, CurrentUser, Get, HttpCode, JsonController, Put, QueryParam, Body } from "routing-controllers"
import { Inject } from "typedi"

import Earner from "../../../db/entities/earner"
import EarnerService from "./earner.service"
import Location from "../../../db/entities/location"
import { SubcategoriesDescriptor } from "./earner.dto"
import { AuthUser } from "../../../common"
import { UserDTO } from "../../../common/dto"
import envConfig from "../../../config/env.config"

@JsonController(`${envConfig.BASE_URL}/earner`)
export class EarnerController {
    @Inject()
    private readonly earnerService: EarnerService

    /**
     * TODO remove before release
     */
    @HttpCode(200)
    @Get()
    public async getAllEarners(): Promise<Earner[]> {
        return this.earnerService.getAllEarners()
    }

    @Authorized()
    @HttpCode(201)
    @Put("/category")
    public async updateEarnerCategory(
        @CurrentUser({ required: true }) user: AuthUser,
        @Body() descriptor: SubcategoriesDescriptor
    ): Promise<UserDTO> {
        return this.earnerService.updateUserAsEarnerByCategory(user, descriptor)
    }

    @Authorized("earner")
    @HttpCode(201)
    @Put("/location")
    public async updateEarnerLocation(
        @CurrentUser({ required: true }) user: AuthUser,
        @QueryParam("lat") lat: number,
        @QueryParam("lon") lon: number
    ): Promise<UserDTO> {
        return this.earnerService.updateEarnerLocationByCoordinates(new Location(lat, lon), user)
    }
}
