import type { Patient } from './patient'
import type { User } from './user'
import type { ValidationAssign } from './validation'

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
    validation: ValidationAssign
}

export interface AnalysisAssign {
    id: number
    name: string
    email: string
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
export enum AnalysisStatus {
    WAIT_FOR_APPROVAL = 'wait_for_approval',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

export const analysisStatusConfig = {
    [AnalysisStatus.WAIT_FOR_APPROVAL]: {
        label: 'Chờ phê duyệt',
        color: 'orange'
    },
    [AnalysisStatus.APPROVED]: {
        label: 'Đã phê duyệt',
        color: 'green'
    },
    [AnalysisStatus.REJECTED]: {
        label: 'Từ chối',
        color: 'red'
    },
    [AnalysisStatus.PROCESSING]: {
        label: 'Đang xử lý',
        color: 'blue'
    },
    [AnalysisStatus.COMPLETED]: {
        label: 'Hoàn thành',
        color: 'green'
    },
    [AnalysisStatus.FAILED]: {
        label: 'Thất bại',
        color: 'red'
    }
}

export interface AnalysisFilter {
    etlStatus?: string
}
