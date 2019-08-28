import { Body, HttpCode, JsonController, Param, Post } from "routing-controllers"
import { Inject } from "typedi"

import PushService from "../../../utils/push.service"
import UsersRepository from "../users/user.repository"
import { InjectRepository } from "typeorm-typedi-extensions"
import PhoneNumberRepository from "../phone-number/phone-number.repository"
import PhoneNumber from "../../../db/entities/phone-number"
import User from "../../../db/entities/user"
import envConfig from "../../../config/env.config"

@JsonController(`${envConfig.BASE_URL}/push`)
export class PushController {
    @InjectRepository()
    public readonly phoneNumberRepository: PhoneNumberRepository
    @Inject()
    private readonly pushService: PushService
    @InjectRepository()
    private readonly usersRepository: UsersRepository

    @HttpCode(201)
    @Post("/send/:type/:phoneNumber")
    public async setOnlineStatus(
        @Param("type") type: string,
        @Param("phoneNumber") phone: string,
        @Body() req: any
    ): Promise<void> {
        const phoneNumber: PhoneNumber = await this.phoneNumberRepository.findOne({
            value: phone
        })
        const user: User = await this.usersRepository.findUserByPhoneNumber(phoneNumber)
        return PushService.send(`${type}_${user.id}`, req)
    }
}
