import { useQuery } from '@tanstack/react-query'
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
        queryFn: () => labTestService.getSessionDetail(personalId)
    })
}
