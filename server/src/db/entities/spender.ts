import { BeforeInsert, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"

import Job from "./job"
import StripeAccount from "./stripe-account"
import UserRole from "./user-role"

@Entity({
    name: "spenders"
})
export default class Spender extends UserRole {
    @OneToOne(type => Job, job => job.spender, {
        onDelete: "SET NULL"
    })
    @JoinColumn()
    public job: Job

    @OneToOne(type => StripeAccount, stripeAccount => stripeAccount.spender)
    @JoinColumn()
    public stripeAccount: StripeAccount
}
