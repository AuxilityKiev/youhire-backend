import { Repository, getManager } from "typeorm"

import AdditionValue from "../entities/addition-value"
import AdditionType from "../entities/addition-type"
import Addition from "../entities/addition"
import Category from "../entities/category"
import Subcategory from "../entities/subcategory"
import { SUBCATEGORIES_ICONS } from "./icons"

enum AdditionTypeValue {
    CHECKBOX = "checkbox",
    SINGLE_CHOICE = "single choice"
}

const additionTypes: AdditionType[] = [
    new AdditionType(AdditionTypeValue.CHECKBOX),
    new AdditionType(AdditionTypeValue.SINGLE_CHOICE)
]

const ADDITION_VALUE_CLEANING: AdditionValue[] = [new AdditionValue("I want cleaner with supplies & tools", 0)]

const ADDITION_VALUE_SECURITY_GUARD: AdditionValue[] = [
    new AdditionValue("I want security guard in security uniform", 0),
    new AdditionValue("I want security guard in suit & tie", 1),
    new AdditionValue("I want security guard in plain clothing (undercover)", 2)
]

const ADDITION_VALUE_MAKE_UP_ARTIST: AdditionValue[] = [
    new AdditionValue("I want Make-Up Artist with supplies & tools", 0)
]

const ADDITION_VALUE_MASSOTHERAPIST: AdditionValue[] = [
    new AdditionValue("I want massotherapist with supplies", 0),
    new AdditionValue("I want massotherapist with massage portable table", 1)
]

export const seedAdditions = async (): Promise<void> => {
    const typeRepository: Repository<AdditionType> = getManager().getRepository(AdditionType)
    const valueRepository: Repository<AdditionValue> = getManager().getRepository(AdditionValue)
    const categoryRepository: Repository<Category> = getManager().getRepository(Category)
    const subcategoryRepository: Repository<Subcategory> = getManager().getRepository(Subcategory)
    const additionRepository: Repository<Addition> = getManager().getRepository(Addition)
    if ((await typeRepository.count()) === 0) {
        for (const type of additionTypes) {
            await typeRepository.save(type)
        }
    }
    if ((await valueRepository.count()) === 0) {
        await valueRepository.save(ADDITION_VALUE_CLEANING)
        await valueRepository.save(ADDITION_VALUE_SECURITY_GUARD)
        await valueRepository.save(ADDITION_VALUE_MAKE_UP_ARTIST)
        await valueRepository.save(ADDITION_VALUE_MASSOTHERAPIST)
    }
    if ((await additionRepository.count()) === 0) {
        const cleaningAddition = new Addition("Do you need cleaning tools?")
        const cleaningCategory: Category = await categoryRepository.findOne({ name: "Cleaning" })
        cleaningAddition.type = additionTypes[0]
        cleaningAddition.values = ADDITION_VALUE_CLEANING
        cleaningAddition.subcategories = await subcategoryRepository.find({ category: cleaningCategory })
        cleaningAddition.icon = SUBCATEGORIES_ICONS.find(icon => icon.name === "Yard").base64
        await additionRepository.save(cleaningAddition)

        const securityGuardAddition = new Addition("Do you need security guard of what type?")
        const securityGuardSubcategory: Subcategory = await subcategoryRepository.findOne({ name: "Security Guard" })
        securityGuardAddition.type = additionTypes[1]
        securityGuardAddition.values = ADDITION_VALUE_SECURITY_GUARD
        securityGuardAddition.subcategories = [securityGuardSubcategory]
        securityGuardAddition.icon = SUBCATEGORIES_ICONS.find(
            icon => icon.name === securityGuardSubcategory.name
        ).base64
        await additionRepository.save(securityGuardAddition)

        const makeUpArtistAddition = new Addition("Do you need make up?")
        const makeUpArtistSubcategory: Subcategory = await subcategoryRepository.findOne({ name: "Make-Up artist" })
        makeUpArtistAddition.type = additionTypes[0]
        makeUpArtistAddition.values = ADDITION_VALUE_MAKE_UP_ARTIST
        makeUpArtistAddition.subcategories = [makeUpArtistSubcategory]
        makeUpArtistAddition.icon = SUBCATEGORIES_ICONS.find(icon => icon.name === makeUpArtistSubcategory.name).base64
        await additionRepository.save(makeUpArtistAddition)

        const massotherapistAddition = new Addition("Do you need massotherapist?")
        const massotherapistSubcategory: Subcategory = await subcategoryRepository.findOne({
            name: "Massage Therapist"
        })
        massotherapistAddition.type = additionTypes[0]
        massotherapistAddition.values = ADDITION_VALUE_MASSOTHERAPIST
        massotherapistAddition.subcategories = [massotherapistSubcategory]
        massotherapistAddition.icon = SUBCATEGORIES_ICONS.find(
            icon => icon.name === massotherapistSubcategory.name
        ).base64
        await additionRepository.save(massotherapistAddition)
    }
}
