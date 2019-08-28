import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne } from "typeorm"

import Addition from "./addition"
import Category from "./category"

@Entity()
export default class Subcategory {
    @PrimaryGeneratedColumn()
    public id: number

    @Column()
    public name: string

    @Column({
        type: "real"
    })
    public minPrice: number

    @Column({
        type: "real"
    })
    public maxPrice: number

    @Column({
        nullable: true
    })
    public icon: string

    @ManyToMany(type => Addition, addition => addition.subcategories, {
        eager: true
    })
    @JoinTable()
    public additions: Addition[]

    @ManyToOne(type => Category, category => category.subcategories)
    public category: Category

    constructor(name: string, minPrice: number, maxPrice: number, icon: string, parent: Category) {
        this.name = name
        this.minPrice = minPrice
        this.maxPrice = maxPrice
        this.icon = icon
        this.category = parent
    }
}
