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

// Medical Test Requisition types
export interface TestOrder {
    test_name: string
    price: string
}

export interface OCRResult {
    test_orders: TestOrder[]
    hospital: string
    order_sheet: string
    clinic: string
    medical_record_id: string
    order_id: string
    full_name: string
    address: string
    gender: string
    age: number
    patient_type: string
    diagnosis: string
    exam_date: string
    ordering_doctor: string | null
    sample_time: string
    print_time: string
    technician: string
}

export interface UploadedFile {
    originalName: string
    filename: string
    path: string
    size: number
    mimetype: string
}

export interface MedicalTestRequisitionUploadResponse {
    success: boolean
    message: string
    file: UploadedFile
    storagePath: string
    ocrResult: OCRResult
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
