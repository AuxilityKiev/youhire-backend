import { Service } from "typedi"
import { EntityRepository, Repository } from "typeorm"

import PhoneNumber from "../../../db/entities/phone-number"
import User from "../../../db/entities/user"
import { UserType } from "../../../common/enum"

@Service()
@EntityRepository(User)
export default class UserRepository extends Repository<User> {
    public async findAllFullUsers(): Promise<User[]> {
        return this.find({
            relations: [
                "phoneNumber",
                "numbersHistory",
                "gender",
                "avatar",
                UserType.EARNER,
                `${UserType.EARNER}.certificates`,
                UserType.SPENDER,
                `${UserType.SPENDER}.stripeAccount`
            ]
        })
    }

    public async findFullUserById(userId: number, userType: UserType): Promise<User> {
        const info: string[] = userType === UserType.EARNER ? [`${userType}.certificates`] : []
        const job: string[] = [`${userType}.job`, `${userType}.job.earner`, `${userType}.job.spender`]
        return this.findOne(
            { id: userId },
            {
                relations: [
                    "phoneNumber",
                    "numbersHistory",
                    "gender",
                    "avatar",
                    userType,
                    `${userType}.stripeAccount`,
                    ...info,
                    ...job
                ]
            }
        )
    }

    public async findUserByPhoneNumber(phoneNumber: PhoneNumber): Promise<User> {
        return this.findOne(
            { phoneNumber },
            {
                relations: ["phoneNumber", "numbersHistory", "gender", "avatar"]
            }
        )
    }

    public async findFullUserByPhoneNumber(phoneNumber: PhoneNumber, userType: UserType): Promise<User> {
        const info: string[] = userType === UserType.EARNER ? [`${userType}.certificates`] : []
        return this.findOne(
            { phoneNumber },
            {
                relations: [
                    "phoneNumber",
                    "numbersHistory",
                    "gender",
                    "avatar",
                    userType,
                    `${userType}.stripeAccount`,
                    ...info
                ]
            }
        )
    }

    public async findUserAsEarnerById(userId: number): Promise<User> {
        return this.findFullUserById(userId, UserType.EARNER)
    }

    public async findUserAsEarnerByPhoneNumber(phoneNumber: PhoneNumber): Promise<User> {
        return this.findFullUserByPhoneNumber(phoneNumber, UserType.EARNER)
    }

    public async findUserAsSpenderById(userId: number): Promise<User> {
        return this.findFullUserById(userId, UserType.SPENDER)
    }

    public async findUserAsSpenderByPhoneNumber(phoneNumber: PhoneNumber): Promise<User> {
        return this.findFullUserByPhoneNumber(phoneNumber, UserType.SPENDER)
    }
}
