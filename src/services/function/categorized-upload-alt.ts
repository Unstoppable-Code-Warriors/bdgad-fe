import { backendApi } from '@/utils/api'
import type { CategorizedUploadResponse, FileCategoryDto, OCRResultDto } from '@/types/categorized-upload'

export interface CategorizedUploadParams {
    files: File[]
    patientId: number
    typeLabSession: string
    fileCategories: FileCategoryDto[]
    ocrResults?: OCRResultDto[]
    labcode?: string[]
}

export const uploadCategorizedPatientFiles = async (
    params: CategorizedUploadParams
): Promise<CategorizedUploadResponse> => {
    const formData = new FormData()

    // Add files
    params.files.forEach((file) => {
        formData.append('files', file)
    })

    // Add basic fields
    formData.append('patientId', String(params.patientId))
    formData.append('typeLabSession', String(params.typeLabSession))

    // Method 1: Try sending as individual array fields (alternative approach)
    // This might work better than JSON strings
    params.fileCategories.forEach((cat, index) => {
        formData.append(`fileCategories[${index}][category]`, String(cat.category))
        formData.append(`fileCategories[${index}][priority]`, String(cat.priority || 5))
        formData.append(`fileCategories[${index}][fileName]`, String(cat.fileName))
    })

    if (params.ocrResults && params.ocrResults.length > 0) {
        params.ocrResults.forEach((ocr, index) => {
            formData.append(`ocrResults[${index}][fileIndex]`, String(ocr.fileIndex))
            formData.append(`ocrResults[${index}][category]`, String(ocr.category))
            formData.append(`ocrResults[${index}][confidence]`, String(ocr.confidence || 0.95))
            formData.append(`ocrResults[${index}][ocrData]`, JSON.stringify(ocr.ocrData || {}))
        })
    }

    if (params.labcode && params.labcode.length > 0) {
        params.labcode.forEach((code, index) => {
            formData.append(`labcode[${index}]`, String(code))
        })
    }

    console.log('=== FormData with individual fields ===')
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`${key}: File(${value.name}, ${value.size} bytes)`)
        } else {
            console.log(`${key}: ${value}`)
        }
    }
    console.log('======================================')

    return backendApi
        .post('api/v1/staff/patient-files/upload-v2', {
            body: formData
        })
        .json<CategorizedUploadResponse>()
}
