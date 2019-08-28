import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"

import Image from "./image"

@Entity()
export default class Host {
    @PrimaryGeneratedColumn()
    public id: number

    @Column()
    public name: string

    @OneToMany(type => Image, image => image.host)
    public images: Image[]

    constructor(name: string) {
        this.name = name
    }
}
