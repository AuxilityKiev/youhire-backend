import { Get, HttpCode, JsonController } from "routing-controllers"
import { Inject } from "typedi"

import Code from "../../../db/entities/code"
import CodeService from "./code.service"
import envConfig from "../../../config/env.config"

@JsonController(`${envConfig.BASE_URL}/codes`)
export class CodeController {
    @Inject()
    private readonly service: CodeService

    /**
     * TODO remove before release
     */
    @HttpCode(200)
    @Get()
    public async getCodes(): Promise<Code[]> {
        return this.service.getAllCodesWithPhoneNumber()
    }
}
