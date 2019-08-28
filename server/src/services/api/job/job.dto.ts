import Location from "../../../db/entities/location"
import Job from "../../../db/entities/job"
import { MessageType } from "../../../common/enum"
import User from "../../../db/entities/user"

interface JobRequest {
    host: string
    rating?: number
    beforeStatus?: string[]
    afterStatus?: string[]
    expenses?: ExpenseInfo[]
}

interface CreateJobRequest {
    address: Location
    subcategory: { id: number }
    details: string
    title: string
    additionValues?: number[]
    host?: string
    beforeStatus?: string[]
}

interface ConfirmJobRequest {
    rating: number
    achievements: number[]
    tips: number
}

interface ExpenseInfo {
    comments: string
    host: string
    tokens: string[]
    price: number
}
interface FirebaseJobRequest {
    firebaseId: string
    job: Job
}

interface PaymentRequest {
    tips: number
}

interface JobProcessMessage {
    job: Job
    type: MessageType
    earnersData?: User[]
}

export {
    ExpenseInfo,
    JobRequest,
    CreateJobRequest,
    ConfirmJobRequest,
    FirebaseJobRequest,
    PaymentRequest,
    JobProcessMessage
}
