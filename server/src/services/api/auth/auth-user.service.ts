import { Service } from "typedi"
import { InjectRepository } from "typeorm-typedi-extensions"
import { validate, ValidationError as ValidationClassError } from "class-validator"

import Code from "../../../db/entities/code"
import PhoneNumber from "../../../db/entities/phone-number"
import User from "../../../db/entities/user"
import AuthUtil from "../../../utils/auth.util"
import CodeRepository from "../code/code.repository"
import GenderRepository from "../gender/gender.repository"
import PhoneNumberRepository from "../phone-number/phone-number.repository"
import UserRepository from "../users/user.repository"
import { ProfileRequest, Profile } from "./auth.dto"
import { ValidationError, PhoneNumberIsAlreadyRegisteredError } from "../../../errors/auth.error"
import { UserDTO } from "../../../common/dto"

@Service()
export default class AuthUserService {
    @InjectRepository()
    protected readonly codeRepository: CodeRepository

    @InjectRepository()
    protected readonly phoneNumberRepository: PhoneNumberRepository

    @InjectRepository()
    protected readonly userRepository: UserRepository

    @InjectRepository()
    protected readonly genderRepository: GenderRepository

    protected async createUserWithoutRole(phoneNumber: PhoneNumber): Promise<User> {
        const newUser = new User()
        newUser.phoneNumber = phoneNumber
        newUser.numbersHistory = [phoneNumber]
        return this.userRepository.save(newUser)
    }

    protected async fillUserGeneralData(user: User, profileRequest: ProfileRequest): Promise<User> {
        if (profileRequest.firstName) {
            user.firstName = profileRequest.firstName
        }
        if (profileRequest.lastName) {
            user.lastName = profileRequest.lastName
        }
        if (profileRequest.email) {
            user.email = profileRequest.email
        }
        if (profileRequest.age) {
            user.age = profileRequest.age
        }
        if (profileRequest.birthDate) {
            user.birthDate = new Date(profileRequest.birthDate)
        }
        if (profileRequest.city) {
            user.city = profileRequest.city
        }
        if (profileRequest.aboutMe) {
            user.aboutMe = profileRequest.aboutMe
        }
        if (profileRequest.gender) {
            user.gender = await this.genderRepository.findOne({
                type: profileRequest.gender
            })
        }
        const errors: ValidationClassError[] = await validate(user)
        if (errors.length > 0) {
            throw new ValidationError(JSON.stringify(errors))
        }
        return user
    }

    protected async confirmUser(user: UserDTO, code: Code): Promise<Profile> {
        code.activatedAt = new Date()
        await this.codeRepository.save(code)
        return {
            status: "Success",
            token: AuthUtil.generateToken({
                id: user.id,
                phoneNumber: user.phoneNumber,
                type: user.type
            }),
            profile: user
        }
    }

    protected async updatePhoneNumber(user: User, value: string): Promise<User> {
        const phoneNumber: PhoneNumber = await this.phoneNumberRepository.findOne({
            value
        })
        if (!phoneNumber) {
            user.phoneNumber = await this.phoneNumberRepository.save(
                Object.assign(new PhoneNumber(), {
                    value,
                    createdAt: new Date()
                })
            )
            if (!user.numbersHistory) {
                user.numbersHistory = []
            }
            user.numbersHistory.push(phoneNumber)
        } else {
            throw new PhoneNumberIsAlreadyRegisteredError()
        }
        return this.userRepository.save(user)
    }
}
