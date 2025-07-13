import type { BaseListResponse } from '@/types'
import type {
    AnalysisSessionDetail,
    AnalysisSessionListItem,
    RejectFastqRequest,
    EtlResultDownloadResponse
} from '@/types/analysis'
import { backendApi } from '@/utils/api'
import type { DateValue } from '@mantine/dates'

const PREFIX = 'api/v1/analysis'

export const analysisService = {
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
    }): Promise<BaseListResponse<AnalysisSessionListItem>> => {
        const queryParams = new URLSearchParams()
        queryParams.set('page', page.toString())
        queryParams.set('limit', limit.toString())
        queryParams.set('search', search)
        queryParams.set('sortBy', sortBy)
        queryParams.set('sortOrder', sortOrder)

        // Add date parameters if present
        if (dateFrom) {
            queryParams.set('dateFrom', dateFrom.toString())
        }
        if (dateTo) {
            queryParams.set('dateTo', dateTo.toString())
        }

        // Set filters if any
        if (Object.keys(filter).length > 0) {
            queryParams.set('filter', JSON.stringify(filter))
        }

        return await backendApi
            .get<BaseListResponse<AnalysisSessionListItem>>(`${PREFIX}/sessions`, {
                searchParams: queryParams
            })
            .json()
    },

    getSessionDetail: async (id: string | undefined): Promise<AnalysisSessionDetail> => {
        if (!id) {
            throw new Error('Session ID is required')
        }
        return await backendApi.get<AnalysisSessionDetail>(`${PREFIX}/sessions/${id}`).json()
    },

    processAnalysis: async (fastqFileId: number): Promise<{ message: string }> => {
        return await backendApi.post(`${PREFIX}/process/${fastqFileId}`).json<{ message: string }>()
    },

    rejectFastq: async (fastqFileId: number, data: RejectFastqRequest): Promise<{ message: string }> => {
        return await backendApi
            .put(`${PREFIX}/fastq/${fastqFileId}/reject`, {
                json: data
            })
            .json<{ message: string }>()
    },

    downloadEtlResult: async (etlResultId: number): Promise<EtlResultDownloadResponse> => {
        return await backendApi.get(`${PREFIX}/etl-result/${etlResultId}/download`).json<EtlResultDownloadResponse>()
    },

    sendEtlResultToValidation: async (etlResultId: number, validataionId: number): Promise<{ message: string }> => {
        return await backendApi
            .post(`${PREFIX}/etl-result/${etlResultId}/validation/${validataionId}`)
            .json<{ message: string }>()
    },

    retryEtlProcess: async (etlResultId: number): Promise<{ message: string }> => {
        return await backendApi.post(`${PREFIX}/etl-result/${etlResultId}/retry`).json<{ message: string }>()
    }
}
