import { Service } from "typedi"
import { EntityRepository, Repository } from "typeorm"
import { isNullOrUndefined } from "util"

import PhoneNumber from "../../../db/entities/phone-number"

@Service()
@EntityRepository(PhoneNumber)
export default class PhoneNumberRepository extends Repository<PhoneNumber> {
    public async phoneNumberExists(value: string): Promise<boolean> {
        return !isNullOrUndefined(await this.findOne({ value }))
    }

    public async getPhoneNumbersByUserAndCodes(): Promise<PhoneNumber[]> {
        return this.find({ relations: ["codes", "user"] })
    }
}
