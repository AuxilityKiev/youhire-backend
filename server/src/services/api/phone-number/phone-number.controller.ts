import { Get, HttpCode, JsonController } from "routing-controllers"
import { Inject } from "typedi"

import PhoneNumber from "../../../db/entities/phone-number"
import PhoneNumberService from "./phone-number.service"
import envConfig from "../../../config/env.config"

@JsonController(`${envConfig.BASE_URL}/numbers`)
export class PhoneNumberController {
    @Inject()
    private readonly service: PhoneNumberService

    /**
     * TODO remove before release
     */
    @HttpCode(200)
    @Get()
    public async getAllPhoneNumbers(): Promise<PhoneNumber[]> {
        return this.service.getAllPhoneNumbers()
    }
}
