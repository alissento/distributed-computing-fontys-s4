export enum Role {
    USER = 'USER',
    ANALYST = 'ANALYST',
    ADMIN = 'ADMIN'
}

export const roleHierarchy: Record<Role, Role[]> = {
    [Role.USER]: [Role.USER],
    [Role.ANALYST]: [Role.USER, Role.ANALYST],
    [Role.ADMIN]: [Role.USER, Role.ANALYST, Role.ADMIN]
}

export type User = {
    id: string
    name: string
    email: string
    role: Role
}

export type RegisterRequest = {
    name: string
    email: string
    password: string
}
