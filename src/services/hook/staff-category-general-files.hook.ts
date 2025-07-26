import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staffService } from '../function/staff'
import type { CreateCategoryRequest, UpdateCategoryRequest } from '@/types/general-file'

export const useCategoryGeneralFiles = () => {
    return useQuery({
        queryKey: ['category-general-files'],
        queryFn: () => staffService.getAllCategoryGeneralFiles()
    })
}

export const useCategoryGeneralFileDetail = (id: string | undefined) => {
    return useQuery({
        queryKey: ['category-general-file-detail', id],
        queryFn: () => {
            if (!id) return Promise.resolve(undefined)
            return staffService.getCategoryGeneralFileById(id)
        },
        enabled: !!id
    })
}

export const useCreateCategoryGeneralFile = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateCategoryRequest) => staffService.createCategoryGeneralFile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['category-general-files'] })
        }
    })
}

export const useUpdateCategoryGeneralFile = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
            staffService.updateCategoryGeneralFile(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['category-general-files'] })
            queryClient.invalidateQueries({ queryKey: ['category-general-file-detail'] })
        }
    })
}

export const useDeleteCategoryGeneralFile = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => staffService.deleteCategoryGeneralFile(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['category-general-files'] })
            queryClient.invalidateQueries({ queryKey: ['category-general-file-detail'] })
        }
    })
}
