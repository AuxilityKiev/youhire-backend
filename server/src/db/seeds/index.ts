import { seedCategories } from "./category.seed"
import { seedGenders } from "./gender.seed"
import { seedHost } from "./host.seed"
import { seedRealEarner } from "./earner.seed"
import { seedSpenders } from "./spender.seed"
import { seedAdditions } from "./addition.seed"
import { seedAchievementTypes } from "./achievement-type.seed"

export const seed = async () => {
    await seedHost()
    await seedAchievementTypes()
    await seedGenders()
    await seedCategories()
    await seedAdditions()
    await seedRealEarner()
    await seedSpenders()
}
