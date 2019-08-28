import { EntityRepository, Repository } from "typeorm"

import Addition from "../../../db/entities/addition"

@EntityRepository(Addition)
export default class AdditionRepository extends Repository<Addition> {}
