import { Service } from "typedi"
import { InjectRepository } from "typeorm-typedi-extensions"

import Earner from "../../../db/entities/earner"
import Location from "../../../db/entities/location"
import EarnerRepository from "./earner.repository"
import UserRepository from "../users/user.repository"
import User from "../../../db/entities/user"
import DTOUtil from "../../../utils/dto.util"
import SubcategoryRepository from "../subcategory/subcategory.repository"
import { AuthUser } from "../../../common"
import { SubcategoriesDescriptor } from "./earner.dto"
import { UserDTO } from "../../../common/dto"
import { UserType } from "../../../common/enum"

@Service()
export default class EarnerService {
    @InjectRepository()
    private readonly userRepository: UserRepository

    @InjectRepository()
    private readonly earnerRepository: EarnerRepository

    @InjectRepository()
    private readonly subcategoryRepository: SubcategoryRepository

    public async getAllEarners(): Promise<Earner[]> {
        return this.earnerRepository.findAllEarners()
    }

    public async updateUserAsEarnerByCategory(
        currentUser: AuthUser,
        descriptor: SubcategoriesDescriptor
    ): Promise<UserDTO> {
        const user: User = await this.userRepository.findUserAsEarnerById(currentUser.id)
        if (descriptor) {
            user.earner.subcategories = await this.subcategoryRepository.findSubcategoriesByIdsWithCategory(
                descriptor.subcategoryIds
            )
        } else {
            user.earner.subcategories = []
        }
        await this.userRepository.save(user)
        return DTOUtil.getUserDTO(user, currentUser.type)
    }

    public async updateEarnerLocationByCoordinates(location: Location, currentUser: AuthUser): Promise<UserDTO> {
        const user: User = await this.userRepository.findUserAsEarnerById(currentUser.id)
        user.earner.location = location
        await this.userRepository.save(user)
        return DTOUtil.getUserDTO(user, UserType.EARNER)
    }
}
