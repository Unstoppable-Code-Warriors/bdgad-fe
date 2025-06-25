// Based on API documentation
export interface LabTestFilter {
    status?: LabTestStatus
    requestDate?: {
        from?: string
        to?: string
    }
    [key: string]: any
}

export interface LabTestSearchParams {
    page?: number
    limit?: number
    search?: string
    filter?: LabTestFilter
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

export interface Patient {
    id: number
    fullName: string
    personalId: string
    dateOfBirth: string
    phone: string
    address: string
    healthInsuranceCode: string
    createdAt: string
}

export interface Doctor {
    id: number
    name: string
    email: string
    metadata: any
}

export interface FastQFile {
    id: number
    filePath: string
    createdAt: string
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected'
    redoReason: string | null
    creator: {
        id: number
        name: string
        email: string
    }
}

export interface LabTestSession {
    id: number
    labcode: string
    barcode: string
    requestDate: string
    createdAt: string
    metadata: any
    patient: Patient
    doctor: Doctor
    latestFastqFile: FastQFile
}

export interface LabTestResponse {
    data: LabTestSession[]
    meta: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
    success: boolean
    timestamp: string
}

// Status configuration
export const LAB_TEST_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    REDO: 'redo'
} as const

export type LabTestStatus = (typeof LAB_TEST_STATUS)[keyof typeof LAB_TEST_STATUS]

export const statusConfig = {
    [LAB_TEST_STATUS.PENDING]: {
        label: 'Chưa xử lý',
        color: 'orange'
    },
    [LAB_TEST_STATUS.PROCESSING]: {
        label: 'Đang xử lý',
        color: 'blue'
    },
    [LAB_TEST_STATUS.COMPLETED]: {
        label: 'Hoàn thành',
        color: 'green'
    },
    [LAB_TEST_STATUS.REDO]: {
        label: 'Làm lại',
        color: 'yellow'
    }
} as const
