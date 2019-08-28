import { Service } from "typedi"
import { InjectRepository } from "typeorm-typedi-extensions"

import Spender from "../../../db/entities/spender"
import SpenderRepository from "./spender.repository"

@Service()
export default class SpenderService {
    @InjectRepository()
    private readonly repository: SpenderRepository

    /**
     * TODO remove before release
     */
    public async findAllSpenders(): Promise<Spender[]> {
        return this.repository.find({ relations: ["stripeAccount"] })
    }
}
