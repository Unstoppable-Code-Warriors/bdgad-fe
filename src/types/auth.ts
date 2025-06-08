// User interface based on the actual API response
export interface User {
    id: number
    email: string
    name: string
    roles: string[]
    status: 'active' | 'inactive' | 'pending'
    [key: string]: any
}

// API Response wrapper
export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

// Login API response (actual structure from the API)
export interface LoginApiResponse {
    success: boolean
    token: string
    user: User
}

// Auth service request/response types
export interface LoginRequest {
    email: string
    password: string
}

export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

export interface ForgotPasswordRequest {
    email: string
    redirectUrl: string
}

export interface ResetPasswordRequest {
    token: string
    newPassword: string
    confirmPassword: string
}
