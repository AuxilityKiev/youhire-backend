import { Service } from "typedi"
import { InjectRepository } from "typeorm-typedi-extensions"

import User from "../../../db/entities/user"
import UserRepository from "./user.repository"

@Service()
export default class UserService {
    @InjectRepository()
    private readonly userRepository: UserRepository

    public async getAllUsers(): Promise<User[]> {
        return this.userRepository.findAllFullUsers()
    }

    public async clearUsers(): Promise<void> {
        return this.userRepository.clear()
    }
}
