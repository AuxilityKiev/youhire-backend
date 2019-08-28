import { Service, Inject } from "typedi"

import PushService from "../../../utils/push.service"
import { UserType, JobStatus } from "../../../common/enum"
import User from "../../../db/entities/user"
import Job from "../../../db/entities/job"

@Service()
export default class JobPushService {
    public async sendSearchPush(earnerData: User, job: Job): Promise<void> {
        return PushService.send(`${UserType.EARNER}_${earnerData.id}`, {
            title: "One new job waiting for you!",
            body: `Someone has job "${job.title}" for you!`,
            payload: {
                type: JobStatus.CREATED,
                jobId: job.id.toString(),
                responseTime: new Date()
            }
        })
    }

    public async sendAcceptJobPush(spenderData: User, job: Job): Promise<void> {
        await PushService.send(`${UserType.SPENDER}_${spenderData.id}`, {
            title: "Your job was accepted!!",
            body: `Your job ${job.title} was accepted by someone!`,
            payload: {
                type: JobStatus.ACCEPTED,
                jobId: job.id.toString(),
                responseTime: new Date()
            }
        })
    }

    public async sendRejectJobPush(earnerData: User, job: Job): Promise<void> {
        await PushService.send(`${UserType.EARNER}_${earnerData.id}`, {
            title: "Your job was rejected!",
            body: `Your job ${job.title} was rejected!`,
            payload: {
                type: JobStatus.REJECTED,
                jobId: job.id.toString(),
                responseTime: new Date()
            }
        })
    }

    public async sendStartJobPush(spenderData: User, job: Job): Promise<void> {
        await PushService.send(`${UserType.SPENDER}_${spenderData.id}`, {
            title: "Your job was started!",
            body: `Your job ${job.title} was started!`,
            payload: {
                type: JobStatus.IN_PROGRESS,
                jobId: job.id.toString(),
                responseTime: new Date()
            }
        })
    }

    public async sendFinishJobPush(spenderData: User, job: Job): Promise<void> {
        await PushService.send(`${UserType.SPENDER}_${spenderData.id}`, {
            title: "Your job was finished!",
            body: `Your job ${job.title} was finished!`,
            payload: {
                type: JobStatus.FINISHED,
                jobId: job.id.toString(),
                responseTime: new Date()
            }
        })
    }

    public async sendResultJobPush(spenderData: User, job: Job): Promise<void> {
        await PushService.send(`${UserType.SPENDER}_${spenderData.id}`, {
            title: "Your job was finished!",
            body: `Your job ${job.title} was finished!`,
            payload: {
                type: JobStatus.COMPLETED_UNPAID,
                jobId: job.id.toString(),
                responseTime: new Date()
            }
        })
    }

    public async sendConfirmJobPush(earnerData: User, job: Job): Promise<void> {
        await PushService.send(`${UserType.EARNER}_${earnerData.id}`, {
            title: "Your job was paid!",
            body: `Your job ${job.title} was paid!`,
            payload: {
                type: JobStatus.COMPLETED_PAID,
                jobId: job.id.toString(),
                responseTime: new Date()
            }
        })
    }
}
