import { Inject, Service } from "typedi"
import { InjectRepository } from "typeorm-typedi-extensions"
import { HttpError } from "routing-controllers"
import { isNullOrUndefined } from "util"

import { AuthUser } from "../../../common"
import logger from "../../../config/winston.user"
import Code from "../../../db/entities/code"
import PhoneNumber from "../../../db/entities/phone-number"
import User from "../../../db/entities/user"
import {
    InvalidVerificationCodeError,
    PhoneNumberNotFoundError,
    RoleNotFoundError,
    ValidationError
} from "../../../errors/auth.error"
import AuthUtil from "../../../utils/auth.util"
import DTOUtil from "../../../utils/dto.util"
import CodeRepository from "../code/code.repository"
import PhoneNumberRepository from "../phone-number/phone-number.repository"
import SMSService from "../sms/sms.service"
import UserRepository from "../users/user.repository"
import AuthEarnerService from "./auth-earner.service"
import AuthSpenderService from "./auth-spender.service"
import { Profile, ProfileRequest, SignInConfirmRequest, SignInRequest } from "./auth.dto"
import PushService from "../../../utils/push.service"
import { UserType } from "../../../common/enum"
import { UserDTO } from "../../../common/dto"

@Service()
export default class AuthService {
    @Inject()
    private readonly earnerService: AuthEarnerService

    @Inject()
    private readonly spenderService: AuthSpenderService

    @Inject()
    private readonly smsService: SMSService

    @InjectRepository()
    private readonly codeRepository: CodeRepository

    @InjectRepository()
    private readonly phoneNumberRepository: PhoneNumberRepository

    @InjectRepository()
    private readonly userRepository: UserRepository

    public async send(signInRequest: SignInRequest): Promise<{ message: string }> {
        const formattedNumber: string = await this.smsService.formatNumber(signInRequest.phoneNumber)
        const savedNumber: PhoneNumber =
            (await this.phoneNumberRepository.findOne({ value: formattedNumber })) ||
            (await this.savePhoneNumber(formattedNumber))
        if (formattedNumber !== "+77000000000") {
            const savedCode: Code = await this.saveVerificationCode(savedNumber)
            logger.info(`Verification code ${savedCode} was saved`)
            try {
                logger.info(`SMS was sent to ${formattedNumber}`)
                await this.smsService.sendSMS(signInRequest, AuthUtil.getMessageWithCode(savedCode.value))
            } catch (err) {
                logger.error(err)
                throw new ValidationError()
            }
        } else {
            await this.saveVerificationCodeTest(savedNumber)
        }
        return {
            message: "SMS was sent successfully"
        }
    }

    public async confirm(signInConfirmRequest: SignInConfirmRequest, userType: string): Promise<Profile> {
        if (!signInConfirmRequest.phoneNumber || !signInConfirmRequest.code) {
            throw new ValidationError()
        }
        if (![UserType.EARNER, UserType.SPENDER].find(type => type === userType)) {
            throw new RoleNotFoundError(userType)
        }
        const formattedNumber: string = await this.smsService.formatNumber(signInConfirmRequest.phoneNumber)
        const phoneNumber: PhoneNumber = await this.phoneNumberRepository.findOne({
            value: formattedNumber
        })
        if (!phoneNumber) {
            throw new PhoneNumberNotFoundError()
        }
        const code: Code = await this.codeRepository.getCodeByPhoneNumber(signInConfirmRequest.code, phoneNumber)
        if (!code) {
            throw new InvalidVerificationCodeError()
        }
        if (userType === UserType.EARNER) {
            logger.info(`Earner with number ${phoneNumber.value} is being confirmed by code ${code.value}`)
            return this.earnerService.confirmEarner(phoneNumber, code)
        } else {
            logger.info(`Spender with number ${phoneNumber.value} is being confirmed by code ${code.value}`)
            return this.spenderService.confirmSpender(phoneNumber, code)
        }
    }

    public async sendTest(request: SignInRequest): Promise<{ message: string }> {
        const formattedNumber = await this.smsService.formatNumber(request.phoneNumber)
        if (!formattedNumber) {
            throw new ValidationError()
        }
        const savedNumber: PhoneNumber =
            (await this.phoneNumberRepository.findOne({ value: formattedNumber })) ||
            (await this.savePhoneNumber(formattedNumber))
        await this.saveVerificationCodeTest(savedNumber)
        return {
            message: "SMS was sent successfully"
        }
    }

    public async fillUser(profileRequest: ProfileRequest, currentUser: AuthUser): Promise<UserDTO> {
        logger.info(`User [${currentUser.id}, ${currentUser.type}] is being updated`)
        if (currentUser.type === UserType.EARNER) {
            return DTOUtil.getUserDTO(
                await this.earnerService.fillUserAsEarner(currentUser.id, profileRequest),
                currentUser.type
            )
        } else if (currentUser.type === UserType.SPENDER) {
            return DTOUtil.getUserDTO(
                await this.spenderService.fillUserAsSpender(currentUser.id, profileRequest),
                currentUser.type
            )
        } else {
            throw new RoleNotFoundError(currentUser.type)
        }
    }

    public async getUserProfile(currentUser: AuthUser): Promise<UserDTO> {
        const userData: User = await this.userRepository.findFullUserById(currentUser.id, currentUser.type as UserType)
        return DTOUtil.getUserDTO(userData, currentUser.type)
    }

    public async switchNotifications(
        enabled: boolean,
        user: AuthUser,
        request: { firebaseToken: string }
    ): Promise<UserDTO> {
        if (enabled) {
            await PushService.register(`${user.type}_${user.id}`, request.firebaseToken)
        } else {
            await PushService.unregister(`${user.type}_${user.id}`, request.firebaseToken)
        }
        return this.updateProperty("notifications", enabled, user)
    }

    public async setOnlineStatus(status: boolean, user: AuthUser): Promise<UserDTO> {
        return this.updateProperty("online", status, user)
    }

    private async updateProperty(property: string, value: any, user: AuthUser): Promise<UserDTO> {
        const userData: User = await this.userRepository.findFullUserById(user.id, user.type as UserType)
        if (!userData[user.type]) {
            throw new HttpError(405, `Role "${user.type}" does not exist for current user!`)
        }
        if (
            !isNullOrUndefined(userData[user.type][property]) &&
            typeof userData[user.type][property] === typeof value
        ) {
            userData[user.type][property] = value
            await this.userRepository.save(userData)
            return DTOUtil.getUserDTO(userData, user.type)
        } else {
            throw new HttpError(
                406,
                `Role "${user.type}" does not have property "${property}" or value "${value}" cannot be set`
            )
        }
    }

    private async savePhoneNumber(value: string): Promise<PhoneNumber> {
        const phoneNumber = new PhoneNumber()
        phoneNumber.value = value
        return this.phoneNumberRepository.save(phoneNumber)
    }

    private async saveVerificationCode(phoneNumber: PhoneNumber): Promise<Code> {
        const code = new Code()
        code.value = AuthUtil.generateVerificationCode()
        code.phoneNumber = phoneNumber
        return this.codeRepository.save(code)
    }

    private async saveVerificationCodeTest(phoneNumber: PhoneNumber): Promise<Code> {
        const code = new Code()
        code.value = "000000"
        code.phoneNumber = phoneNumber
        return this.codeRepository.save(code)
    }
}
