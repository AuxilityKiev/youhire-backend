import { Service } from "typedi"
import { InjectRepository } from "typeorm-typedi-extensions"

import PhoneNumber from "../../../db/entities/phone-number"
import PhoneNumberRepository from "./phone-number.repository"

@Service()
export default class PhoneNumberService {
    @InjectRepository()
    private readonly repository: PhoneNumberRepository

    /**
     * TODO remove before release
     */
    public async getAllPhoneNumbers(): Promise<PhoneNumber[]> {
        return this.repository.getPhoneNumbersByUserAndCodes()
    }
}
