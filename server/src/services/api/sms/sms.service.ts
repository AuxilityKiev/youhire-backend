import * as request from "request-promise-native"
import { Service } from "typedi"

import env from "../../../config/env.config"
import { SignInRequest } from "../auth/auth.dto"

@Service()
export default class SMSService {
    private readonly twillioAppUrl: string = `http://${env.SMS_APP_HOST}:${env.SMS_APP_PORT}/api`

    public async formatNumber(phoneNumber: string) {
        const res = await request.post({
            url: `${this.twillioAppUrl}/number/format`,
            body: { phoneNumber },
            json: true
        })
        return res.phoneNumber
    }

    public async sendSMS(signInRequest: SignInRequest, message: string) {
        return request.post({
            url: `${this.twillioAppUrl}/sms/send`,
            body: {
                ...signInRequest,
                text: message
            },
            json: true
        })
    }
}
