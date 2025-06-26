import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { labTestService } from '../function/lab-test'
import type { DateValue } from '@mantine/dates'

export const useLabTestSessions = ({
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    filter = {},
    dateFrom = null,
    dateTo = null
}: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: string
    filter?: Record<string, any>
    dateFrom?: DateValue | null
    dateTo?: DateValue | null
}) => {
    return useQuery({
        queryKey: ['lab-test-sessions', page, limit, search, sortBy, sortOrder, filter, dateFrom, dateTo],
        queryFn: () => labTestService.getSessions({ page, limit, search, sortBy, sortOrder, filter, dateFrom, dateTo }),
        staleTime: 30000, // 30 seconds
        gcTime: 5 * 60 * 1000 // 5 minutes
    })
}

export const useLabTestSessionDetail = (personalId: string | undefined) => {
    return useQuery({
        queryKey: ['lab-test-session-detail', personalId],
        queryFn: () => labTestService.getSessionDetail(personalId),
        enabled: !!personalId
    })
}

export const useUploadFastQ = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ sessionId, file }: { sessionId: number; file: File }) =>
            labTestService.uploadFastQ(sessionId, file),
        onSuccess: (_, { sessionId }) => {
            // Invalidate and refetch the session detail to get updated data
            queryClient.invalidateQueries({ queryKey: ['lab-test-session-detail', sessionId.toString()] })
            // Also invalidate the sessions list to update the latest FastQ file
            queryClient.invalidateQueries({ queryKey: ['lab-test-sessions'] })
        }
    })
}

export const useDownloadFastQ = () => {
    return useMutation({
        mutationFn: (fastqFileId: number) => labTestService.downloadFastQ(fastqFileId),
        onSuccess: (data) => {
            // Open the download URL in a new window/tab
            window.open(data.downloadUrl, '_blank')
        }
    })
}

export const useDeleteFastQ = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (fastqFileId: number) => labTestService.deleteFastQ(fastqFileId),
        onSuccess: (_, __) => {
            // Invalidate and refetch related queries
            queryClient.invalidateQueries({ queryKey: ['lab-test-sessions'] })
            queryClient.invalidateQueries({ queryKey: ['lab-test-session-detail'] })
        }
    })
}

export const useSendToAnalysis = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (fastqFileId: number) => labTestService.sendToAnalysis(fastqFileId),
        onSuccess: (_, __) => {
            // Invalidate and refetch related queries to update the status
            queryClient.invalidateQueries({ queryKey: ['lab-test-sessions'] })
            queryClient.invalidateQueries({ queryKey: ['lab-test-session-detail'] })
        }
    })
}
