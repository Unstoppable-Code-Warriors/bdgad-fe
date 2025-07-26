import type { AnalysisAssign } from './analysis'
import type { FastqFilePair } from './fastq'
import type { Patient } from './patient'
import type { User } from './user'

export interface LabTestSession {
    id: number
    labcode: string
    barcode: string
    requestDate: string
    createdAt: string
    metadata: Record<string, any>
    patient: Patient
    doctor: User
    analysis: AnalysisAssign
}

export interface LabTestSessionListItem extends LabTestSession {
    latestFastqFilePair: FastqFilePair | null
}

export interface LabTestSessionDetail extends LabTestSession {
    fastqFilePairs: FastqFilePair[]
}
