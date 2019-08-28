import { Authorized, Body, CurrentUser, Get, HttpCode, JsonController, Post, Param } from "routing-controllers"
import { Inject } from "typedi"

import { AuthUser } from "../../../common"
import { CreateJobRequest, ConfirmJobRequest, JobRequest } from "./job.dto"
import JobService from "./job.service"
import { JobDTO, UserDTO } from "../../../common/dto"
import envConfig from "../../../config/env.config"

@JsonController(`${envConfig.BASE_URL}/job`)
export class JobController {
    @Inject()
    private readonly jobService: JobService

    @Authorized("earner")
    @HttpCode(200)
    @Get("/earner")
    public async getJobByCurrentEarner(@CurrentUser({ required: true }) user: AuthUser): Promise<JobDTO> {
        return this.jobService.getJobByCurrentEarner(user)
    }

    @Authorized("spender")
    @HttpCode(200)
    @Get("/spender")
    public async getJobByCurrentSpender(@CurrentUser({ required: true }) user: AuthUser): Promise<JobDTO> {
        return this.jobService.getJobByCurrentSpender(user)
    }

    @Authorized()
    @HttpCode(200)
    @Get("/:id/info")
    public async getJobById(@Param("id") id: number): Promise<JobDTO> {
        return this.jobService.getJobById(id)
    }

    @Authorized()
    @HttpCode(201)
    @Post("/create")
    public async createJob(
        @CurrentUser({ required: true }) user: AuthUser,
        @Body() request: CreateJobRequest
    ): Promise<JobDTO> {
        return this.jobService.createJob(request, user)
    }

    @Authorized()
    @HttpCode(201)
    @Post("/:id/accept")
    public async acceptJob(@CurrentUser({ required: true }) user: AuthUser, @Param("id") id: number): Promise<JobDTO> {
        return this.jobService.acceptJob(user, id)
    }

    @Authorized()
    @HttpCode(200)
    @Post("/:id/earner/reject")
    public async rejectJobByEarner(
        @CurrentUser({ required: true }) user: AuthUser,
        @Param("id") id: number
    ): Promise<JobDTO> {
        return this.jobService.rejectJobByEarner(user, id)
    }

    @Authorized()
    @HttpCode(200)
    @Post("/:id/spender/reject")
    public async rejectJobBySpender(
        @CurrentUser({ required: true }) user: AuthUser,
        @Param("id") id: number
    ): Promise<{ message: string }> {
        return this.jobService.rejectJobBySpender(user, id)
    }

    @Authorized()
    @HttpCode(201)
    @Post("/:id/start")
    public async startJob(@CurrentUser({ required: true }) user: AuthUser, @Param("id") id: number): Promise<JobDTO> {
        return this.jobService.startJob(user, id)
    }

    @Authorized()
    @HttpCode(201)
    @Post("/:id/finish")
    public async finishJob(@CurrentUser({ required: true }) user: AuthUser, @Param("id") id: number): Promise<JobDTO> {
        return this.jobService.finishJob(user, id)
    }

    @Authorized()
    @HttpCode(201)
    @Post("/:id/result")
    public async resultJob(
        @CurrentUser({ required: true }) user: AuthUser,
        @Param("id") id: number,
        @Body() request: JobRequest
    ): Promise<JobDTO> {
        return this.jobService.resultJob(user, id, request)
    }

    @Authorized()
    @HttpCode(201)
    @Post("/:id/confirm")
    public async confirmJob(
        @CurrentUser({ required: true }) user: AuthUser,
        @Param("id") id: number,
        @Body() request: ConfirmJobRequest
    ): Promise<{ message: string }> {
        return this.jobService.confirmJob(user, id, request)
    }

    @Authorized()
    @HttpCode(201)
    @Post("/achievements")
    public async uploadAchievements(
        @CurrentUser({ required: true }) user: AuthUser,
        @Body() request: { achievementIds: number[] }
    ): Promise<UserDTO> {
        return this.jobService.uploadAchievements(user, request)
    }
}
