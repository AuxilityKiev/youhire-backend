import { Action, UnauthorizedError } from "routing-controllers"
import { Repository, getManager } from "typeorm"

import AuthUtil from "../utils/auth.util"
import User from "../db/entities/user"
import { AuthUser } from "../common"

export const authorizationChecker = async (action: Action, roles: string[]): Promise<boolean> => {
    const authorization: string = action.request.headers.authorization
    const repository: Repository<User> = getManager().getRepository(User)
    if (authorization) {
        const token: string = authorization.slice(7)
        const user: AuthUser = AuthUtil.decodeToken(token)
        if (user) {
            if (await repository.findOne({ id: user.id })) {
                return true
            } else {
                throw new UnauthorizedError("User is unauthorized")
            }
        } else {
            throw new UnauthorizedError("User is unauthorized")
        }
    }
    return false
}
