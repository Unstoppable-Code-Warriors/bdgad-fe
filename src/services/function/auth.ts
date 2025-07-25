import { authUtils } from '@/utils/api'
import type {
    User,
    LoginApiResponse,
    LoginRequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
} from '@/types'
import type { ApiResponse, UpdateProfileRequest } from '@/types/auth'

const PREFIX = 'api/v1'

// Auth service functions
export const authService = {
    // Login user with email and password
    login: async (
        credentials: LoginRequest
    ): Promise<LoginApiResponse | { code: string; message: string; status: number }> => {
        return authUtils.post<LoginApiResponse | { code: string; message: string; status: number }>(
            `${PREFIX}/auth/login`,
            credentials
        )
    },

    // Initiate Google OAuth flow
    initiateGoogleOAuth: async (
        redirectAfterLogin: string
    ): Promise<{ data: { oauthUrl: string; state: string }; message: string }> => {
        return authUtils.post<{ data: { oauthUrl: string; state: string }; message: string }>(`${PREFIX}/auth/google`, {
            redirectAfterLogin
        })
    },

    // Get current user profile
    me: async (): Promise<ApiResponse<{ user: User }>> => {
        return authUtils.get<ApiResponse<{ user: User }>>(`${PREFIX}/auth/me`)
    },

    // Get users by role/code
    getUserByCode: async (code: number): Promise<ApiResponse<{ users: User[] }>> => {
        return authUtils.get<{ data: { users: User[] } }>(`${PREFIX}/auth/users?code=${code}`)
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<{ user: User }>> => {
        return authUtils.put<{ data: { user: User }; message: string }>(`${PREFIX}/auth/update-profile`, data)
    },

    // Change password
    changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse> => {
        return authUtils.put<ApiResponse>(`${PREFIX}/auth/change-password`, data)
    },

    // Request password reset
    forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse> => {
        return authUtils.post<ApiResponse>(`${PREFIX}/auth/forgot-password`, data)
    },

    // Reset password with token
    resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse> => {
        return authUtils.post<ApiResponse>(`${PREFIX}/auth/reset-password`, data)
    }
}
