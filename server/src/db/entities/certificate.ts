import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"

import Image from "./image"
import Earner from "./earner"

@Entity()
export default class Certificate {
    @PrimaryGeneratedColumn()
    public id: number

    @Column({
        nullable: true
    })
    public title: string

    @Column({
        nullable: true
    })
    public description: string

    @ManyToOne(type => Earner, earner => earner.certificates)
    public earner: Earner

    @OneToMany(type => Image, image => image.certificate, {
        eager: true
    })
    public photos: Image[]
}
