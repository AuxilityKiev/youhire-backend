import { Column, PrimaryGeneratedColumn, Entity, OneToMany, ManyToOne, ManyToMany } from "typeorm"

import AdditionType from "./addition-type"
import AdditionValue from "./addition-value"
import Subcategory from "./subcategory"

@Entity()
export default class Addition {
    @PrimaryGeneratedColumn()
    public id: number

    @Column()
    public title: string

    @Column({
        nullable: true
    })
    public icon: string

    @ManyToOne(type => AdditionType, addType => addType.additions, {
        eager: true
    })
    public type: AdditionType

    @OneToMany(type => AdditionValue, value => value.addition, {
        eager: true
    })
    public values: AdditionValue[]

    @ManyToMany(type => Subcategory, subcategory => subcategory.additions)
    public subcategories: Subcategory[]

    constructor(title: string, icon?: string) {
        this.title = title
        this.icon = icon
    }
}
