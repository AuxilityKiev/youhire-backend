import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"

import AchievementType from "./achievement-type"
import Earner from "./earner"

@Entity()
export default class Achievement {
    @PrimaryGeneratedColumn()
    public id: number

    @ManyToOne(type => AchievementType, achivementType => achivementType.achievements, {
        eager: true
    })
    public type: AchievementType

    @ManyToOne(type => Earner, earner => earner.achievements)
    public earner: Earner

    @Column({
        default: 0
    })
    public count: number

    constructor(type: AchievementType) {
        this.type = type
    }
}
