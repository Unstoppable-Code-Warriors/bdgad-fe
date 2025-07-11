import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staffService } from '../function/staff'

export const usePatientFolders = (params: {
    page?: number
    limit?: number
    search?: string
    filter?: string
} = {}) => {
    return useQuery({
        queryKey: ['patient-folders', params],
        queryFn: () => staffService.getAllPatientFolders(params),
        enabled: true
    })
}

export const useCreatePatientFolder = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (patientData: { fullName: string; healthInsuranceCode: string }) => 
            staffService.createPatientFolder(patientData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patient-folders'] })
        },
        onError: (error) => {
            console.error('Error creating patient folder:', error)
        }
    })
}
