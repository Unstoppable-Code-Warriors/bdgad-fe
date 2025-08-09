export interface GeneralFileDownloadResponse {
    downloadUrl?: string
    expiresIn?: number
    expiresAt?: string
}

export interface GeneralFile {
    id: number
    fileName: string
    fileType: string
    fileSize: number
    filePath: string
    description: string
    uploadedAt: string
    sendEmrAt?: string | null
}

export interface CategoryGeneralFile {
    id: number
    name: string
    description: string
    generalFiles?: GeneralFile[]
}

export interface CreateCategoryRequest {
    name: string
    description: string
}

export interface UpdateCategoryRequest {
    name: string
    description: string
}
