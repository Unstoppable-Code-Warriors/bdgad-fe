import { useMutation } from '@tanstack/react-query'
import { staffService } from '../function/staff'

export const useUploadMedicalTestRequisition = () => {
    return useMutation({
        mutationFn: (formData: { files: File[]; patientId: number; typeLabSession: string; ocrResult?: string }) =>
            staffService.uploadMedicalTestRequisition(formData),
        onSuccess: (data) => {
            console.log('Upload successful:', data)
        },
        onError: (error) => {
            console.error('Upload failed:', error)
        }
    })
}

export const useUploadResultRequisition = () => {
    return useMutation({
        mutationFn: (formData: { files: File[]; patientId: number; typeLabSession: string }) =>
            staffService.uploadResultRequisition(formData),
        onSuccess: (data) => {
            console.log('Upload result requisition successful:', data)
        },
        onError: (error) => {
            console.error('Upload result requisition failed:', error)
        }
    })
}
