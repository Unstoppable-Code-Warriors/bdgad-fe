import { authUtils } from '@/utils/api'
import type {
    User,
    LoginApiResponse,
    LoginRequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
} from '@/types'

const PREFIX = 'api/v1'

// Auth service functions
export const authService = {
    // Login user with email and password
    login: async (credentials: LoginRequest): Promise<LoginApiResponse> => {
        return authUtils.post<LoginApiResponse>(`${PREFIX}/auth/login`, credentials)
    },

    // Get current user profile
    me: async (): Promise<{ success: boolean; user: User }> => {
        return authUtils.get<{ success: boolean; user: User }>(`${PREFIX}/auth/me`)
    },

    // Change password
    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
        return authUtils.post<void>(`${PREFIX}/auth/change-password`, data)
    },

    // Request password reset
    forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
        return authUtils.post<void>(`${PREFIX}/auth/forgot-password`, data)
    },

    // Reset password with token
    resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
        return authUtils.post<void>(`${PREFIX}/auth/reset-password`, data)
    }
}
