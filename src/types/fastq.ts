export interface FastqFile {
    id: number
    filePath: string
    createdAt: string
}

export interface FastqFilePair {
    id: number
    createdAt: string
    status: string
    redoReason: string | null
    fastqFileR1: FastqFile
    fastqFileR2: FastqFile
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

// Keep backward compatibility
export interface FastQ extends FastqFilePair {}

export interface FastqDownloadResponse {
    downloadUrl: string
    expiresIn: number
    expiresAt: Date
}
