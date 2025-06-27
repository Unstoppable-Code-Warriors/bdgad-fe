import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { validationService } from '@/services/function/validation'
import type { RejectEtlResultRequest, AcceptEtlResultRequest, ValidationFilter } from '@/types/validation'
import type { DateValue } from '@mantine/dates'

export const useValidationPatients = ({
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    filter = {},
    dateFrom = null,
    dateTo = null,
    enabled = true
}: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: string
    filter?: ValidationFilter
    dateFrom?: DateValue | null
    dateTo?: DateValue | null
    enabled?: boolean
} = {}) => {
    return useQuery({
        queryKey: ['validation-patients', { page, limit, search, sortBy, sortOrder, filter, dateFrom, dateTo }],
        queryFn: () =>
            validationService.getPatients({
                page,
                limit,
                search,
                sortBy,
                sortOrder,
                filter,
                dateFrom,
                dateTo
            }),
        enabled
    })
}

export const useValidationSessionDetail = (id: string | undefined) => {
    return useQuery({
        queryKey: ['validation-session-detail', id],
        queryFn: () => validationService.getSessionDetail(id),
        enabled: !!id
    })
}

export const useDownloadValidationEtlResult = () => {
    return useMutation({
        mutationFn: (etlResultId: number) => validationService.downloadEtlResult(etlResultId)
    })
}

export const useRejectEtlResult = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ etlResultId, data }: { etlResultId: number; data: RejectEtlResultRequest }) =>
            validationService.rejectEtlResult(etlResultId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['validation-patients'] })
            queryClient.invalidateQueries({ queryKey: ['validation-session-detail'] })
        }
    })
}

export const useAcceptEtlResult = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ etlResultId, data }: { etlResultId: number; data: AcceptEtlResultRequest }) =>
            validationService.acceptEtlResult(etlResultId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['validation-patients'] })
            queryClient.invalidateQueries({ queryKey: ['validation-session-detail'] })
        }
    })
}
