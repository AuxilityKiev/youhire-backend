import { JsonController, Authorized, HttpCode, Get } from "routing-controllers"

import envConfig from "../../../config/env.config"

@JsonController(`${envConfig.BASE_URL}`)
export class GeneralController {
    @HttpCode(200)
    @Authorized()
    @Get("/time")
    public getTime(): Date {
        return new Date()
    }

    @HttpCode(200)
    @Get()
    public checkStatus(): { message: string } {
        return {
            message: "Is active"
        }
    }
}
