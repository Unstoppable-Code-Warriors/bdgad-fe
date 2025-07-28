import { backendApi } from '@/utils/api'
import type { MedicalTestRequisitionUploadResponse } from '@/types'
import type { GeneralFileDownloadResponse } from '@/types/general-file'

const PREFIX = 'api/v1/staff'

// Staff service functions
export const staffService = {
    // Upload general file
    uploadGeneralFile: async (file: File, categoryGeneralFileId?: number): Promise<any> => {
        const formData = new FormData()
        formData.append('files', file)
        if (categoryGeneralFileId) {
            formData.append('categoryGeneralFileId', categoryGeneralFileId.toString())
        }

        return backendApi
            .post(`${PREFIX}/general-files`, {
                body: formData,
                headers: {}
            })
            .json()
    },

    // Download general file by ID
    downloadGeneralFile: async (id: string): Promise<any> => {
        return backendApi.get(`${PREFIX}/general-files/${id}/download`).json<GeneralFileDownloadResponse>()
    },

    downloadPatientFile: async (patientFileId: string, sessionId: string): Promise<any> => {
        const response = await backendApi.get(`${PREFIX}/patient-files/${patientFileId}/sessions/${sessionId}/download`)

        // Clone the response to avoid "body stream already read" error
        const responseClone = response.clone()

        // Check content type to determine how to parse
        const contentType = response.headers.get('content-type') || ''

        if (contentType.includes('application/json')) {
            return await response.json()
        } else {
            return await responseClone.text()
        }
    },

    // Delete general file by ID
    deleteGeneralFile: async (id: string): Promise<any> => {
        return backendApi.delete(`${PREFIX}/general-files/${id}`).json()
    },

    // Get general file by ID
    getGeneralFile: async (id: string): Promise<any> => {
        return backendApi.get(`${PREFIX}/general-file/${id}`).json()
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
        const url = queryString ? `${PREFIX}/general-files?${queryString}` : `${PREFIX}/general-files`

        return backendApi.get(url).json()
    },

    //Create folder patient
    createPatientFolder: async (patientData: { fullName: string; citizenId: string }): Promise<any> => {
        return backendApi
            .post(`${PREFIX}/patients`, {
                json: patientData
            })
            .json()
    },

    //Get patient folder by ID
    getPatientFolder: async (id: string): Promise<any> => {
        return backendApi.get(`${PREFIX}/patients/${id}`).json()
    },

    //Get all patient folders
    getAllPatientFolders: async (params?: {
        page?: number
        limit?: number
        search?: string
        filter?: string
        sortOrder?: string
        dateFrom?: string
        dateTo?: string
    }): Promise<any> => {
        const searchParams = new URLSearchParams()

        if (params?.page) searchParams.append('page', params.page.toString())
        if (params?.limit) searchParams.append('limit', params.limit.toString())
        if (params?.search) searchParams.append('search', params.search)
        if (params?.filter) searchParams.append('filter', params.filter)
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder)
        if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom)
        if (params?.dateTo) searchParams.append('dateTo', params.dateTo)

        const queryString = searchParams.toString()
        const url = queryString ? `${PREFIX}/patients?${queryString}` : `${PREFIX}/patients`

        console.log('Fetching patient folders with URL:', url)
        return backendApi.get(url).json()
    },

    //Update patient folder by ID
    updatePatientFolder: async (
        id: string,
        patientData: {
            fullName?: string
            citizenId?: string
        }
    ): Promise<any> => {
        return backendApi
            .put(`${PREFIX}/patients/${id}`, {
                json: patientData
            })
            .json()
    },

    //Delete patient folder by ID
    deletePatientFolder: async (id: string): Promise<any> => {
        return backendApi.delete(`${PREFIX}/patients/${id}`).json()
    },

    // Upload medical test requisition file
    uploadMedicalTestRequisition: async (formData: {
        files: File[]
        patientId: number
        typeLabSession: string
        ocrResult?: string
    }): Promise<MedicalTestRequisitionUploadResponse> => {
        const data = new FormData()

        // Append files
        formData.files.forEach((file) => {
            data.append('files', file)
        })

        // Append other fields
        data.append('patientId', formData.patientId.toString())
        data.append('typeLabSession', formData.typeLabSession)
        if (formData.ocrResult) {
            data.append('ocrResult', formData.ocrResult)
        }

        // Append labcode array (FormData only accepts strings, so append each value separately)
        const labcodeArray = ['O5123A', 'N5456B']
        labcodeArray.forEach((labcode) => {
            data.append('labcode', labcode)
        })

        return backendApi
            .post(`${PREFIX}/patient-files/upload`, {
                body: data,
                headers: {}
            })
            .json<MedicalTestRequisitionUploadResponse>()
    },
    // Get all lab sessions of a patient
    getPatientLabSessions: async (patientId: string): Promise<any> => {
        return backendApi.get(`${PREFIX}/patients/${patientId}/sessions`).json()
    },

    // Get session detail by ID
    getPatientLabSessionDetail: async (sessionId: string): Promise<any> => {
        return backendApi.get(`${PREFIX}/sessions/${sessionId}`).json()
    },

    //Assign lab test or doctor to session
    assignSession: async (
        sessionId: string,
        data: {
            doctorId?: number
            labTestingId?: number
        }
    ): Promise<any> => {
        return backendApi
            .put(`${PREFIX}/sessions/${sessionId}`, {
                json: data
            })
            .json()
    },

    // OCR file processing
    ocrFile: async (file: File): Promise<any> => {
        const formData = new FormData()
        formData.append('file', file)

        return backendApi
            .post(`${PREFIX}/ocr`, {
                body: formData,
                headers: {}
            })
            .json()
    },

    // Category General Files APIs
    createCategoryGeneralFile: async (data: { name: string; description: string }): Promise<any> => {
        return backendApi
            .post(`${PREFIX}/category-general-files`, {
                json: data
            })
            .json()
    },

    getAllCategoryGeneralFiles: async (): Promise<any> => {
        return backendApi.get(`${PREFIX}/category-general-files`).json()
    },

    getCategoryGeneralFileById: async (id: string): Promise<any> => {
        return backendApi.get(`${PREFIX}/category-general-files/${id}`).json()
    },

    updateCategoryGeneralFile: async (id: string, data: { name: string; description: string }): Promise<any> => {
        return backendApi
            .put(`${PREFIX}/category-general-files/${id}`, {
                json: data
            })
            .json()
    },

    deleteCategoryGeneralFile: async (id: string): Promise<any> => {
        return backendApi.delete(`${PREFIX}/category-general-files/${id}`).json()
    }
}
