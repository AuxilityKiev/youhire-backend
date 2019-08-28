import { Service } from "typedi"
import { InjectRepository } from "typeorm-typedi-extensions"
import { HttpError } from "routing-controllers"
import { In } from "typeorm"
import * as request from "request-promise-native"

import UserRepository from "../users/user.repository"
import User from "../../../db/entities/user"
import Certificate from "../../../db/entities/certificate"
import env from "../../../config/env.config"
import { CertificateRequest, ImageRequest, ImageResponse } from "./image.dto"
import Image from "../../../db/entities/image"
import ImageRepository from "./image.repository"
import HostRepository from "../host/host.repository"
import CertificateRepository from "../certificate/certificate.repository"
import JobRepository from "../job/job.repository"
import { AuthUser } from "../../../common"
import DTOUtil from "../../../utils/dto.util"
import logger from "../../../config/winston.user"
import Earner from "../../../db/entities/earner"
import Job from "../../../db/entities/job"
import { UserDTO, JobDTO } from "../../../common/dto"
import { ImageType, UserType, JobStatus } from "../../../common/enum"
import { ExpenseInfo, JobRequest } from "../job/job.dto"
import Expense from "../../../db/entities/expense"
import ExpenseRepository from "../expense/expense.repository"
import Host from "../../../db/entities/host";

@Service()
export default class ImageService {
    @InjectRepository()
    private readonly imageRepository: ImageRepository

    @InjectRepository()
    private readonly hostRepository: HostRepository

    @InjectRepository()
    private readonly userRepository: UserRepository

    @InjectRepository()
    private readonly certificateRepository: CertificateRepository

    @InjectRepository()
    private readonly expenseRepository: ExpenseRepository

    @InjectRepository()
    private readonly jobRepository: JobRepository

    private readonly fileServiceUrl: string = `${env.FILE_APP_HOST}`

    public async uploadImageAsAvatar(user: AuthUser, base64String: string): Promise<UserDTO> {
        const userData: User = await this.userRepository.findFullUserById(user.id, user.type as UserType)
        const host = await this.hostRepository.findOne( {}) // find host to upload img
        const response = await this.uploadImage({ base64: base64String }, host)
        const avatar = new Image(
            response.payload.name,
            host
        )
        avatar.type = ImageType.AVATAR
        await this.imageRepository.save(avatar)
        userData.avatar = avatar
        logger.info(`Avatar for user [${user.id}, ${user.type}] was uploaded`)
        return DTOUtil.getUserDTO(await this.userRepository.save(userData), user.type)
    }

    public async uploadImagesAsCertificate(user: AuthUser, certRequest: CertificateRequest): Promise<UserDTO> {
        const userData: User = await this.userRepository.findUserAsEarnerById(user.id)
        const certificate = new Certificate()
        certificate.title = certRequest.title
        certificate.description = certRequest.description
        await this.certificateRepository.save(certificate)
        for (const token of certRequest.tokens) {
            const photo = new Image(token, await this.hostRepository.findOne({ name: certRequest.host }))
            photo.certificate = certificate
            photo.type = ImageType.CERTIFICATE
            userData.earner.certificates.push(certificate)
            await this.imageRepository.save(photo)
        }
        await this.userRepository.save(userData)
        logger.info(`Certificate for user [${user.id}, ${user.type}] was uploaded`)
        return DTOUtil.getUserDTO(
            {
                ...userData,
                earner: {
                    ...userData.earner,
                    certificates: await this.certificateRepository.findAllCertificatesByEarner(userData.earner)
                } as Earner
            } as User,
            user.type
        )
    }

    public async uploadImagesForJob(
        user: User,
        userType: UserType,
        imageType: ImageType,
        job: Job,
        jobRequest: JobRequest
    ): Promise<JobDTO> {
        if (
            (userType === UserType.SPENDER && imageType === ImageType.BEFORE_JOB_STATUS) ||
            (userType === UserType.EARNER && imageType === ImageType.AFTER_JOB_STATUS)
        ) {
            const photos: Image[] = []
            if (job) {
                for (const photoId of jobRequest[imageType]) {
                    const photo = new Image(photoId, await this.hostRepository.findOne({ name: jobRequest.host }))
                    photo.job = job
                    photo.type = imageType
                    photos.push(photo)
                    await this.imageRepository.save(photo)
                }
            }
            return DTOUtil.getJobDTO({
                ...job,
                [userType]: DTOUtil.getUserDTO(user, userType),
                photos
            })
        } else {
            throw new HttpError(402, `User with role "${userType}" cannot upload photos of type "${imageType}"`)
        }
    }

    public async uploadExpenses(job: Job, expenses: ExpenseInfo[]): Promise<void> {
        for (const exp of expenses) {
            const expense = new Expense()
            expense.price = exp.price
            expense.comments = exp.comments
            expense.job = job
            await this.expenseRepository.save(expense)
            for (const photoId of exp.tokens) {
                const photo = new Image(photoId, await this.hostRepository.findOne({ name: exp.host }))
                photo.expense = expense
                photo.type = ImageType.ADDITIONAL
                await this.imageRepository.save(photo)
            }
        }
    }

    private async uploadImage(imgRequest: ImageRequest, host: Host): Promise<ImageResponse> {
        return request.post({
            url: `${host.name}/api/images`,
            body: imgRequest,
            json: true
        })
    }
}
