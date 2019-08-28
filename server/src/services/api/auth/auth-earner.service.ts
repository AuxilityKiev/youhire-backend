import { Service } from "typedi"

import Code from "../../../db/entities/code"
import Earner from "../../../db/entities/earner"
import PhoneNumber from "../../../db/entities/phone-number"
import User from "../../../db/entities/user"
import DTOUtil from "../../../utils/dto.util"
import AuthUserService from "./auth-user.service"
import { Profile, ProfileRequest } from "./auth.dto"
import { UserDTO } from "../../../common/dto"
import { UserType } from "../../../common/enum"
import { InjectRepository } from "typeorm-typedi-extensions"
import AchievementRepository from "../achievement/achievement.repository"
import AchievementTypeRepository from "../achievement-type/achievement-type.repository"
import AchievementType from "../../../db/entities/achievement-type"
import Achievement from "../../../db/entities/achievement"
import EarnerRepository from "../earner/earner.repository"

@Service()
export default class AuthEarnerService extends AuthUserService {
    @InjectRepository()
    private readonly achievementTypeRepository: AchievementTypeRepository

    @InjectRepository()
    private readonly achievementRepository: AchievementRepository

    @InjectRepository()
    private readonly earnerRepository: EarnerRepository

    public async createEarner(user: User): Promise<UserDTO> {
        const userData: User = await this.userRepository.findUserAsEarnerById(user.id)
        if (userData && !userData.earner) {
            const achievementTypes: AchievementType[] = await this.achievementTypeRepository.find()
            const achievements: Achievement[] = achievementTypes.map(type => new Achievement(type))
            for (const achievement of achievements) {
                await this.achievementRepository.save(achievement)
            }
            const earner = new Earner()
            earner.achievements = achievements
            await this.earnerRepository.save(earner)
            userData.earner = earner
            await this.userRepository.save(userData)
            return DTOUtil.getUserDTO(userData, UserType.EARNER)
        }
        return DTOUtil.getUserDTO(userData, UserType.EARNER)
    }

    public async confirmEarner(phoneNumber: PhoneNumber, code: Code): Promise<Profile> {
        const user: User =
            (await this.userRepository.findUserAsEarnerByPhoneNumber(phoneNumber)) ||
            (await this.createUserWithoutRole(phoneNumber))
        const userEarner: UserDTO = await this.createEarner(user)
        code.activatedAt = new Date()
        await this.codeRepository.save(code)
        phoneNumber.codes = [code]
        await this.phoneNumberRepository.save(phoneNumber)
        return this.confirmUser(userEarner, code)
    }

    public async fillUserAsEarner(userId: number, profileRequest: ProfileRequest): Promise<User> {
        const user: User = await this.userRepository.findUserAsEarnerById(userId)
        await this.fillUserGeneralData(user, profileRequest)
        return this.userRepository.save(user)
    }
}
