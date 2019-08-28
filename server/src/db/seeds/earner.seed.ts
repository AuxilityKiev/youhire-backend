import { getManager, Repository } from "typeorm"

import Earner from "../entities/earner"
import User from "../entities/user"
import Gender from "../entities/gender"
import PhoneNumber from "../entities/phone-number"
import Code from "../entities/code"
import Image from "../entities/image"
import Host from "../entities/host"
import Subcategory from "../entities/subcategory"
import AchievementType from "../entities/achievement-type"
import Achievement from "../entities/achievement"
import envConfig from "../../config/env.config"

const seedEarner = async (
    userRepository: Repository<User>,
    earnerRepository: Repository<Earner>,
    codeRepository: Repository<Code>,
    phoneNumberRepository: Repository<PhoneNumber>,
    genderRepository: Repository<Gender>,
    subcategoryRepository: Repository<Subcategory>,
    index: number
): Promise<void> => {
    const code = new Code()
    code.value = `00000${index}`
    await codeRepository.save(code)

    const phoneNumber = new PhoneNumber()
    phoneNumber.codes = [code]
    phoneNumber.value = `+38066666666${index}`
    await phoneNumberRepository.save(phoneNumber)

    const earner = new Earner()
    earner.rating = Math.round(Math.random() * 5 * 100) / 100
    earner.subcategories = await subcategoryRepository.findByIds([4, 5], { relations: ["category"] })
    earner.location = {
        latitude: 40.74866558,
        longitude: -74.13682702
    }
    earner.online = true
    earner.notifications = true
    await earnerRepository.save(earner)

    const user = new User()
    user.firstName = `John${index}`
    user.lastName = `Smith${index}`
    user.birthDate = new Date()
    user.email = `john${index}@gmail.com`
    user.aboutMe = `About me: ${index}`
    user.age = 35
    user.city = "London"
    user.phoneNumber = phoneNumber
    user.numbersHistory = [phoneNumber]
    user.gender = await genderRepository.findOne({ type: "male" })
    user.earner = earner
    await userRepository.save(user)
}

export const seedRealEarner = async (): Promise<void> => {
    const userRepository: Repository<User> = getManager().getRepository(User)
    const earnerRepository: Repository<Earner> = getManager().getRepository(Earner)
    const codeRepository: Repository<Code> = getManager().getRepository(Code)
    const phoneNumberRepository: Repository<PhoneNumber> = getManager().getRepository(PhoneNumber)
    const genderRepository: Repository<Gender> = getManager().getRepository(Gender)
    const subcategoryRepository: Repository<Subcategory> = getManager().getRepository(Subcategory)
    const hostRepository: Repository<Host> = getManager().getRepository(Host)
    const imageRepository: Repository<Image> = getManager().getRepository(Image)
    const achievementTypeRepository: Repository<AchievementType> = getManager().getRepository(AchievementType)
    const achievementRepository: Repository<Achievement> = getManager().getRepository(Achievement)
    const code = new Code()
    code.value = `000000`
    await codeRepository.save(code)

    const phoneNumber = new PhoneNumber()
    phoneNumber.codes = [code]
    phoneNumber.value = `+380999999999`
    await phoneNumberRepository.save(phoneNumber)
    const achievementTypes: AchievementType[] = await achievementTypeRepository.find()
    const achievements: Achievement[] = achievementTypes.map(type => new Achievement(type))
    for (const achievement of achievements) {
        await achievementRepository.save(achievement)
    }
    const earner = new Earner()
    earner.rating = 4.23
    earner.subcategories = await subcategoryRepository.findByIds([4, 5], { relations: ["category"] })
    earner.location = {
        latitude: 50.4623707,
        longitude: -30.495332
    }
    earner.notifications = false
    earner.online = false
    earner.achievements = achievements
    await earnerRepository.save(earner)

    const user = new User()
    user.firstName = `Artem`
    user.lastName = `Sisetskiy`
    user.birthDate = new Date("1987-08-03T16:51:02.271Z")
    user.email = `artem@gmail.com`
    user.aboutMe = `Very cool man`
    user.age = 22
    user.city = "Kiev"
    user.phoneNumber = phoneNumber
    user.numbersHistory = [phoneNumber]
    user.gender = await genderRepository.findOne({ type: "male" })
    user.earner = earner
    const avatar = new Image(
        "szWARQ99dKbMTMC5Vr8X19n8JftQTBTt",
        new Host(`${envConfig.FILE_APP_HOST}:${envConfig.FILE_APP_PORT}`)
    )
    await imageRepository.save(avatar)
    user.avatar = avatar
    await userRepository.save(user)
}

export const seedEarners = async (): Promise<void> => {
    const userRepository: Repository<User> = getManager().getRepository(User)
    const earnerRepository: Repository<Earner> = getManager().getRepository(Earner)
    const codeRepository: Repository<Code> = getManager().getRepository(Code)
    const phoneNumberRepository: Repository<PhoneNumber> = getManager().getRepository(PhoneNumber)
    const genderRepository: Repository<Gender> = getManager().getRepository(Gender)
    const subcategoryRepository: Repository<Subcategory> = getManager().getRepository(Subcategory)
    if ((await earnerRepository.count()) === 0) {
        for (let i = 0; i < 10; i++) {
            seedEarner(
                userRepository,
                earnerRepository,
                codeRepository,
                phoneNumberRepository,
                genderRepository,
                subcategoryRepository,
                i
            )
        }
    }
}
