import * as jwt from "jsonwebtoken"
import * as random from "randomstring"

import env from "../config/env.config"

export default class AuthUtil {
    public static generateToken(entity: any): string {
        return jwt.sign({ ...entity }, env.JWT_SECRET)
    }

    public static decodeToken(token: string): any {
        return jwt.decode(token)
    }

    public static generateVerificationCode(): string {
        return random.generate({
            length: env.CODE_LEN as number,
            charset: "numeric"
        })
    }

    public static getMessageWithCode(codeValue: string): string {
        return env.SMS_TEXT.replace(new RegExp("{{[\\s]*code[\\s]*}}", "g"), codeValue)
    }
}
