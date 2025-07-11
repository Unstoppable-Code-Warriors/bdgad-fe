import { backendApi } from '@/utils/api'
import type { MedicalTestRequisitionUploadResponse } from '@/types'
import type { GeneralFileDownloadResponse } from '@/types/general-file'


const PREFIX = 'api/v1/staff'

// Staff service functions
export const staffService = {
    // Upload general file
    uploadGeneralFile: async (file: File): Promise<any> => {
        const formData = new FormData()
        formData.append('files', file)

        return backendApi
            .post(`${PREFIX}/general-files`, {
                body: formData,
                headers: {}
            })
            .json()
    },

    // Download general file by ID
    downloadGeneralFile: async (id: string): Promise<any> => {
        return backendApi
            .get(`${PREFIX}/general-files/${id}/download`).json<GeneralFileDownloadResponse>()
    },

    // Delete general file by ID
    deleteGeneralFile: async (id: string): Promise<any> => {
        return backendApi
            .delete(`${PREFIX}/general-files/${id}`)
            .json()
    },

    // Get general file by ID
    getGeneralFile: async (id: string): Promise<any> => {
        return backendApi
            .get(`${PREFIX}/general-file/${id}`)
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
        const url = queryString ? `${PREFIX}/general-files?${queryString}` : `${PREFIX}/general-files`

        return backendApi
            .get(url)
            .json()
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
        return backendApi
            .get(`${PREFIX}/patients/${id}`)
            .json()
    },

    //Get all patient folders
    getAllPatientFolders: async (params?: {
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
        const url = queryString ? `${PREFIX}/patients?${queryString}` : `${PREFIX}/patients`

        return backendApi
            .get(url)
            .json()
    },

    //Update patient folder by ID
    updatePatientFolder: async (id: string, patientData: {
        fullName?: string
        citizenId?: string
    }): Promise<any> => {
        return backendApi
            .put(`${PREFIX}/patients/${id}`, {
                json: patientData
            })
            .json()
    },

    //Delete patient folder by ID
    deletePatientFolder: async (id: string): Promise<any> => {
        return backendApi
            .delete(`${PREFIX}/patients/${id}`)
            .json()
    },

    // Upload medical test requisition file
    uploadMedicalTestRequisition: async (formData: {
        files: File[]
        patientId: number
        doctorId: number
        labTestingId?: number
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
        data.append('doctorId', formData.doctorId.toString())
        if (formData.labTestingId) {
            data.append('labTestingId', formData.labTestingId.toString())
        }
        data.append('typeLabSession', formData.typeLabSession)
        if (formData.ocrResult) {
            data.append('ocrResult', formData.ocrResult)
        }

        return backendApi
            .post(`${PREFIX}/patient-files/upload`, {
                body: data,
                headers: {}
            })
            .json<MedicalTestRequisitionUploadResponse>()
    },
    // Get all lab sessions of a patient
    getPatientLabSessions: async (patientId: string): Promise<any> => {
        return backendApi
            .get(`${PREFIX}/patients/${patientId}/sessions`)
            .json()
    },

    // Get session detail by ID
    getPatientLabSessionDetail: async ( sessionId: string): Promise<any> => {
        return backendApi
            .get(`${PREFIX}/sessions/${sessionId}`)
            .json()
    },

}

