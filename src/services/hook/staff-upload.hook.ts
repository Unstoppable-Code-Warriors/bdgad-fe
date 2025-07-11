import { useMutation } from '@tanstack/react-query'
import { staffService } from '../function/staff'

export const useUploadMedicalTestRequisition = () => {
    return useMutation({
        mutationFn: (formData: {
            files: File[]
            patientId: number
            doctorId: number
            labTestingId?: number
            typeLabSession: string
            ocrResult?: string
        }) => staffService.uploadMedicalTestRequisition(formData),
        onSuccess: (data) => {
            console.log('Upload successful:', data)
        },
        onError: (error) => {
            console.error('Upload failed:', error)
        }
    })
}