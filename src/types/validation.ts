export interface ValidationPatientResponse {
    id: number
    fullName: string
    dateOfBirth: string
    phone: string
    address: string
    citizenId: string
    createdAt: string
}

export interface ValidationDoctorResponse {
    id: number
    name: string
    email: string
    metadata: Record<string, any>
}
export interface ValidationAssign {
    id: number
    name: string
    email: string
}

export interface ValidationEtlResultResponse {
    id: number
    resultPath: string
    etlCompletedAt: string
    status: string | null
    redoReason: string | null
    comment: string
    fastqFilePairId: number
    fastqPair: {
        id: number
        createdAt: string
        status: string
    }
    rejector?: {
        id: number
        name: string
        email: string
    }
    commenter?: {
        id: number
        name: string
        email: string
    }
}

export interface ValidationSessionResponse {
    id: number
    labcode: string[]
    barcode: string
    requestDate: string
    createdAt: string
    metadata: Record<string, any>
    patient: ValidationPatientResponse
    doctor: ValidationDoctorResponse
}

export interface ValidationSessionWithLatestEtlResponse extends ValidationSessionResponse {
    latestEtlResult: ValidationEtlResultResponse | null
}

export interface ValidationSessionWithAllEtlResponse extends ValidationSessionResponse {
    latestEtlResult: ValidationEtlResultResponse | null
    etlResults: ValidationEtlResultResponse[]
}

export interface RejectEtlResultRequest {
    reason: string
}

export interface AcceptEtlResultRequest {
    comment?: string
}

export interface ValidationEtlResultDownloadResponse {
    downloadUrl: string
    expiresIn: number
    expiresAt: string
}

// Validation ETL Result status configurations
export enum ValidationEtlStatus {
    WAIT_FOR_APPROVAL = 'wait_for_approval',
    REJECTED = 'rejected',
    APPROVED = 'approved',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

export const validationEtlStatusConfig = {
    [ValidationEtlStatus.WAIT_FOR_APPROVAL]: {
        label: 'Chờ phê duyệt',
        color: 'orange'
    },
    [ValidationEtlStatus.REJECTED]: {
        label: 'Từ chối',
        color: 'red'
    },
    [ValidationEtlStatus.APPROVED]: {
        label: 'Đã phê duyệt',
        color: 'green'
    }
}

export interface ValidationFilter {
    status?: string
}
