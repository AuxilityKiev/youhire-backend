import { Get, HttpCode, JsonController } from "routing-controllers"
import { Inject } from "typedi"

import Gender from "../../../db/entities/gender"
import GenderService from "./gender.service"
import envConfig from "../../../config/env.config"

@JsonController(`${envConfig.BASE_URL}/gender`)
export class GenderController {
    @Inject()
    private readonly service: GenderService

    /**
     * TODO remove before release
     */
    @HttpCode(200)
    @Get()
    public async getAllGenders(): Promise<Gender[]> {
        return this.service.findAllGenders()
    }
}
