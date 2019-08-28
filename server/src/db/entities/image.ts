import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import Host from "./host"

import Certificate from "./certificate"
import Job from "./job"
import Expense from "./expense"

@Entity()
export default class Image {
    @PrimaryGeneratedColumn()
    public id: number

    @Column()
    public token: string

    @ManyToOne(type => Host, host => host.images, {
        eager: true
    })
    public host: Host

    @Column({ nullable: true })
    public type: string

    @ManyToOne(type => Certificate, certificate => certificate.photos)
    public certificate: Certificate

    @ManyToOne(type => Expense, expense => expense.photos)
    public expense: Expense

    @ManyToOne(type => Job, job => job.photos, {
        onDelete: "CASCADE"
    })
    public job: Job

    constructor(token: string, host: Host) {
        this.token = token
        this.host = host
    }
}
