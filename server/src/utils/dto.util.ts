import Certificate from "../db/entities/certificate"
import User from "../db/entities/user"
import ImageUtil from "./image.util"
import Job from "../db/entities/job"
import envConfig from "../config/env.config"
import Category from "../db/entities/category"
import Subcategory from "../db/entities/subcategory"
import { UserDTO, CategoryDTO, CertificateDTO, JobDTO, ExpenseDTO } from "../common/dto"
import { UserType, ImageType } from "../common/enum"
import Expense from "../db/entities/expense"

export default class DTOUtil {
    public static getUserDTO(user: User, type: string): UserDTO {
        if (!user) {
            return null
        }
        const userDTO: UserDTO = {
            id: user.id,
            type,
            phoneNumber: user.phoneNumber.value,
            firstName: user.firstName,
            lastName: user.lastName,
            age: user.age,
            email: user.email,
            birthDate: user.birthDate,
            city: user.city,
            aboutMe: user.aboutMe,
            online: user[type].online,
            avatar: user.avatar ? ImageUtil.getImageUrl(user.avatar) : null,
            gender: user.gender ? user.gender.type : null,
            notifications: user[type].notifications,
            registrationDate: user[type].registrationDate,
            tasks: user[type].tasks,
            rating: user[type].rating,
            jobHistory: user[type].jobHistory ? user[type].jobHistory.map(job => DTOUtil.getJobDTO(job)) : [],
            stripeAccount: user[type].stripeAccount
        }
        if (type === UserType.EARNER) {
            userDTO.amount = user[type].amount
            userDTO.location = user[type].location
            userDTO.category = user[type].subcategories.length ? DTOUtil.getCategoryDTO(user[type].subcategories) : null
            userDTO.achievements = user[type].achievements!.sort((ach1, ach2) => ach1.id - ach2.id)
            userDTO.certificates = user[type].certificates
                ? user[type].certificates.map(cert => DTOUtil.getCertificateDTO(cert))
                : []
        }
        return userDTO
    }

    public static getCategoryDTO(subcategories: Subcategory[]): CategoryDTO {
        const category: Category = subcategories[0].category
        return {
            id: category.id,
            name: category.name,
            subcategories: subcategories.map(subCat => {
                return {
                    id: subCat.id,
                    name: subCat.name,
                    minPrice: subCat.minPrice,
                    maxPrice: subCat.maxPrice,
                    icon: subCat.icon,
                    additions: subCat.additions
                }
            })
        } as CategoryDTO
    }

    public static getCertificateDTO(certificate: Certificate): CertificateDTO {
        if (!certificate) {
            return null
        }
        return {
            title: certificate.title,
            description: certificate.description,
            photos: certificate.photos.map(photo => ImageUtil.getImageUrl(photo))
        }
    }

    public static getJobDTO(job: Job): JobDTO {
        if (!job) {
            return null
        }
        return {
            id: job.id,
            title: job.title,
            address: job.location,
            price: job.price,
            status: job.status,
            createdAt: job.createdAt,
            startedAt: job.startedAt,
            finishedAt: job.finishedAt,
            timeToAccept: envConfig.TIME_TO_ACCEPT,
            averageExecutionTime: envConfig.AVERAGE_TIME_OF_EXECUTION,
            details: job.details,
            additionValues: job.additionValues,
            subcategory: job.subcategory,
            beforeStatus: job.photos
                ? job.photos
                      .filter(photo => photo.type === ImageType.BEFORE_JOB_STATUS)
                      .map(photo => ImageUtil.getImageUrl(photo))
                : [],
            afterStatus: job.photos
                ? job.photos
                      .filter(photo => photo.type === ImageType.AFTER_JOB_STATUS)
                      .map(photo => ImageUtil.getImageUrl(photo))
                : [],
            expenses: job.expenses ? job.expenses.map(exp => DTOUtil.getExpenseDTO(exp)) : [],
            serverTime: new Date()
        }
    }

    public static getExpenseDTO(expense: Expense): ExpenseDTO {
        if (!expense) {
            return null
        }
        return {
            comments: expense.comments,
            price: expense.price,
            photos: expense.photos.map(photo => ImageUtil.getImageUrl(photo))
        }
    }
}
