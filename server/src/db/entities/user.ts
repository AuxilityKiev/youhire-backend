import {
    IsAlpha,
    IsEmail,
    IsInt,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
    IsOptional,
    IsDate,
    MaxDate
} from "class-validator"
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn, ManyToOne } from "typeorm"

import Earner from "./earner"
import Gender from "./gender"
import Image from "./image"
import PhoneNumber from "./phone-number"
import Spender from "./spender"

@Entity({
    name: "users"
})
export default class User {
    @PrimaryGeneratedColumn()
    public id: number

    @OneToOne(type => PhoneNumber)
    @JoinColumn()
    public phoneNumber: PhoneNumber

    @ManyToMany(type => PhoneNumber)
    @JoinTable()
    public numbersHistory: PhoneNumber[]

    @Column({
        nullable: true
    })
    @IsOptional()
    @MinLength(2)
    @MaxLength(64)
    public firstName: string

    @Column({
        nullable: true
    })
    @IsOptional()
    @MinLength(2)
    @MaxLength(64)
    public lastName: string

    @Column({
        nullable: true
    })
    @IsOptional()
    @IsInt()
    @Min(16)
    @Max(100)
    public age: number

    @Column({
        nullable: true
    })
    @IsOptional()
    @IsEmail()
    public email: string

    @Column({
        nullable: true
    })
    @IsOptional()
    @IsDate()
    public birthDate: Date

    @Column({
        nullable: true
    })
    @IsOptional()
    @IsAlpha()
    public city: string

    @Column({
        nullable: true
    })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(512)
    public aboutMe: string

    @OneToOne(type => Image)
    @JoinColumn()
    public avatar: Image

    @ManyToOne(type => Gender, gender => gender.users)
    public gender: Gender

    @OneToOne(type => Earner, {
        cascade: true
    })
    @JoinColumn()
    public earner: Earner

    @OneToOne(type => Spender, {
        cascade: true
    })
    @JoinColumn()
    public spender: Spender
}
