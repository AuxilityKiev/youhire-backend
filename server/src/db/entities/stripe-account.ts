import { Column, Entity, OneToOne, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"

import Spender from "./spender"
import Card from "./card"
import Earner from "./earner"

@Entity()
export default class StripeAccount {
    @PrimaryGeneratedColumn()
    public id: number

    @Column({
        nullable: true
    })
    public accountId: string

    @Column({
        nullable: true
    })
    public customerId: string

    @Column({
        type: "jsonb",
        default: []
    })
    public cards: Card[]

    @CreateDateColumn()
    public createdAt: Date

    @OneToOne(type => Spender, spender => spender.stripeAccount)
    public spender: Spender

    @OneToOne(type => Earner, earner => earner.stripeAccount)
    public earner: Earner
}
