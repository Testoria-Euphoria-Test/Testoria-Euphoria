export interface UserType {
    _id: string
    name: string
    email: string
    password: string
    role: 'admin' | 'customer' | 'creator'
    balance?: number // Balance for creators, optional for backward compatibility
    createdAt: string
    updatedAt: string
}