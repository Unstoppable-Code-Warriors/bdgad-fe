import { backendApi } from '@/utils/api'
import type { MedicalTestRequisitionUploadResponse } from '@/types'

const PREFIX = 'api/v1/staff'

// Staff service functions
export const staffService = {
    // Upload general file
    uploadGeneralFile: async (file: File): Promise<any> => {
        const formData = new FormData()
        formData.append('generalFile', file)

        return backendApi
            .post(`${PREFIX}/upload-general-file`, {
                body: formData,
                headers: {
                    'Content-Type': undefined
                }
            })
            .json()
    },

    // Download general file by ID
    downloadGeneralFile: async (id: string): Promise<Blob> => {
        return backendApi
            .get(`${PREFIX}/download-general-file/${id}`)
            .blob()
    },

    // Delete general file by ID
    deleteGeneralFile: async (id: string): Promise<any> => {
        return backendApi
            .delete(`${PREFIX}/delete-general-file/${id}`)
            .json()
    },

    // Get general file by ID
    getGeneralFile: async (id: string): Promise<any> => {
        return backendApi
            .get(`${PREFIX}/get-general-file/${id}`)
            .json()
    },

    // Get all general files with pagination and filtering
    getAllGeneralFiles: async (params?: {
        page?: number
        limit?: number
        search?: string
        filter?: string
    }): Promise<any> => {
        const searchParams = new URLSearchParams()
        
        if (params?.page) searchParams.append('page', params.page.toString())
        if (params?.limit) searchParams.append('limit', params.limit.toString())
        if (params?.search) searchParams.append('search', params.search)
        if (params?.filter) searchParams.append('filter', params.filter)

        const queryString = searchParams.toString()
        const url = queryString ? `${PREFIX}/get-all-general-files?${queryString}` : `${PREFIX}/get-all-general-files`

        return backendApi
            .get(url)
            .json()
    },

    // Upload medical test requisition file
    uploadMedicalTestRequisition: async (file: File): Promise<MedicalTestRequisitionUploadResponse> => {
        const formData = new FormData()
        formData.append('medicalTestRequisition', file)

        return backendApi
            .post(`${PREFIX}/upload-medical-test-requisition`, {
                body: formData,
                headers: {
                    'Content-Type': undefined // Remove default application/json content type
                }
            })
            .json<MedicalTestRequisitionUploadResponse>()
    }
}
