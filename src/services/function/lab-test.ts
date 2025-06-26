import type { BaseListResponse } from '@/types'
import type { LabTestSessionDetail, LabTestSessionListItem } from '@/types/lab-test'
import { backendApi } from '@/utils/api'
import type { DateValue } from '@mantine/dates'
const PREFIX = 'api/v1/lab-test'

export const labTestService = {
    getSessions: async ({
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
    }): Promise<BaseListResponse<LabTestSessionListItem>> => {
        const queryParams = new URLSearchParams()
        queryParams.set('page', page.toString())
        queryParams.set('limit', limit.toString())
        queryParams.set('search', search)
        queryParams.set('sortBy', sortBy)
        queryParams.set('sortOrder', sortOrder)

        // Extract specific filters from the filter object
        const { requestDate, ...otherFilters } = filter

        // Add date parameters if present
        if (dateFrom) {
            queryParams.set('dateFrom', dateFrom.toString())
        }
        if (dateTo) {
            queryParams.set('dateTo', dateTo.toString())
        }

        // Set remaining filters if any
        if (Object.keys(otherFilters).length > 0) {
            queryParams.set('filter', JSON.stringify(otherFilters))
        }

        return await backendApi
            .get<BaseListResponse<LabTestSessionListItem>>(`${PREFIX}/sessions`, {
                searchParams: queryParams
            })
            .json()
    },
    getSessionDetail: async (personalId: string | undefined): Promise<LabTestSessionDetail> => {
        if (!personalId) {
            throw new Error('Personal ID is required')
        }
        return await backendApi.get<LabTestSessionDetail>(`${PREFIX}/sessions/${personalId}`).json()
    },
    uploadFastQ: async (sessionId: number, file: File): Promise<{ message: string }> => {
        const formData = new FormData()
        formData.append('fastq', file)

        return await backendApi
            .post(`${PREFIX}/session/${sessionId}/fastq`, {
                body: formData,
                headers: {}
            })
            .json<{ message: string }>()
    },
    downloadFastQ: async (
        fastqFileId: number
    ): Promise<{
        downloadUrl: string
        expiresIn: number
        expiresAt: string
    }> => {
        return await backendApi.get(`${PREFIX}/fastq/${fastqFileId}/download`).json<{
            downloadUrl: string
            expiresIn: number
            expiresAt: string
        }>()
    },
    deleteFastQ: async (fastqFileId: number): Promise<{ message: string }> => {
        return await backendApi.delete(`${PREFIX}/fastq/${fastqFileId}`).json<{ message: string }>()
    },
    sendToAnalysis: async (fastqFileId: number): Promise<{ message: string }> => {
        return await backendApi.post(`${PREFIX}/fastq/${fastqFileId}/send-to-analysis`).json<{ message: string }>()
    }
}
