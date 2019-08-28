import { EntityRepository, Repository } from "typeorm"

import AchievementType from "../../../db/entities/achievement-type"

@EntityRepository(AchievementType)
export default class AchievementTypeRepository extends Repository<AchievementType> {}
