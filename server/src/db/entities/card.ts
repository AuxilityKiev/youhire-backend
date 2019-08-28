import { Column } from "typeorm"

export default class Card {
    @Column({
        nullable: true
    })
    public brand: string

    @Column({
        nullable: true
    })
    public token: string

    @Column({
        nullable: true
    })
    public expirationMonth: number

    @Column({
        nullable: true
    })
    public expirationYear: number

    @Column({
        nullable: true
    })
    public last4: string

    @Column({
        nullable: true
    })
    public selected: boolean
}
