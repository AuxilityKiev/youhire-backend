import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm"

import Subcategory from "./subcategory"

@Entity()
export default class Category {
    @PrimaryGeneratedColumn()
    public id: number

    @Column()
    public name: string

    @OneToMany(type => Subcategory, subcategory => subcategory.category)
    public subcategories: Subcategory[]

    constructor(name: string) {
        this.name = name
    }
}
