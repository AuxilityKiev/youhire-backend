import { BeforeInsert, Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm"

import Certificate from "./certificate"
import Job from "./job"
import Location from "./location"
import UserRole from "./user-role"
import Subcategory from "./subcategory"
import Achievement from "./achievement"
import StripeAccount from "./stripe-account"

@Entity({
    name: "earners"
})
export default class Earner extends UserRole {
    @Column({
        type: "jsonb",
        default: null
    })
    public location: Location

    @Column({
        type: "jsonb",
        default: []
    })
    public subcategories: Subcategory[]

    @Column({
        type: "float",
        default: 0
    })
    public amount: number

    @OneToOne(type => Job, job => job.earner, {
        onDelete: "SET NULL"
    })
    @JoinColumn()
    public job: Job

    @OneToMany(type => Certificate, certificate => certificate.earner)
    public certificates: Certificate[]

    @OneToMany(type => Achievement, achievement => achievement.earner, {
        eager: true
    })
    public achievements: Achievement[]

    @OneToOne(type => StripeAccount, stripeAccount => stripeAccount.earner)
    @JoinColumn()
    public stripeAccount: StripeAccount

    @BeforeInsert()
    public init() {
        this.certificates = []
    }
}
