import { Service } from "typedi"
import { EntityRepository, Repository } from "typeorm"

import Gender from "../../../db/entities/gender"

@Service()
@EntityRepository(Gender)
export default class GenderRepository extends Repository<Gender> {}
