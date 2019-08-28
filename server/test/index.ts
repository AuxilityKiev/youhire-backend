"use strict"
import * as chai from "chai"
import { Container, Service } from "typedi"
import { DB } from "../src/db"
import dbConfig from "../src/config/db.config.test"
import env from "../src/config/env.config"
import logger from "../src/config/winston.user"
import serve from "../src/server"
import { InjectRepository } from "typeorm-typedi-extensions"
import PhoneNumberRepository from "../src/services/api/phone-number/phone-number.repository"
import UserRepository from "../src/services/api/users/user.repository"
import PhoneNumber from "../src/db/entities/phone-number"
import User from "../src/db/entities/user"
import AuthUtil from "../src/utils/auth.util"
import { UserType } from "../src/common"

export const should = chai.should()

// START SERVER
export const server = serve.listen(
    env.PORT,
    (): void => {
        logger.info(`HTTP Server listening on port: ${env.PORT}`)
        logger.info(`Environment: ${env.NODE_ENV}`)
    }
)

// CONNECT TO DB
export const database = new DB(dbConfig)

// TOKENS
@Service()
class TokenUtil {
    @InjectRepository() public phoneNumberRepository: PhoneNumberRepository
    @InjectRepository() public userRepository: UserRepository
    public async getToken(phone: string) {
        const phoneNumber: PhoneNumber = await this.phoneNumberRepository.findOne({
            value: phone
        })
        const user: User = await this.userRepository.findUserByPhoneNumber(phoneNumber)
        return AuthUtil.generateToken({
            id: user.id,
            phoneNumber: user.phoneNumber,
            type: UserType.EARNER
        })
    }
}
export const getToken = async (phone: string): Promise<string> => {
    const tokenUtil = Container.get(TokenUtil)
    return tokenUtil.getToken(phone)
}

// URLs LIST
export const URL = {
    SEND: "/api/user/send",
    CONFIRM: "/api/user/auth",
    PROFILE: "/api/user/profile",
    EARNER_STATUS: "/earner/status",
    USERS: "/users"
}

// MODELS
export const MODELS = {
    USER: ["id", "firstName", "lastName", "birthDate", "email", "age", "aboutMe", "city"],
    EARNER_PROFILE: [
        "id",
        "type",
        "phoneNumber",
        "firstName",
        "lastName",
        "age",
        "email",
        "birthDate",
        "city",
        "aboutMe",
        "avatar",
        "gender",
        "notifications",
        "registrationDate",
        "tasks",
        "rating",
        "categories",
        "online",
        "certificates"
    ]
}

/*
select users.id, earners.id, numbers.value, earners.online
from users
left join earners on earners.id = users."earnerId"
left join numbers on users."phoneNumberId" = numbers.id
order by numbers.value;
*/
