import { EntityRepository, Repository } from "typeorm"

import Achievement from "../../../db/entities/achievement"

@EntityRepository(Achievement)
export default class AchievementRepository extends Repository<Achievement> {}
