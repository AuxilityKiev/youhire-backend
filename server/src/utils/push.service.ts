import * as request from "request-promise-native"
import { Service } from "typedi"

import envConfig from "../config/env.config"
import logger from "../config/winston.user"

export default class PushService {
    public static async send(userId: string, info: any): Promise<void> {
        const options = {
            method: "POST",
            uri: `${this.pushServiceUrl}/${userId}/notifications`,
            json: true,
            body: info
        }
        try {
            return await request(options)
        } catch (err) {
            logger.error("push service send error", err.message)
            throw new Error(err.message)
        }
    }

    public static async register(userId: string, firebaseToken: string): Promise<void> {
        const options = {
            method: "POST",
            uri: `${this.pushServiceUrl}/${userId}/tokens`,
            json: true,
            body: {
                token: firebaseToken
            }
        }
        try {
            return await request(options)
        } catch (err) {
            logger.error(err.message)
            throw new Error(err.message)
        }
    }

    public static async unregister(userId: string, firebaseToken: string): Promise<void> {
        const options = {
            method: "DELETE",
            uri: `${this.pushServiceUrl}/${userId}/tokens/${firebaseToken}`,
            json: true
        }
        try {
            return await request(options)
        } catch (err) {
            logger.error(err.message)
            throw new Error(err.message)
        }
    }

    private static readonly pushServiceUrl: string = `http://${envConfig.PUSH_APP_HOST}:${
        envConfig.PUSH_APP_PORT
    }/api/users`
}
