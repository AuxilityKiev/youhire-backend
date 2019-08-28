import { getManager, Repository } from "typeorm"

import User from "../entities/user"
import PhoneNumber from "../entities/phone-number"
import Code from "../entities/code"
import Spender from "../entities/spender"
import Image from "../entities/image"
import Host from "../entities/host"
import Gender from "../entities/gender"
import envConfig from "../../config/env.config";

const seedSpender = async (
    userRepository: Repository<User>,
    spenderRepository: Repository<Spender>,
    codeRepository: Repository<Code>,
    phoneNumberRepository: Repository<PhoneNumber>,
    genderRepository: Repository<Gender>,
    hostRepository: Repository<Host>,
    imageRepository: Repository<Image>
): Promise<void> => {
    const code = new Code()
    code.value = `000000`
    code.activatedAt = new Date()
    await codeRepository.save(code)

    const phoneNumber = new PhoneNumber()
    phoneNumber.codes = [code]
    phoneNumber.value = `+380500876906`
    await phoneNumberRepository.save(phoneNumber)

    const spender = new Spender()
    spender.rating = 3.23
    await spenderRepository.save(spender)

    const user = new User()
    user.firstName = `Nikolay`
    user.lastName = `Khramchenko`
    user.birthDate = new Date()
    user.email = `nickxpams@gmail.com`
    user.phoneNumber = phoneNumber
    user.numbersHistory = [phoneNumber]
    user.birthDate = new Date("1987-08-03T16:51:02.271Z")
    user.aboutMe = `Very cool man`
    user.age = 30
    user.city = "Kiev"
    user.phoneNumber = phoneNumber
    user.numbersHistory = [phoneNumber]
    user.gender = await genderRepository.findOne({ type: "male" })
    user.spender = spender
    const avatar = new Image(
        "szWARQ99dKbMTMC5Vr8X19n8JftQTBTt",
        new Host(`${envConfig.FILE_APP_HOST}:${envConfig.FILE_APP_PORT}`)
    )
    await imageRepository.save(avatar)
    user.avatar = avatar
    await userRepository.save(user)

    const code2 = new Code()
    code2.value = `000000`
    code2.activatedAt = new Date()
    await codeRepository.save(code2)

    const phoneNumber2 = new PhoneNumber()
    phoneNumber2.codes = [code2]
    phoneNumber2.value = `+380985949165`
    await phoneNumberRepository.save(phoneNumber2)

    const spender2 = new Spender()
    spender2.rating = 3.23
    await spenderRepository.save(spender2)

    const user2 = new User()
    user2.firstName = `Maksym`
    user2.lastName = `Volkov`
    user2.birthDate = new Date()
    user2.email = `maxvolkov.inc@gmail.com`
    user2.phoneNumber = phoneNumber2
    user2.numbersHistory = [phoneNumber2]
    user2.birthDate = new Date("1987-08-03T16:51:02.271Z")
    user2.aboutMe = `Very cool man`
    user2.age = 30
    user2.city = "Obukhiv"
    user2.gender = await genderRepository.findOne({ type: "male" })
    user2.spender = spender2
    const avatar2 = new Image(
        "szWARQ99dKbMTMC5Vr8X19n8JftQTBTt",
        new Host(`${envConfig.FILE_APP_HOST}:${envConfig.FILE_APP_PORT}`)
    )
    await imageRepository.save(avatar2)
    user2.avatar = avatar2
    await userRepository.save(user2)

    const code3 = new Code()
    code3.value = `000000`
    code3.activatedAt = new Date()
    await codeRepository.save(code3)

    const phoneNumber3 = new PhoneNumber()
    phoneNumber3.codes = [code3]
    phoneNumber3.value = `+380993713194`
    await phoneNumberRepository.save(phoneNumber3)

    const spender3 = new Spender()
    spender3.rating = 3.23
    await spenderRepository.save(spender3)

    const user3 = new User()
    user3.firstName = `Pasha`
    user3.lastName = `Privalov`
    user3.birthDate = new Date()
    user3.email = `privalov.pavlo@gmail.com`
    user3.phoneNumber = phoneNumber3
    user3.numbersHistory = [phoneNumber3]
    user3.birthDate = new Date("1987-08-03T16:51:02.271Z")
    user3.aboutMe = `Very cool man`
    user3.age = 22
    user3.city = "Kiev"
    user3.gender = await genderRepository.findOne({ type: "male" })
    user3.spender = spender3
    const avatar3 = new Image(
        "szWARQ99dKbMTMC5Vr8X19n8JftQTBTt",
        new Host(`${envConfig.FILE_APP_HOST}:${envConfig.FILE_APP_PORT}`)
    )
    await imageRepository.save(avatar3)
    user3.avatar = avatar3
    await userRepository.save(user3)
}

export const seedSpenders = async (): Promise<void> => {
    const userRepository: Repository<User> = getManager().getRepository(User)
    const spenderRepository: Repository<Spender> = getManager().getRepository(Spender)
    const codeRepository: Repository<Code> = getManager().getRepository(Code)
    const phoneNumberRepository: Repository<PhoneNumber> = getManager().getRepository(PhoneNumber)
    const genderRepository: Repository<Gender> = getManager().getRepository(Gender)
    const hostRepository: Repository<Host> = getManager().getRepository(Host)
    const imageRepository: Repository<Image> = getManager().getRepository(Image)
    if ((await spenderRepository.count()) === 0) {
        seedSpender(
            userRepository,
            spenderRepository,
            codeRepository,
            phoneNumberRepository,
            genderRepository,
            hostRepository,
            imageRepository
        )
    }
}
