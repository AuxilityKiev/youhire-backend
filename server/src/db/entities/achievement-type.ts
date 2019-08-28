import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import Achievement from "./achievement"

@Entity()
export default class AchievementType {
    @PrimaryGeneratedColumn()
    public id: number

    @Column()
    public name: string

    @Column({
        nullable: true
    })
    public icon: string

    @OneToMany(type => Achievement, achievement => achievement.type)
    public achievements: Achievement[]

    constructor(name: string) {
        this.name = name
    }
}
