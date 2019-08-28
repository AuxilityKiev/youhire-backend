import Container from "typedi"
import { Connection, ConnectionOptions, createConnection, useContainer } from "typeorm"

import { seed } from "./seeds"

export class DB {
    private readonly configuration: ConnectionOptions
    private connection: Connection | null
    constructor(configuration: ConnectionOptions) {
        this.configuration = configuration
        this.connection = null
    }
    public async connect(): Promise<DB> {
        if (this.connection) {
            return this
        }
        useContainer(Container)
        this.connection = await createConnection(this.configuration)
        return this
    }
    public async runMigrations(): Promise<DB> {
        await this.connect()
        await this.connection.runMigrations()
        return this
    }
    public async dropDatabase(): Promise<DB> {
        await this.connect()
        await this.connection.dropDatabase()
        return this
    }
    public async seed(): Promise<DB> {
        await this.connect()
        await seed()
        return this
    }
    public async connectAndMigrate(): Promise<DB> {
        await this.connect()
        await this.runMigrations()
        await this.seed()
        return this
    }
}
