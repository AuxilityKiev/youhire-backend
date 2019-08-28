interface AuthUser {
    id: number
    phoneNumber: string
    type: string
    iat?: number
}

export { AuthUser }
