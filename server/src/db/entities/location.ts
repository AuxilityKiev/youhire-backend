import { Column } from "typeorm"

export default class Location {
    @Column({ type: "float", nullable: true })
    public latitude: number

    @Column({ type: "float", nullable: true })
    public longitude: number

    constructor(latitude: number, longitude: number) {
        this.latitude = latitude
        this.longitude = longitude
    }
}
