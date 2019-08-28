import { Service } from "typedi"
import { EntityRepository, Repository, MoreThan } from "typeorm"
import { isNullOrUndefined } from "util"

import Code from "../../../db/entities/code"
import PhoneNumber from "../../../db/entities/phone-number"

@Service()
@EntityRepository(Code)
export default class CodeRepository extends Repository<Code> {
    public async codeExists(value: string): Promise<boolean> {
        return !isNullOrUndefined(await this.findOne({ value }))
    }

    public async getCodesByPhoneNumber(): Promise<Code[]> {
        return this.find({ relations: ["phoneNumber"] })
    }

    public async getCodeByPhoneNumber(value: string, phoneNumber: PhoneNumber): Promise<Code> {
        const period = new Date()
        period.setMinutes(period.getMinutes() - 5)
        return this.findOne(
            { phoneNumber, value, activatedAt: null, createdAt: MoreThan(period) },
            {
                relations: ["phoneNumber"]
            }
        )
    }
}
