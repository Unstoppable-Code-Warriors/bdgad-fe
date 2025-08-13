import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { labTestService } from '../function/lab-test'
import type { DateValue } from '@mantine/dates'
import { authService } from '../function/auth'
import { Role } from '@/utils/constant'

const formatDateToISO = (date: DateValue): string | null => {
    if (!date) return null
    if (date instanceof Date) {
        return date.toISOString()
    }
    return null
}

export const useLabTestSessions = ({
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
    filter?: Record<string, any>
    dateFrom?: DateValue | null
    dateTo?: DateValue | null
    filterGroup?: 'processing' | 'rejected' | 'approved' | null
}) => {
    return useQuery({
        queryKey: ['lab-test-sessions', page, limit, search, sortBy, sortOrder, filter, dateFrom, dateTo, filterGroup],
        queryFn: () =>
            labTestService.getSessions({
                page,
                limit,
                search,
                sortBy,
                sortOrder,
                filter,
                dateFrom: formatDateToISO(dateFrom),
                dateTo: formatDateToISO(dateTo),
                filterGroup
            })
    })
}

export const useLabTestSessionDetail = (personalId: string | undefined) => {
    return useQuery({
        queryKey: ['lab-test-session-detail', personalId],
        queryFn: () => labTestService.getSessionDetail(personalId),
        enabled: !!personalId
    })
}

export const useUploadFastQPair = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ sessionId, files }: { sessionId: number; files: File[] }) =>
            labTestService.uploadFastQPair(sessionId, files),
        onSuccess: (_, { sessionId }) => {
            // Invalidate and refetch the session detail to get updated data
            queryClient.invalidateQueries({ queryKey: ['lab-test-session-detail', sessionId.toString()] })
            // Also invalidate the sessions list to update the latest FastQ file
            queryClient.invalidateQueries({ queryKey: ['lab-test-sessions'] })
        }
    })
}

// Keep backward compatibility - map to old hook name
export const useUploadFastQ = useUploadFastQPair

export const useDownloadFastQ = () => {
    return useMutation({
        mutationFn: (fastqFileId: number) => labTestService.downloadFastQ(fastqFileId),
        onSuccess: (data) => {
            // Open the download URL in a new window/tab
            window.open(data.downloadUrl, '_blank')
        }
    })
}

export const useDeleteFastQPair = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (fastqPairId: number) => labTestService.deleteFastQPair(fastqPairId),
        onSuccess: (_, __) => {
            // Invalidate and refetch related queries
            queryClient.invalidateQueries({ queryKey: ['lab-test-sessions'] })
            queryClient.invalidateQueries({ queryKey: ['lab-test-session-detail'] })
        }
    })
}

// Keep backward compatibility
export const useDeleteFastQ = useDeleteFastQPair

export const useSendToAnalysis = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ fastqPairId, analysisId }: { fastqPairId: number; analysisId: number }) =>
            labTestService.sendToAnalysis(fastqPairId, analysisId),
        onSuccess: (_, __) => {
            // Invalidate and refetch related queries to update the status
            queryClient.invalidateQueries({ queryKey: ['lab-test-sessions'] })
            queryClient.invalidateQueries({ queryKey: ['lab-test-session-detail'] })
        }
    })
}
export const getAllAnalysis = () => {
    return useQuery({
        queryKey: ['lab-test-sessions'],
        queryFn: () => authService.getUserByCode(Role.ANALYSIS_TECHNICIAN),
        staleTime: 30000, // 30 seconds
        gcTime: 5 * 60 * 1000 // 5 minutes
    })
}
