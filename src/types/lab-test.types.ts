// Based on API documentation
export enum FastQFileStatus {
    UPLOADED = 'uploaded',
    WAIT_FOR_APPROVAL = 'wait_for_approval',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

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

export interface Doctor {}

export interface FastQFile {
    id: number
    filePath: string
    createdAt: string
    status: FastQFileStatus
    redoReason: string | null
    creator: {
        id: number
        name: string
        email: string
    }
    rejector?: {
        id: number
        name: string
        email: string
    }
}

export interface LabTestSession {
    id: number
    labcode: string[]
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
    UPLOADED: 'uploaded',
    WAIT_FOR_APPROVAL: 'wait_for_approval',
    APPROVED: 'approved',
    REJECTED: 'rejected'
} as const

export type LabTestStatus = (typeof LAB_TEST_STATUS)[keyof typeof LAB_TEST_STATUS]

export const statusConfig = {
    [LAB_TEST_STATUS.UPLOADED]: {
        label: 'Đã tải lên',
        color: 'orange'
    },
    [LAB_TEST_STATUS.WAIT_FOR_APPROVAL]: {
        label: 'Chờ phê duyệt',
        color: 'blue'
    },
    [LAB_TEST_STATUS.APPROVED]: {
        label: 'Đã phê duyệt',
        color: 'green'
    },
    [LAB_TEST_STATUS.REJECTED]: {
        label: 'Từ chối',
        color: 'red'
    }
} as const
