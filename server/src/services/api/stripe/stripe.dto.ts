interface StripeRequest {
    token: string
    ip: string
}

interface PayoutRequest {
    token: string
    amount: number
    currency?: string
}

interface Balance {
    amount: number
    currency: string
}

export { Balance, StripeRequest, PayoutRequest }
