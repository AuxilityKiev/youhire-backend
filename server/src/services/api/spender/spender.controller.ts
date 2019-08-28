import { Get, HttpCode, JsonController, Authorized, Put, Param, CurrentUser, Body } from "routing-controllers"
import { Inject } from "typedi"

import Spender from "../../../db/entities/spender"
import SpenderService from "./spender.service"
import envConfig from "../../../config/env.config"

@JsonController(`${envConfig.BASE_URL}/spender`)
export class SpenderController {
    @Inject()
    private readonly service: SpenderService

    /**
     * TODO remove before release
     */
    @HttpCode(200)
    @Get()
    public async getAllSpenders(): Promise<Spender[]> {
        return this.service.findAllSpenders()
    }
}
