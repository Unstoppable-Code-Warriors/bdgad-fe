import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { analysisService } from '../function/analysis'
import type { AnalysisFilter, RejectFastqRequest } from '@/types/analysis'
import type { DateValue } from '@mantine/dates'
import { authService } from '../function/auth'
import { Role } from '@/utils/constant'

export const useAnalysisSessions = ({
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    filter = {},
    dateFrom = null,
    dateTo = null,
    filterGroup = null
}: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: string
    filter?: AnalysisFilter
    dateFrom?: DateValue | null
    dateTo?: DateValue | null
    filterGroup?: 'processing' | 'rejected' | 'approved' | null
} = {}) => {
    return useQuery({
        queryKey: [
            'analysis-sessions',
            { page, limit, search, sortBy, sortOrder, filter, dateFrom, dateTo, filterGroup }
        ],
        queryFn: () =>
            analysisService.getSessions({
                page,
                limit,
                search,
                sortBy,
                sortOrder,
                filter,
                dateFrom,
                dateTo,
                filterGroup
            })
    })
}

export const useAnalysisSessionDetail = (id: string | undefined) => {
    return useQuery({
        queryKey: ['analysis-session-detail', id],
        queryFn: () => analysisService.getSessionDetail(id),
        enabled: !!id
    })
}

export const useProcessAnalysis = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (fastqPairId: number) => analysisService.processAnalysis(fastqPairId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['analysis-sessions'] })
            queryClient.invalidateQueries({ queryKey: ['analysis-session-detail'] })
        }
    })
}

export const useRejectFastqPair = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ fastqPairId, data }: { fastqPairId: number; data: RejectFastqRequest }) =>
            analysisService.rejectFastqPair(fastqPairId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['analysis-sessions'] })
            queryClient.invalidateQueries({ queryKey: ['analysis-session-detail'] })
        }
    })
}

export const useDownloadEtlResult = () => {
    return useMutation({
        mutationFn: (etlResultId: number) => analysisService.downloadEtlResult(etlResultId)
    })
}

export const useSendEtlResultToValidation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ etlResultId, validataionId }: { etlResultId: number; validataionId: number }) =>
            analysisService.sendEtlResultToValidation(etlResultId, validataionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['analysis-sessions'] })
            queryClient.invalidateQueries({ queryKey: ['analysis-session-detail'] })
        }
    })
}

export const useRetryEtlProcess = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (etlResultId: number) => analysisService.retryEtlProcess(etlResultId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['analysis-sessions'] })
            queryClient.invalidateQueries({ queryKey: ['analysis-session-detail'] })
        }
    })
}

export const getAllValidations = () => {
    return useQuery({
        queryKey: ['lab-test-sessions'],
        queryFn: () => authService.getUserByCode(Role.VALIDATION_TECHNICIAN),
        staleTime: 30000, // 30 seconds
        gcTime: 5 * 60 * 1000 // 5 minutes
    })
}
