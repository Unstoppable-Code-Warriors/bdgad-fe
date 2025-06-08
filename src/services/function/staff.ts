import { backendApi } from '@/utils/api'
import type { MedicalTestRequisitionUploadResponse } from '@/types'

const PREFIX = 'api/v1'

// Staff service functions
export const staffService = {
    // Upload medical test requisition file
    uploadMedicalTestRequisition: async (file: File): Promise<MedicalTestRequisitionUploadResponse> => {
        const formData = new FormData()
        formData.append('medicalTestRequisition', file)

        // Use backendApi directly for multipart form data upload
        // Remove the default Content-Type header to let browser set multipart/form-data with boundary
        return backendApi
            .post(`${PREFIX}/staff/upload-medical-test-requisition`, {
                body: formData,
                headers: {
                    'Content-Type': undefined // Remove default application/json content type
                }
            })
            .json<MedicalTestRequisitionUploadResponse>()
    }
}
