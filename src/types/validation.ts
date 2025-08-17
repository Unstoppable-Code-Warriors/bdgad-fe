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
    fastqFilePairId: number
    htmlResult: string | null
    excelResult: string | null
    startTime: string | null
    etlCompletedAt: string | null
    status: string | null
    reasonReject: string | null
    reasonApprove: string | null
    fastqPair: {
        id: number
        createdAt: string
        status: string
    }
    rejector?: {
        id: number
        name: string
        email: string
    } | null
    approver?: {
        id: number
        name: string
        email: string
    } | null
}

export interface ValidationSessionResponse {
    id: number
    labcode: string[]
    barcode: string
    requestDateValidation: string
    createdAt: string
    metadata: Record<string, any>
    patient: ValidationPatientResponse
    doctor: ValidationDoctorResponse
}

export interface ValidationSessionWithLatestEtlResponse extends ValidationSessionResponse {
    etlResults: ValidationEtlResultResponse[]
    latestEtlResult: {
        id: number
        fastqFilePairId: number
        htmlResult: string | null
        excelResult: string | null
        startTime: string | null
        etlCompletedAt: string | null
        status: string | null
        reasonReject: string | null
        reasonApprove: string | null
        rejector: {
            id: number
            name: string
            email: string
        } | null
        approver: {
            id: number
            name: string
            email: string
        } | null
        fastqPair: {
            id: number
            createdAt: string
            status: string
        }
    } | null
}

export interface RejectEtlResultRequest {
    reason: string
}

export interface AcceptEtlResultRequest {
    reasonApprove?: string
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
