import { useMutation } from '@tanstack/react-query'
import { uploadCategorizedPatientFiles, type CategorizedUploadParams } from '@/services/function/categorized-upload'
import type { CategorizedUploadResponse } from '@/types/categorized-upload'

export const useUploadCategorizedFiles = () => {
    return useMutation<CategorizedUploadResponse, Error, CategorizedUploadParams>({
        mutationFn: uploadCategorizedPatientFiles,
        onSuccess: (data) => {
            console.log('Categorized upload successful:', data)
        },
        onError: (error) => {
            console.error('Categorized upload failed:', error)
        }
    })
}
