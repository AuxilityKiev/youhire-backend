import { path } from "app-root-path"
import { Logger, LoggerInstance, LoggerOptions, transports } from "winston"

const options: LoggerOptions = {
    error: {
        name: "error-file",
        level: "error",
        filename: `${path}/logs/error.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: true
    },
    info: {
        name: "info-file",
        level: "info",
        filename: `${path}/logs/info.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: true
    },
    console: {
        level: "debug",
        handleExceptions: true,
        json: false,
        colorize: true
    }
}

const logger: LoggerInstance = new Logger({
    transports: [
        new transports.File(options.error),
        new transports.File(options.info),
        new transports.Console(options.console)
    ],
    exitOnError: false
})

export default logger
