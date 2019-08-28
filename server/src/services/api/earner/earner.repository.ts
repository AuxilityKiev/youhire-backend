import { Service } from "typedi"
import { EntityRepository, Repository } from "typeorm"

import Earner from "../../../db/entities/earner"

@Service()
@EntityRepository(Earner)
export default class EarnerRepository extends Repository<Earner> {
    public async findAllEarners(): Promise<Earner[]> {
        return this.find({ relations: ["certificates", "job"] })
    }

    public async findFullEarner(id: number): Promise<Earner> {
        return this.findOne({ id }, { relations: ["certificates", "job"] })
    }
}
