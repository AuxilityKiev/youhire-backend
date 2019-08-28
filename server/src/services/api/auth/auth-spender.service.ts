import { Service } from "typedi"

import Code from "../../../db/entities/code"
import PhoneNumber from "../../../db/entities/phone-number"
import Spender from "../../../db/entities/spender"
import User from "../../../db/entities/user"
import DTOUtil from "../../../utils/dto.util"
import AuthUserService from "./auth-user.service"
import { Profile, ProfileRequest } from "./auth.dto"
import { UserDTO } from "../../../common/dto"
import { UserType } from "../../../common/enum"

@Service()
export default class AuthSpenderService extends AuthUserService {
    public async createSpender(user: User): Promise<UserDTO> {
        const userData: User = await this.userRepository.findUserAsSpenderById(user.id)
        if (userData && !userData.spender) {
            userData.spender = new Spender()
            const savedUser: User = await this.userRepository.save(userData)
            return DTOUtil.getUserDTO(savedUser, UserType.SPENDER)
        }
        return DTOUtil.getUserDTO(user, UserType.SPENDER)
    }

    public async confirmSpender(phoneNumber: PhoneNumber, code: Code): Promise<Profile> {
        const user: User =
            (await this.userRepository.findUserAsSpenderByPhoneNumber(phoneNumber)) ||
            (await this.createUserWithoutRole(phoneNumber))
        const userSpender: UserDTO = await this.createSpender(user)
        return this.confirmUser(userSpender, code)
    }

    public async fillUserAsSpender(userId: number, profileRequest: ProfileRequest): Promise<User> {
        const user: User = await this.userRepository.findUserAsSpenderById(userId)
        await this.fillUserGeneralData(user, profileRequest)
        return this.userRepository.save(user)
    }
}
