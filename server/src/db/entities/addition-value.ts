import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"

import Addition from "./addition"

@Entity()
export default class AdditionValue {
    @PrimaryGeneratedColumn()
    public id: number

    @Column({
        nullable: true
    })
    public name: string

    @Column({
        nullable: true
    })
    public index: number

    @ManyToOne(type => Addition, addition => addition.values)
    public addition: Addition

    constructor(name: string, index: number) {
        this.name = name
        this.index = index
    }
}
