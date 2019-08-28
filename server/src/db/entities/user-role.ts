import {
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    VersionColumn,
    ManyToMany,
    JoinTable,
    BeforeInsert,
    OneToOne,
    JoinColumn
} from "typeorm"

import Job from "./job"
import StripeAccount from "./stripe-account"

export default class UserRole {
    @PrimaryGeneratedColumn()
    public id: number

    @Column({
        default: false
    })
    public online: boolean

    @Column({
        type: "float",
        default: 0
    })
    public rating: number

    @Column({
        default: 0
    })
    public tasks: number

    @ManyToMany(type => Job)
    @JoinTable()
    public jobHistory: Job[]

    @Column({
        default: false
    })
    public notifications: boolean

    @CreateDateColumn()
    public registrationDate: Date

    @VersionColumn()
    public version: number

    @OneToOne(type => StripeAccount)
    @JoinColumn()
    public stripeAccount: StripeAccount

    @BeforeInsert()
    public init() {
        this.jobHistory = []
    }
}
