import { IsString } from "class-validator"
import {
    BeforeInsert,
    Column,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn
} from "typeorm"

import Code from "./code"
import User from "./user"

@Entity({
    name: "numbers"
})
export default class PhoneNumber {
    @PrimaryGeneratedColumn()
    public id: number

    @Column()
    @IsString()
    public value: string

    @Column()
    @CreateDateColumn()
    public createdAt: Date

    @OneToMany(type => Code, code => code.phoneNumber)
    public codes: Code[]
}
