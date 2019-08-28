import { Delete, Get, HttpCode, JsonController } from "routing-controllers"
import { Inject } from "typedi"

import User from "../../../db/entities/user"
import UserService from "./user.service"
import envConfig from "../../../config/env.config"

@JsonController(`${envConfig.BASE_URL}/user`)
export class UserController {
    @Inject()
    private readonly service: UserService

    @HttpCode(200)
    @Get()
    public async getAllUsers(): Promise<User[]> {
        return this.service.getAllUsers()
    }

    @HttpCode(200)
    @Delete()
    public async clearUsers(): Promise<void> {
        return this.service.clearUsers()
    }
}
