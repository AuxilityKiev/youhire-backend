import { Action } from "routing-controllers"
import AuthUtil from "../utils/auth.util"
import logger from "../config/winston.user"

export const currentUserChecker = async (action: Action) => {
    const token = action.request.headers.authorization.slice(7)
    return AuthUtil.decodeToken(token)
}
