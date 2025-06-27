import type { BaseListResponse } from '@/types'
import type {
    ValidationSessionWithLatestEtlResponse,
    RejectEtlResultRequest,
    AcceptEtlResultRequest,
    ValidationEtlResultDownloadResponse
} from '@/types/validation'
import { backendApi } from '@/utils/api'
import type { DateValue } from '@mantine/dates'

const PREFIX = 'api/v1/validation'

export const validationService = {
    getPatients: async ({
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
    }): Promise<BaseListResponse<ValidationSessionWithLatestEtlResponse>> => {
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
            .get<BaseListResponse<ValidationSessionWithLatestEtlResponse>>(`${PREFIX}/patients`, {
                searchParams: queryParams
            })
            .json()
    },

    getSessionDetail: async (id: string | undefined): Promise<ValidationSessionWithLatestEtlResponse> => {
        if (!id) {
            throw new Error('Session ID is required')
        }
        return await backendApi.get<ValidationSessionWithLatestEtlResponse>(`${PREFIX}/${id}`).json()
    },

    downloadEtlResult: async (etlResultId: number): Promise<ValidationEtlResultDownloadResponse> => {
        return await backendApi
            .get(`${PREFIX}/etl-result/${etlResultId}/download`)
            .json<ValidationEtlResultDownloadResponse>()
    },

    rejectEtlResult: async (etlResultId: number, data: RejectEtlResultRequest): Promise<{ message: string }> => {
        return await backendApi
            .put(`${PREFIX}/etl-result/${etlResultId}/reject`, {
                json: data
            })
            .json<{ message: string }>()
    },

    acceptEtlResult: async (etlResultId: number, data: AcceptEtlResultRequest): Promise<{ message: string }> => {
        return await backendApi
            .put(`${PREFIX}/etl-result/${etlResultId}/accept`, {
                json: data
            })
            .json<{ message: string }>()
    }
}
