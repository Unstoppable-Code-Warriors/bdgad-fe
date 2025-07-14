export interface BaseListResponse<T> {
    data: T[]
    meta: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
    success: boolean
    timestamp: string
}

// Auth types
export type {
    User,
    ApiResponse,
    LoginApiResponse,
    LoginRequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
} from './auth'

// API types
export type {
    ApiError,
    BaseApiResponse,
    PaginatedResponse,
    ApiResponseWithData,
    ListResponse,
    UploadResponse,
    HealthCheckResponse,
    TestOrder,
    OCRResult,
    UploadedFile,
    MedicalTestRequisitionUploadResponse
} from './api'

// Analysis types
export * from './analysis'

// FastQ types
export * from './fastq'

// Lab test types
export * from './lab-test'

// Notification types
export * from './notification'

// Patient types
export * from './patient'

// Validation types
export * from './validation'
