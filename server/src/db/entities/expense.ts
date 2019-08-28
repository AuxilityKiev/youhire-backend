import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm"
import Image from "./image"
import Job from "./job"

@Entity()
export default class Expense {
    @PrimaryGeneratedColumn()
    public id: number

    @Column({
        nullable: true
    })
    public comments: string

    @Column({
        nullable: true
    })
    public price: number

    @OneToMany(type => Image, image => image.expense, {
        eager: true
    })
    public photos: Image[]

    @ManyToOne(type => Job, job => job.expenses)
    public job: Job
}
