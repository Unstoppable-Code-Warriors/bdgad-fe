import type { User } from './auth'

// User service types
export interface UserListResponse {
    users: User[]
    total: number
    page: number
    limit: number
}

export interface CreateUserRequest {
    email: string
    name: string
    role?: string
    status?: 'active' | 'inactive' | 'pending'
}

export interface UpdateUserRequest {
    name?: string
    email?: string
    status?: 'active' | 'inactive' | 'pending'
    roles?: string[]
}

export interface UserQueryParams {
    page?: number
    limit?: number
    search?: string
    role?: string
    status?: 'active' | 'inactive' | 'pending'
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface UserActivity {
    id: string
    action: string
    timestamp: string
    details?: Record<string, any>
}

export interface UserActivityResponse {
    activities: UserActivity[]
    total: number
}

// Re-export User type for convenience
export type { User }
