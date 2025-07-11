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
        mutationFn: (patientData: { fullName: string; citizenId: string }) => 
            staffService.createPatientFolder(patientData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patient-folders'] })
        },
        onError: (error) => {
            console.error('Error creating patient folder:', error)
        }
    })
}

export const useUpdatePatientFolder = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { fullName?: string; citizenId?: string } }) => 
            staffService.updatePatientFolder(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patient-folders'] })
        }
    })
}

export const useDeletePatientFolder = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => staffService.deletePatientFolder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patient-folders'] })
        }
    })
}

export const usePatientFolderDetail = (id: string | undefined) => {
    return useQuery({
        queryKey: ['patient-folder-detail', id],
        queryFn: () => staffService.getPatientFolder(id!),
        enabled: !!id
    })
}
