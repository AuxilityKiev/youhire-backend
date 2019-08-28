import { Service } from "typedi"
import { EntityRepository, Repository } from "typeorm"

import Spender from "../../../db/entities/spender"

@Service()
@EntityRepository(Spender)
export default class SpenderRepository extends Repository<Spender> {
    public async findSpenderById(spenderId: number): Promise<Spender> {
        return this.findOne({ id: spenderId }, { relations: ["stripeAccount", "job"] })
    }
}
