import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"

import Addition from "./addition"

@Entity()
export default class AdditionType {
    @PrimaryGeneratedColumn()
    public id: number

    @Column({
        nullable: true
    })
    public value: string

    @OneToMany(type => Addition, addition => addition.type)
    public additions: Addition[]

    constructor(value: string) {
        this.value = value
    }
}
