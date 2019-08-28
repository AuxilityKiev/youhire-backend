import { MessageType, UserType, JobStatus } from "../../../common/enum"
import PushService from "../../../utils/push.service"
import { JobProcessMessage } from "./job.dto"
import envConfig from "../../../config/env.config"

const sleep = (millis: number): Promise<number> => {
    return new Promise(resolve => setTimeout(resolve, millis))
}

process.on("message", async (message: JobProcessMessage) => {
    if (message.type === MessageType.SEARCH_STARTED) {
        process.send({ job: message.job, type: MessageType.SEARCH_IN_PROGRESS })
    } else if (message.type === MessageType.SEARCH_IN_PROGRESS) {
        for (const candidate of message.earnersData) {
            PushService.send(`${UserType.EARNER}_${candidate.id}`, {
                title: "One new job waiting for you!",
                body: `Someone has job "${message.job.title}" for you!`,
                payload: {
                    type: JobStatus.CREATED,
                    jobId: message.job.id.toString(),
                    responseTime: new Date()
                }
            })
            await sleep(envConfig.TIME_TO_ACCEPT)
        }
    } else if (message.type === MessageType.ACCEPTED) {
        process.send({ job: message.job, type: MessageType.ACCEPTED_CONFIRMED })
        process.exit(0)
    } else if (message.type === MessageType.REJECTED) {
        process.send({ job: message.job, type: MessageType.REJECTED_CONFIRMED })
    }
})
