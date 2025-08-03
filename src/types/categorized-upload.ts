// File category types for the new categorized upload API
export enum FileCategory {
    PRENATAL_SCREENING = 'prenatal_screening',
    HEREDITARY_CANCER = 'hereditary_cancer',
    GENE_MUTATION = 'gene_mutation',
    GENERAL = 'general'
}

export interface FileCategoryDto {
    category: FileCategory
    priority?: number
    fileName: string
}

export interface OCRResultDto {
    fileIndex: number
    category: FileCategory
    ocrData?: any
    confidence?: number
}

export interface UploadCategorizedFilesDto {
    patientId: number
    typeLabSession: string
    fileCategories: FileCategoryDto[]
    ocrResults?: OCRResultDto[]
    labcode?: string[]
}

export interface CategorizedUploadResponse {
    success: boolean
    message: string
    data: {
        sessionId: number
        uploadedFilesCount: number
        processingOrder: number[]
        validationSummary: {
            isValid: boolean
            missingCategories: FileCategory[]
            summary: string
        }
        uploadedFiles: Array<{
            id: number
            fileName: string
            category: string
            priority: number
            fileSize: number
            s3Url: string
        }>
        sessionLabcodes: string[]
    }
}

// Enhanced submitted file type with categorization
export interface CategorizedSubmittedFile {
    id: string
    file: File
    uploadedAt: string
    status: 'uploaded' | 'completed' | 'failed'
    type: string
    ocrStatus: 'idle' | 'processing' | 'success' | 'failed'
    ocrResult?: any
    ocrError?: string
    // New categorization fields
    category: FileCategory
    priority: number
    isRequired?: boolean
}

export const FILE_CATEGORY_OPTIONS = [
    {
        value: FileCategory.PRENATAL_SCREENING,
        label: 'Sàng lọc tiền sản',
        description: 'Tài liệu sàng lọc tiền sản',
        priority: 9,
        isSpecial: true,
        color: 'blue'
    },
    {
        value: FileCategory.HEREDITARY_CANCER,
        label: 'Ung thư di truyền',
        description: 'Tài liệu sàng lọc ung thư di truyền',
        priority: 8,
        isSpecial: true,
        color: 'red'
    },
    {
        value: FileCategory.GENE_MUTATION,
        label: 'Đột biến gen',
        description: 'Tài liệu xét nghiệm đột biến gen',
        priority: 7,
        isSpecial: true,
        color: 'orange'
    },
    {
        value: FileCategory.GENERAL,
        label: 'Tài liệu chung',
        description: 'Tài liệu không yêu cầu xử lý OCR đặc biệt',
        priority: 5,
        isSpecial: false,
        color: 'gray'
    }
] as const

export const VALIDATION_RULES = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILES_PER_CATEGORY: 1,
    REQUIRED_SPECIAL_CATEGORIES: [
        FileCategory.PRENATAL_SCREENING,
        FileCategory.HEREDITARY_CANCER,
        FileCategory.GENE_MUTATION
    ],
    ALLOWED_FILE_TYPES: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
    ]
} as const
