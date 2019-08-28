import envConfig from "./env.config"
import * as path from "path"
import { ConnectionOptions } from "typeorm"

const appDir: string = path.join(__dirname, "..")

export default {
    type: "postgres",
    host: envConfig.PG_HOST,
    port: envConfig.PG_PORT,
    username: envConfig.PG_USER,
    password: envConfig.PG_PASSWORD,
    database: envConfig.PG_DB,
    synchronize: true,
    logging: false,
    entities: [`${appDir}/db/entities/*`],
    migrations: [`${appDir}/db/migrations/*`],
    subscribers: [`${appDir}/db/subscribers/*`],
    cli: {
        entitiesDir: `${appDir}/db/entities`,
        migrationsDir: `${appDir}/db/migrations`,
        subscribersDir: `${appDir}/db/subscribers`
    }
} as ConnectionOptions
