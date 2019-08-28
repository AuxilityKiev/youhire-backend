import { EntityRepository, Repository } from "typeorm"

import Job from "../../../db/entities/job"
import Spender from "../../../db/entities/spender"
import Earner from "../../../db/entities/earner"
import { UserType, JobStatus } from "../../../common/enum"

@EntityRepository(Job)
export default class JobRepository extends Repository<Job> {
    public async findFullJobById(id: number): Promise<Job> {
        return this.findOne({ id }, { relations: [UserType.SPENDER, UserType.EARNER] })
    }

    public async findCreatedJobByCurrentSpender(spender: Spender): Promise<Job> {
        return this.findOne({ spender, status: JobStatus.CREATED }, { relations: [UserType.SPENDER] })
    }

    public async findAcceptedJobByCurrentSpender(spender: Spender): Promise<Job> {
        return this.findOne({ spender, status: JobStatus.ACCEPTED }, { relations: [UserType.SPENDER, UserType.EARNER] })
    }

    public async findJobByCurrentSpender(spender: Spender): Promise<Job> {
        return this.findOne({ spender }, { relations: [UserType.SPENDER, UserType.EARNER] })
    }

    public async findJobByCurrentEarner(earner: Earner): Promise<Job> {
        return this.findOne({ earner }, { relations: [UserType.EARNER, UserType.SPENDER] })
    }
}
