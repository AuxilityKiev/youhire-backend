import "reflect-metadata"
import { Service, Inject } from "typedi"
import { InjectRepository } from "typeorm-typedi-extensions"
import { ChildProcess, fork } from "child_process"
import { Not } from "typeorm"

import User from "../../../db/entities/user"
import { UserType, MessageType } from "../../../common/enum"
import Job from "../../../db/entities/job"
import GmapsUtil from "../../../utils/gmaps.util"
import UserRepository from "../users/user.repository"
import JobRepository from "./job.repository"
import JobPushService from "./job-push.service"
import { JobProcessMessage } from "./job.dto"

@Service()
export default class JobProcessingService {
    @InjectRepository()
    private readonly userRepository: UserRepository

    @InjectRepository()
    private readonly jobRepository: JobRepository

    private readonly processes: Map<number, ChildProcess>

    constructor() {
        this.processes = new Map<number, ChildProcess>()
    }

    public async searchEarner(job: Job): Promise<void> {
        const searchProcess: ChildProcess = fork(`${__dirname}/job.process`)
        this.processes.set(searchProcess.pid, searchProcess)
        job.processId = searchProcess.pid
        await this.jobRepository.save(job)
        searchProcess.send({ job, type: MessageType.SEARCH_STARTED })
        searchProcess.on("message", async (message: JobProcessMessage) => {
            if (message.type === MessageType.SEARCH_IN_PROGRESS) {
                while (true) {
                    const earnersData: User[] = await this.getAllAvailableEarnersByJob(job)
                    if (!earnersData && !earnersData.length) {
                        continue
                    } else {
                        searchProcess.send({
                            job,
                            earnersData,
                            type: message.type
                        })
                        return
                    }
                }
            } else if (message.type === MessageType.ACCEPTED_CONFIRMED) {
                this.processes.delete(message.job.processId)
            }
        })
    }

    public getProcesses(): Map<number, ChildProcess> {
        return this.processes
    }

    private async getAllAvailableEarnersByJob(job: Job): Promise<User[]> {
        const availableEarners: User[] = (await this.userRepository.find({
            relations: [UserType.EARNER, `${UserType.EARNER}.job`, "phoneNumber", "gender", "avatar"]
        })).filter(user => {
            if (
                user.earner &&
                user.earner.subcategories &&
                user.earner.location &&
                user.earner.online &&
                user.earner.notifications &&
                !user.earner.job
            ) {
                return (
                    user.earner.subcategories.map(subCat => subCat.id).includes(job.subcategory.id) &&
                    GmapsUtil.getDistanceByCoordinates(job.location, user.earner.location) <= 1000
                )
            }
        })
        return availableEarners
    }
}
