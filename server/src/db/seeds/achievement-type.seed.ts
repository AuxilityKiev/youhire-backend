import { getManager, Repository } from "typeorm"

import AchievementType from "../entities/achievement-type"

enum AchievementTypeDefinition {
    EXCELLENT_SERVICE = "Excellent service",
    QUICK_HANDS = "Quick hands",
    ABOVE_AND_BEYOND = "Above and Beyond",
    GOOD_MAN = "Good man"
}

const achievementTypeList: AchievementType[] = [
    new AchievementType(AchievementTypeDefinition.EXCELLENT_SERVICE),
    new AchievementType(AchievementTypeDefinition.QUICK_HANDS),
    new AchievementType(AchievementTypeDefinition.ABOVE_AND_BEYOND),
    new AchievementType(AchievementTypeDefinition.GOOD_MAN)
]

export const seedAchievementTypes = async (): Promise<void> => {
    const repository: Repository<AchievementType> = getManager().getRepository(AchievementType)
    if ((await repository.count()) === 0) {
        for (const type of achievementTypeList) {
            await repository.save(type)
        }
    }
}
