import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staffService } from '../function/staff'

export const useGeneralFiles = (
    params: {
        page?: number
        limit?: number
        search?: string
        filter?: string
    } = {}
) => {
    return useQuery({
        queryKey: ['general-files', params],
        queryFn: () => staffService.getAllGeneralFiles(params)
    })
}

export const useGeneralFileDetail = (id: string | undefined) => {
    return useQuery({
        queryKey: ['general-file-detail', id],
        queryFn: () => {
            if (!id) return Promise.resolve(undefined)
            return staffService.getGeneralFile(id)
        },
        enabled: !!id
    })
}

export const useUploadGeneralFile = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ file, categoryGeneralFileId }: { file: File; categoryGeneralFileId?: number }) =>
            staffService.uploadGeneralFile(file, categoryGeneralFileId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['general-files'] })
            queryClient.invalidateQueries({ queryKey: ['category-general-files'] })
            queryClient.invalidateQueries({ queryKey: ['category-general-file-detail'] })
        }
    })
}

export const useDownloadGeneralFile = () => {
    return useMutation({
        mutationFn: (id: string) => staffService.downloadGeneralFile(id)
    })
}

export const useDownloadPatientFile = () => {
    return useMutation({
        mutationFn: ({ patientFileId, sessionId }: { patientFileId: string; sessionId: string }) =>
            staffService.downloadPatientFile(patientFileId, sessionId)
    })
}

export const useDeleteGeneralFile = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => staffService.deleteGeneralFile(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['general-files'] })
            queryClient.invalidateQueries({ queryKey: ['general-file-detail'] })
            queryClient.invalidateQueries({ queryKey: ['category-general-file-detail'] })
        }
    })
}

export const useUploadMedicalTestRequisition = () => {
    return useMutation({
        mutationFn: (file: any) => staffService.uploadMedicalTestRequisition(file)
    })
}
