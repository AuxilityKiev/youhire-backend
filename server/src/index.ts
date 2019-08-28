import env from "./config/env.config"
import logger from "./config/winston.user"
import dbConfig from "./config/db.config.dev"
import { DB } from "./db"
import server from "./server"

// START SERVER
server.listen(
    env.PORT,
    (): void => {
        logger.info(`HTTP Server listening on port: ${env.PORT}`)
        logger.info(`Environment: ${env.NODE_ENV}`)
    }
)

// CONNECT TO DB
export const database = new DB(dbConfig)
    .seed()
    .then(_ => logger.info(`DB '${env.PG_DB}' connected successfully`))
    .catch(err => {
        logger.error(`DB '${env.PG_DB}' connection failed`, err)
        process.exit(-1)
    });
