import { EntityRepository, Repository } from "typeorm"

import AdditionValue from "../../../db/entities/addition-value"

@EntityRepository(AdditionValue)
export default class AdditionValueRepository extends Repository<AdditionValue> {}
