import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm"

import User from "./user"

@Entity({
    name: "genders"
})
export default class Gender {
    @PrimaryGeneratedColumn()
    public id: number

    @Column()
    public type: string

    @OneToMany(type => User, user => user.gender)
    public users: User[]

    constructor(type: string) {
        this.type = type
    }
}
