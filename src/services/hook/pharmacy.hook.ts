import { useQuery } from '@tanstack/react-query'
import { staffService } from '../function/staff'
import type { BaseListResponse } from '@/types'

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

export const usePharmacyPatients = (
    params: {
        page?: number
        limit?: number
        search?: string
    } = {}
) => {
    return useQuery<BaseListResponse<PharmacyPatient>>({
        queryKey: ['pharmacy-patients', params],
        queryFn: () => staffService.getPharmacyPatients(params),
        enabled: true
    })
}

export const usePharmacyPatientById = (id: string) => {
    return useQuery<PharmacyPatient>({
        queryKey: ['pharmacy-patient', id],
        queryFn: () => staffService.getPharmacyPatientById(id),
        enabled: !!id
    })
}
