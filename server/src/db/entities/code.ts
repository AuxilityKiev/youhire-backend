import { IsDate, IsNumberString } from "class-validator"
import { BeforeInsert, Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"

import PhoneNumber from "./phone-number"

@Entity({
    name: "codes"
})
export default class Code {
    @PrimaryGeneratedColumn()
    public id: number

    @Column()
    @IsNumberString()
    public value: string

    @ManyToOne(type => PhoneNumber, phoneNumber => phoneNumber.codes)
    public phoneNumber: PhoneNumber

    @CreateDateColumn()
    public createdAt: Date

    @Column({
        nullable: true
    })
    @IsDate()
    public activatedAt: Date
}
