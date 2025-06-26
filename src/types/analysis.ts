import type { Patient } from './patient'
import type { User } from './user'

export interface FastqFileResponse {
    id: number
    filePath: string
    createdAt: string
    status: string | null
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

export interface EtlResultResponse {
    id: number
    resultPath: string
    etlCompletedAt: string
    status: string | null
    redoReason: string | null
    comment: string
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

export interface AnalysisSession {
    id: number
    labcode: string
    barcode: string
    requestDate: string
    createdAt: string
    metadata: Record<string, any>
    patient: Patient
    doctor: User
}

export interface AnalysisSessionListItem extends AnalysisSession {
    latestFastqFile: FastqFileResponse | null
    latestEtlResult: EtlResultResponse | null
}

export interface AnalysisSessionDetail extends AnalysisSession {
    fastqFiles: FastqFileResponse[]
    etlResults: EtlResultResponse[]
}

export interface RejectFastqRequest {
    redoReason: string
}

export interface EtlResultDownloadResponse {
    downloadUrl: string
    expiresIn: number
    expiresAt: string
}

// Analysis status configurations
export const ANALYSIS_STATUS = {
    WAIT_FOR_APPROVAL: 'wait_for_approval',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed'
} as const

export type AnalysisStatus = (typeof ANALYSIS_STATUS)[keyof typeof ANALYSIS_STATUS]

export const analysisStatusConfig = {
    [ANALYSIS_STATUS.WAIT_FOR_APPROVAL]: {
        label: 'Chờ phê duyệt',
        color: 'orange'
    },
    [ANALYSIS_STATUS.APPROVED]: {
        label: 'Đã phê duyệt',
        color: 'green'
    },
    [ANALYSIS_STATUS.REJECTED]: {
        label: 'Từ chối',
        color: 'red'
    },
    [ANALYSIS_STATUS.PROCESSING]: {
        label: 'Đang xử lý',
        color: 'blue'
    },
    [ANALYSIS_STATUS.COMPLETED]: {
        label: 'Hoàn thành',
        color: 'green'
    },
    [ANALYSIS_STATUS.FAILED]: {
        label: 'Thất bại',
        color: 'red'
    }
}

export interface AnalysisFilter {
    etlStatus?: string
}
