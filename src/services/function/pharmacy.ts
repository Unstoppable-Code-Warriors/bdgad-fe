import { backendApi } from '@/utils/api'
import type { BaseListResponse } from '@/types'

const PREFIX = 'api/v1/staff'

export interface PharmacyPatient {
    id: number
    citizenId: string
    patientFullname: string
    appointment: {
        id: string
        date: string
    }
    patient: {
        phone?: string
        gender?: string
        nation?: string
        address1?: string
        address2?: string
        fullname: string
        allergies?: string
        ethnicity?: string
        citizen_id: string
        work_address?: string
        date_of_birth?: string
        family_history?: string
        marital_status?: string
        personal_history?: string
    }
    medicalRecord: {
        doctor?: {
            id: string
            name: string
            email: string
            phone?: string
            address?: string
        }
        reason?: string
        lab_test?: Array<{
            notes?: string
            machine?: string
            taken_by?: {
                id: string
                name: string
            }
            test_name?: string
            test_type?: string
            conclusion?: string
            file_attachments?: Array<{
                url: string
                filename: string
                file_size: number
                file_type: string
            }>
        }>
        start_at?: string
        diagnoses?: string
        treatment?: string
        prescription?: {
            notes?: string
            issuedDate?: string
            medications?: Array<{
                name: string
                route: string
                dosage: string
                duration: string
                quantity: number
                frequency: string
                instruction: string
            }>
        }
        current_status?: string
    }
    createdAt: string
    updatedAt: string
}

export const pharmacyService = {
    getPharmacyPatients: async (params?: {
        page?: number
        limit?: number
        search?: string
    }): Promise<BaseListResponse<PharmacyPatient>> => {
        const searchParams = new URLSearchParams()

        if (params?.page) searchParams.append('page', params.page.toString())
        if (params?.limit) searchParams.append('limit', params.limit.toString())
        if (params?.search) searchParams.append('search', params.search)

        const queryString = searchParams.toString()
        const url = queryString ? `${PREFIX}/pharmacy?${queryString}` : `${PREFIX}/pharmacy`

        return backendApi.get(url).json()
    }
}
