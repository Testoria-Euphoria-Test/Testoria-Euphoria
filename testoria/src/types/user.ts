export interface UserType {
    _id: string
    name: string
    email: string
    password: string
    role: 'admin' | 'customer' | 'creator'
    createdAt: string
    updatedAt: string
}