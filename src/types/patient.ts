export interface Patient {
    id: number
    fullName: string
    dateOfBirth: string
    phone: string
    address: string
    citizenId: string
    createdAt: string
}

export interface ClinicPatient {
    id: number
    fullName: string
    dateOfBirth: string
    phone: string
    ethnicity: string
    maritalStatus: string
    address1: string
    address2: string
    gender: string
    nation: string
    workAddress: string
    citizenId: string
    barcode: string
    allergiesInfo?: {
        allergies: string
        family_history: string
        personal_history: string
    }
    medicalRecord?: {
        doctor: {
            id: string
            name: string
            email: string
            phone: string
            address: string
        }
        reason: string
        lab_test: Array<{
            notes: string
            machine: string
            taken_by: {
                id: string
                name: string
            }
            test_name: string
            test_type: string
            conclusion: string
            file_attachments: Array<{
                url: string
                filename: string
                file_size: number
                file_type: string
            }>
        }>
        start_at: string
        diagnoses: string
        treatment: string
        prescription: {
            notes: string
            issuedDate: string
            medications: Array<{
                name: string
                route: string
                dosage: string
                duration: string
                quantity: number
                frequency: string
                instruction: string
            }>
        }
        current_status: string
    }
    appointment?: {
        id: string
        date: string
    }
    createdAt: string
    updatedAt: string
}
