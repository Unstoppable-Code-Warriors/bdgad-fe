import type { CommonOCRRes, OCRRes } from '@/types/ocr-file'
import type { FormValues } from '@/types/prescription-form'
import type { FileWithPath } from '@mantine/dropzone'

// Extended OCR result that includes edited form data
export interface EditedOCRRes extends Partial<OCRRes> {
    editedData?: FormValues
    lastEditedAt?: string
}

export interface SubmittedFile {
    id: string
    file: FileWithPath
    uploadedAt: string
    status: 'uploaded' | 'processing' | 'completed'
    type: 'image' | 'pdf' | 'document' | 'other'
    ocrResult?: CommonOCRRes<EditedOCRRes>
    ocrStatus?: 'idle' | 'processing' | 'success' | 'failed'
    ocrError?: string
}
