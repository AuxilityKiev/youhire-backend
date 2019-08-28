import {
    Column,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToMany,
    JoinTable
} from "typeorm"

import Earner from "./earner"
import Image from "./image"
import Location from "./location"
import Spender from "./spender"
import envConfig from "../../config/env.config"
import AdditionValue from "./addition-value"
import Subcategory from "./subcategory"
import { JobStatus } from "../../common/enum"
import Expense from "./expense"

@Entity()
export default class Job {
    @PrimaryGeneratedColumn()
    public id: number

    @Column({
        nullable: true
    })
    public title: string

    @Column({
        type: "jsonb",
        default: null
    })
    public location: Location

    @Column({
        nullable: true
    })
    public status: JobStatus

    @Column({
        nullable: true
    })
    public details: string

    @Column({
        nullable: true,
        type: "float"
    })
    public price: number

    @CreateDateColumn()
    public createdAt: Date

    @Column({
        nullable: true
    })
    public startedAt: Date

    @Column({
        nullable: true
    })
    public finishedAt: Date

    @Column({
        nullable: true
    })
    public processId: number

    @Column({
        default: envConfig.TIME_TO_ACCEPT
    })
    public timeToAccept: number

    @Column({
        default: envConfig.AVERAGE_TIME_OF_EXECUTION
    })
    public averageExecutionTime: number

    @Column({
        nullable: true,
        type: "jsonb"
    })
    public subcategory: Subcategory

    @ManyToMany(type => AdditionValue, {
        eager: true
    })
    @JoinTable()
    public additionValues: AdditionValue[]

    @OneToOne(type => Earner, earner => earner.job)
    public earner: Earner

    @OneToOne(type => Spender, spender => spender.job)
    public spender: Spender

    @OneToMany(type => Image, photo => photo.job, {
        eager: true,
        onDelete: "CASCADE"
    })
    public photos: Image[]

    @OneToMany(type => Expense, expense => expense.job, {
        eager: true
    })
    public expenses: Expense[]

    constructor(title?: string, subcategory?: Subcategory, details?: string, status?: JobStatus, location?: Location) {
        this.title = title
        this.subcategory = subcategory
        this.details = details
        this.status = status
        this.location = location
    }
}
