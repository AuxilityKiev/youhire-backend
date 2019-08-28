import { Service, Inject } from "typedi"
import { InjectRepository } from "typeorm-typedi-extensions"
import { HttpError, NotFoundError } from "routing-controllers"

import { AuthUser } from "../../../common"
import Job from "../../../db/entities/job"
import SpenderRepository from "../spender/spender.repository"
import { CreateJobRequest, ConfirmJobRequest, JobRequest } from "./job.dto"
import JobRepository from "./job.repository"
import DTOUtil from "../../../utils/dto.util"
import Spender from "../../../db/entities/spender"
import UserRepository from "../users/user.repository"
import EarnerRepository from "../earner/earner.repository"
import Earner from "../../../db/entities/earner"
import User from "../../../db/entities/user"
import GmapsUtil from "../../../utils/gmaps.util"
import envConfig from "../../../config/env.config"
import ImageService from "../image/image.service"
import AdditionValueRepository from "../addition/addition-value.repository"
import StripeService from "../stripe/stripe.service"
import Subcategory from "../../../db/entities/subcategory"
import SubcategoryRepository from "../subcategory/subcategory.repository"
import { JobDTO, UserDTO } from "../../../common/dto"
import { JobStatus, ImageType, UserType, MessageType } from "../../../common/enum"
import AchievementRepository from "../achievement/achievement.repository"
import JobPushService from "./job-push.service"
import { ChildProcess, fork } from "child_process"
import logger from "../../../config/winston.user"
import JobProcessingService from "./job-process.service"

@Service()
export default class JobService {
    @InjectRepository()
    private readonly userRepository: UserRepository

    @InjectRepository()
    private readonly jobRepository: JobRepository

    @InjectRepository()
    private readonly spenderRepository: SpenderRepository

    @InjectRepository()
    private readonly earnerRepository: EarnerRepository

    @InjectRepository()
    private readonly subcategoryRepository: SubcategoryRepository

    @InjectRepository()
    private readonly additionValuesRepository: AdditionValueRepository

    @InjectRepository()
    private readonly achievementRepository: AchievementRepository

    @Inject()
    private readonly jobProcessingService: JobProcessingService

    @Inject()
    private readonly jobPushService: JobPushService

    @Inject()
    private readonly imageService: ImageService

    @Inject()
    private readonly stripeService: StripeService

    public async createJob(createJobRequest: CreateJobRequest, user: AuthUser): Promise<JobDTO> {
        const userData: User = await this.userRepository.findUserAsSpenderById(user.id)
        if (userData.spender.stripeAccount) {
            if (userData.spender.job) {
                throw new HttpError(407, "Cannot create another job. You have already created it")
            }
            const subcategory: Subcategory = await this.subcategoryRepository.findOne(
                { id: createJobRequest.subcategory.id },
                { relations: ["category"] }
            )
            const job = new Job(
                createJobRequest.title,
                subcategory,
                createJobRequest.details,
                JobStatus.CREATED,
                createJobRequest.address
            )
            const similarJobs: Job[] = await this.jobRepository.find({ subcategory })
            job.spender = userData.spender
            job.price = this.generatePrice(subcategory)
            if (similarJobs.length > 1) {
                job.averageExecutionTime = Math.round(
                    similarJobs.map(j => j.finishedAt.getTime() - j.startedAt.getTime()).reduce((t1, t2) => t1 + t2) /
                        similarJobs.length
                )
            }
            if (createJobRequest.additionValues) {
                job.additionValues =
                    (await this.additionValuesRepository.findByIds(createJobRequest.additionValues)) || []
            }
            await this.jobRepository.save(job)
            this.jobProcessingService.searchEarner(job)
            if (createJobRequest.host && createJobRequest.beforeStatus) {
                return this.imageService.uploadImagesForJob(
                    userData,
                    user.type as UserType,
                    ImageType.BEFORE_JOB_STATUS,
                    job,
                    {
                        host: createJobRequest.host,
                        beforeStatus: createJobRequest.beforeStatus
                    }
                )
            }
            return {
                ...DTOUtil.getJobDTO(job),
                spender: DTOUtil.getUserDTO(userData, UserType.SPENDER)
            }
        } else {
            throw new HttpError(405, "Cannot create job without linked stripe account")
        }
    }

    public async acceptJob(user: AuthUser, jobId: number): Promise<JobDTO> {
        const earnerData: User = await this.userRepository.findUserAsEarnerById(user.id)
        const job: Job = await this.jobRepository.findOne({ id: jobId }, { relations: [UserType.SPENDER] })
        if (!job) {
            throw new NotFoundError("Job not found with index")
        }
        const spenderData: User = await this.userRepository.findOne(
            { spender: job.spender },
            { relations: ["phoneNumber", "gender", "avatar", UserType.SPENDER] }
        )
        job.status = JobStatus.ACCEPTED
        job.earner = earnerData.earner
        await this.jobRepository.save(job)
        if (spenderData.spender.notifications) {
            await this.jobPushService.sendAcceptJobPush(spenderData, job)
        }
        this.jobProcessingService
            .getProcesses()
            .get(job.processId)
            .send({ job, type: MessageType.ACCEPTED })
        return {
            ...DTOUtil.getJobDTO(job),
            earner: DTOUtil.getUserDTO(earnerData, UserType.EARNER),
            spender: DTOUtil.getUserDTO(spenderData, UserType.SPENDER)
        }
    }

    public async rejectJobByEarner(user: AuthUser, jobId: number): Promise<JobDTO> {
        const job: Job = await this.jobRepository.findOne({ id: jobId }, { relations: ["spender"] })
        if (!job) {
            throw new NotFoundError("Job not found with index")
        }
        this.jobProcessingService
            .getProcesses()
            .get(job.processId)
            .send({ job, type: MessageType.REJECTED })
        return DTOUtil.getJobDTO(job)
    }

    public async rejectJobBySpender(user: AuthUser, jobId: number): Promise<{ message: string }> {
        const job: Job = await this.jobRepository.findOne(
            { id: jobId },
            { relations: [UserType.SPENDER, UserType.EARNER] }
        )
        if (!job) {
            throw new NotFoundError("Job not found with index")
        }
        if (![JobStatus.CREATED, JobStatus.ACCEPTED].includes(job.status)) {
            throw new HttpError(410, `Cannot reject job with status "${job.status}"`)
        }
        if (job.earner) {
            if (job.status !== JobStatus.ACCEPTED) {
                throw new HttpError(406, `Cannot reject job which is in progress`)
            }
            const earnerData: User = await this.userRepository.findOne(
                { earner: job.earner },
                { relations: ["phoneNumber", "gender", "avatar", UserType.EARNER] }
            )
            job.status = JobStatus.REJECTED
            if (earnerData && earnerData.earner.notifications) {
                await this.jobPushService.sendRejectJobPush(earnerData, job)
            }
        }
        await this.jobRepository.delete({ id: jobId })
        return {
            message: `Your job "${job.title}" was cancelled!`
        }
    }

    public async startJob(user: AuthUser, jobId: number): Promise<JobDTO> {
        const earnerData: User = await this.userRepository.findUserAsEarnerById(user.id)
        const job: Job = await this.jobRepository.findOne({ id: jobId }, { relations: [UserType.SPENDER] })
        if (!job) {
            throw new HttpError(404, "Job not found with index")
        }
        job.status = JobStatus.IN_PROGRESS
        job.startedAt = new Date()
        await this.jobRepository.save(job)
        const spenderData: User = await this.userRepository.findOne(
            { spender: job.spender },
            { relations: ["phoneNumber", "gender", "avatar", UserType.SPENDER] }
        )
        if (spenderData.spender.notifications) {
            await this.jobPushService.sendStartJobPush(spenderData, job)
        }
        return {
            ...DTOUtil.getJobDTO(job),
            earner: DTOUtil.getUserDTO(earnerData, UserType.EARNER),
            spender: DTOUtil.getUserDTO(spenderData, UserType.SPENDER)
        }
    }

    public async finishJob(user: AuthUser, jobId: number): Promise<JobDTO> {
        const earnerData: User = await this.userRepository.findUserAsEarnerById(user.id)
        const job: Job = await this.jobRepository.findOne(
            { id: jobId },
            { relations: [UserType.EARNER, UserType.SPENDER] }
        )
        if (!job) {
            throw new HttpError(404, "Job not found with index")
        }
        job.status = JobStatus.FINISHED
        job.finishedAt = new Date()
        await this.jobRepository.save(job)
        const spenderData: User = await this.userRepository.findOne(
            { spender: job.spender },
            { relations: ["phoneNumber", "gender", "avatar", UserType.SPENDER] }
        )
        if (spenderData.spender.notifications) {
            await this.jobPushService.sendFinishJobPush(spenderData, job)
        }
        return {
            ...DTOUtil.getJobDTO(job),
            earner: DTOUtil.getUserDTO(earnerData, UserType.EARNER),
            spender: DTOUtil.getUserDTO(spenderData, UserType.SPENDER)
        }
    }

    public async resultJob(user: AuthUser, jobId: number, request: JobRequest): Promise<JobDTO> {
        const earnerData: User = await this.userRepository.findUserAsEarnerById(user.id)
        const job: Job = await this.jobRepository.findOne(
            { id: jobId },
            { relations: [UserType.EARNER, UserType.SPENDER] }
        )
        if (!job) {
            throw new NotFoundError("Job not found with index")
        }
        const spenderData: User = await this.userRepository.findOne(
            { spender: job.spender },
            { relations: ["phoneNumber", "gender", "avatar", UserType.SPENDER] }
        )
        const spender: Spender = spenderData.spender
        job.status = JobStatus.COMPLETED_UNPAID
        await this.jobRepository.save(job)
        spender.rating = (spender.rating * spender.tasks + request.rating) / (spender.tasks + 1)
        spender.tasks++
        await this.spenderRepository.save(spender)
        if (request.expenses) {
            await this.imageService.uploadExpenses(job, request.expenses)
        }
        if (request.host && request.afterStatus) {
            return this.imageService.uploadImagesForJob(
                earnerData,
                user.type as UserType,
                ImageType.AFTER_JOB_STATUS,
                job,
                {
                    host: request.host,
                    afterStatus: request.afterStatus
                }
            )
        }
        if (spender.notifications) {
            await this.jobPushService.sendResultJobPush(spenderData, job)
        }
        return {
            ...DTOUtil.getJobDTO(job),
            spender: DTOUtil.getUserDTO(spenderData, UserType.SPENDER)
        }
    }

    public async confirmJob(user: AuthUser, jobId: number, request: ConfirmJobRequest): Promise<{ message: string }> {
        const job: Job = await this.jobRepository.findOne({ id: jobId }, { relations: [UserType.EARNER] })
        if (!job) {
            throw new NotFoundError("Job not found with index")
        }
        const spenderData: User = await this.userRepository.findUserAsSpenderById(user.id)
        const earnerData: User = await this.userRepository.findOne(
            { earner: job.earner },
            {
                relations: ["phoneNumber", "gender", "avatar", `${UserType.EARNER}.stripeAccount`, UserType.EARNER]
            }
        )
        await this.handleAchievements(earnerData.earner, request.achievements)
        await this.createPayment(earnerData, spenderData, job, request)
        return {
            message: "Job was successfully paid"
        }
    }

    public async getJobById(jobId: number): Promise<JobDTO> {
        const job: Job = await this.jobRepository.findOne(
            { id: jobId },
            { relations: [UserType.EARNER, UserType.SPENDER] }
        )
        if (!job) {
            throw new NotFoundError("Job not found with index")
        }
        const spenderData: User = await this.userRepository.findOne(
            { spender: job.spender },
            {
                relations: ["phoneNumber", "gender", "avatar", `${UserType.SPENDER}`]
            }
        )
        const earnerData: User = job.earner
            ? await this.userRepository.findOne(
                  { earner: job.earner },
                  {
                      relations: ["phoneNumber", "gender", "avatar", `${UserType.EARNER}`]
                  }
              )
            : null
        return {
            ...DTOUtil.getJobDTO(job),
            spender: DTOUtil.getUserDTO(spenderData, UserType.SPENDER),
            earner: DTOUtil.getUserDTO(earnerData, UserType.EARNER)
        }
    }

    public async getJobByCurrentSpender(user: AuthUser): Promise<JobDTO> {
        const userSpender: User = await this.userRepository.findUserAsSpenderById(user.id)
        if (userSpender.spender.job) {
            const job: Job = await this.jobRepository.findFullJobById(userSpender.spender.job.id)
            const userEarner: User = job.earner
                ? await this.userRepository.findOne(
                      { earner: job.earner },
                      { relations: ["phoneNumber", "gender", "avatar", UserType.EARNER] }
                  )
                : null
            return {
                ...DTOUtil.getJobDTO(job),
                earner: DTOUtil.getUserDTO(userEarner, UserType.EARNER),
                spender: DTOUtil.getUserDTO(userSpender, UserType.SPENDER)
            }
        }
        throw new NotFoundError("Job not found for current user")
    }

    public async getJobByCurrentEarner(user: AuthUser): Promise<JobDTO> {
        const userEarner: User = await this.userRepository.findUserAsEarnerById(user.id)
        if (userEarner.earner.job) {
            const job: Job = await this.jobRepository.findFullJobById(userEarner.earner.job.id)
            const userSpender: User = await this.userRepository.findOne(
                { spender: job.spender },
                { relations: ["phoneNumber", "gender", "avatar", UserType.SPENDER] }
            )
            return {
                ...DTOUtil.getJobDTO(job),
                earner: DTOUtil.getUserDTO(userEarner, UserType.EARNER),
                spender: DTOUtil.getUserDTO(userSpender, UserType.SPENDER)
            }
        }
        throw new NotFoundError("Job not found for current user")
    }

    public async uploadAchievements(user: AuthUser, request: { achievementIds: number[] }): Promise<UserDTO> {
        const userData: User = await this.userRepository.findFullUserById(user.id, user.type as UserType)
        await this.handleAchievements(userData.earner, request.achievementIds)
        return DTOUtil.getUserDTO(await this.userRepository.findFullUserById(user.id, user.type as UserType), user.type)
    }

    // private async searchEarner(job: Job): Promise<void> {
    //     while (true) {
    //         const availableEarners: Earner[] = await this.getAllAvailableEarnersByJob(job)
    //         if (!availableEarners || !availableEarners.length) {
    //             continue
    //         }
    //         for (const candidate of availableEarners) {
    //             const earnerData: User = await this.userRepository.findOne({ earner: candidate })
    //             try {
    //                 await this.jobPushService.sendSearchPush(earnerData, job)
    //             } catch (err) {
    //                 continue
    //             }
    //             sleep(envConfig.TIME_TO_ACCEPT)
    //             const updatedJob: Job = await this.jobRepository.findOne({ id: job.id })
    //             if (updatedJob.status !== JobStatus.CREATED) {
    //                 // job.price = this.generatePrice(job.subcategory, availableEarners.length)
    //                 // await this.jobRepository.save(job)
    //                 return
    //             }
    //         }
    //         sleep(envConfig.TIME_TO_ACCEPT / 2)
    //     }
    // }

    private async getAllAvailableEarnersByJob(job: Job): Promise<Earner[]> {
        const availableEarners: Earner[] = (await this.earnerRepository.find({
            online: true,
            notifications: true,
            job: null
        })).filter(earner => {
            if (earner.subcategories && earner.location) {
                return (
                    earner.subcategories.map(subCat => subCat.id).includes(job.subcategory.id) &&
                    GmapsUtil.getDistanceByCoordinates(job.location, earner.location) <= 1000
                )
            }
        })
        return availableEarners
    }

    private async handleAchievements(earner: Earner, achievementIds: number[]): Promise<void> {
        for (const ach of earner.achievements) {
            if (achievementIds.includes(ach.type.id)) {
                ach.count++
                await this.achievementRepository.save(ach)
            }
        }
    }

    private async createPayment(
        earnerData: User,
        spenderData: User,
        job: Job,
        request: ConfirmJobRequest
    ): Promise<void> {
        const earner: Earner = earnerData.earner
        const spender: Spender = spenderData.spender
        job.status = JobStatus.COMPLETED_PAID
        earner.rating = (earner.rating * earner.tasks + request.rating) / (earner.tasks + 1)
        earner.tasks++
        if (!earner.jobHistory) {
            earner.jobHistory = [job]
        } else {
            earner.jobHistory.push(job)
        }
        if (request.tips >= 0 && request.tips <= 0.15) {
            let finalPrice: number =
                ((job.price + job.price * request.tips) * (job.finishedAt.getTime() - job.startedAt.getTime())) / 36e5
            if (finalPrice > 0 && finalPrice < 1) {
                finalPrice = 1
            }
            if (job.expenses && job.expenses.length > 0) {
                finalPrice += job.expenses.map(exp => exp.price).reduce((exp1, exp2) => exp1 + exp2)
            }
            await this.stripeService.chargeCard(
                spenderData,
                earnerData,
                Math.round(finalPrice * 100),
                Math.round(finalPrice * envConfig.COMMISSION * 100)
            )
            earner.amount = (await this.stripeService.getBalance(earnerData, UserType.EARNER)).amount / 100
            await this.unlinkJob(earner, spender, job)
            if (earner.notifications) {
                await this.jobPushService.sendConfirmJobPush(earnerData, job)
            }
        } else {
            throw new HttpError(408, "Wrong tips value was defined")
        }
    }

    private async unlinkJob(earner: Earner, spender: Spender, job: Job): Promise<void> {
        earner.job = null
        await this.earnerRepository.save(earner)
        if (!spender.jobHistory) {
            spender.jobHistory = [job]
        } else {
            spender.jobHistory.push(job)
        }
        spender.job = null
        await this.spenderRepository.save(spender)
        job.earner = null
        job.spender = null
        await this.jobRepository.save(job)
    }

    private generatePrice(subcategory: Subcategory, earnersCount: number = 0): number {
        const time: number = new Date().getHours()
        const coefficient: number = time >= 21 && time <= 7 ? 2 : earnersCount <= 10 ? 1.3 : 1
        return Math.round(
            ((Math.random() * (subcategory.maxPrice - subcategory.minPrice) + subcategory.minPrice) *
                100 *
                coefficient) /
                100
        )
    }
}
