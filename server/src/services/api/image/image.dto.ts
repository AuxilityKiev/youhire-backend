import { ExpenseInfo } from "../job/job.dto"

interface ImageRequest {
    base64: string
}

interface ImageResponse {
    status: string
    message: string
    payload: {
        name: string
        ext: string
    }
}

interface CertificateRequest {
    title: string
    description: string
    host: string
    tokens: string[]
}

interface SubcategoryImageRequest {
    data: Array<{ base64: string; name: string }>
}

export { ImageRequest, ImageResponse, CertificateRequest, SubcategoryImageRequest }
