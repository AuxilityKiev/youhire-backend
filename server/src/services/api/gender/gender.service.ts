import { Service } from "typedi"
import { InjectRepository } from "typeorm-typedi-extensions"

import Gender from "../../../db/entities/gender"
import GenderRepository from "./gender.repository"

@Service()
export default class GenderService {
    @InjectRepository()
    private readonly repository: GenderRepository

    /**
     * TODO remove before release
     */
    public async findAllGenders(): Promise<Gender[]> {
        return this.repository.find()
    }
}
