import Subcategory from "../db/entities/subcategory"
import StripeAccount from "../db/entities/stripe-account"
import { JobStatus } from "./enum"
import Location from "../db/entities/location"
import Achievement from "../db/entities/achievement"
import AdditionValue from "../db/entities/addition-value"

interface CertificateDTO {
    title: string
    description: string
    photos: string[]
}

interface ExpenseDTO {
    comments: string
    price: number
    photos: string[]
}

interface CategoryDTO {
    id: number
    name: string
    subcategories: Subcategory[]
}

interface UserDTO {
    id: number
    type: string
    phoneNumber: string
    firstName: string
    lastName: string
    age: number
    email: string
    birthDate: Date
    avatar: string
    city: string
    gender: string
    notifications: boolean
    registrationDate: Date
    rating: number
    amount?: number
    location?: Location
    aboutMe?: string
    certificates?: CertificateDTO[]
    achievements?: Achievement[]
    category?: CategoryDTO
    stripeAccount?: StripeAccount
    jobHistory?: JobDTO[]
    tasks?: number
    online?: boolean
}

interface JobDTO {
    id: number
    title: string
    address: Location
    price: number
    status: JobStatus
    subcategory: Subcategory
    timeToAccept: number
    averageExecutionTime: number
    createdAt: Date
    serverTime: Date
    additionValues?: AdditionValue[]
    startedAt?: Date
    finishedAt?: Date
    spender?: UserDTO
    earner?: UserDTO
    details?: string
    expenses?: ExpenseDTO[]
    beforeStatus?: string[]
    afterStatus?: string[]
}

export { CertificateDTO, CategoryDTO, JobDTO, ExpenseDTO, UserDTO }
