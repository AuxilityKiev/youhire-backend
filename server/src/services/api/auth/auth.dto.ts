import { UserDTO } from "../../../common/dto"
import Category from "../../../db/entities/category"

interface SignInRequest {
    phoneNumber: string
}

interface SignInConfirmRequest {
    code: string
    phoneNumber: string
}

interface ProfileRequest {
    phoneNumber?: string
    firstName?: string
    lastName?: string
    birthDate?: string
    city?: string
    gender?: string
    email?: string
    age?: number
    aboutMe?: string
}

interface Profile {
    status: string
    token: string
    profile: UserDTO
}

export { SignInRequest, SignInConfirmRequest, ProfileRequest, Profile }
