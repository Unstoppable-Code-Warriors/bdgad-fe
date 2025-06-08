// General API types
export interface ApiError {
    name: string
    message: string
    status?: number
    code?: string
}

// Common API response structure
export interface BaseApiResponse {
    success: boolean
    message?: string
    error?: string
}

// Paginated response structure
export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}

// Generic API response with data
export interface ApiResponseWithData<T> extends BaseApiResponse {
    data: T
}

// Generic list response
export interface ListResponse<T> extends BaseApiResponse {
    data: T[]
    pagination?: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

// Upload response
export interface UploadResponse {
    success: boolean
    url: string
    filename: string
    size: number
    mimetype: string
}

// Health check response
export interface HealthCheckResponse {
    status: 'ok' | 'error'
    timestamp: string
    version?: string
    uptime?: number
}
