import { backendApi } from '@/utils/api'
import type { CategorizedUploadResponse, FileCategoryDto, OCRResultDto } from '@/types/categorized-upload'

export interface CategorizedUploadParams {
    files: File[]
    patientId: number
    typeLabSession: string
    fileCategories: FileCategoryDto[]
    ocrResults?: OCRResultDto[]
    labcode?: string[]
}

export const uploadCategorizedPatientFiles = async (
    params: CategorizedUploadParams
): Promise<CategorizedUploadResponse> => {
    const formData = new FormData()

    // Add files
    params.files.forEach((file) => {
        formData.append('files', file)
    })

    // Validate and clean data before sending
    const cleanFileCategories = params.fileCategories.map((cat, index) => {
        console.log(`Processing category ${index}:`, {
            originalCategory: cat.category,
            originalFileName: cat.fileName,
            originalPriority: cat.priority,
            categoryType: typeof cat.category,
            fileNameType: typeof cat.fileName
        })

        // Extract the actual string value from the enum
        let categoryValue: string = cat.category
        if (typeof categoryValue === 'object' && categoryValue !== null) {
            categoryValue = String(categoryValue)
        }

        const cleanCat = {
            category: String(categoryValue || 'general'),
            priority: Number(cat.priority) || 5,
            fileName: String(cat.fileName || params.files[index]?.name || 'unknown.txt')
        }

        console.log(`Cleaned category ${index}:`, cleanCat)

        // Validate that category is one of the expected values
        const validCategories = ['prenatal_screening', 'hereditary_cancer', 'gene_mutation', 'general']
        if (!validCategories.includes(cleanCat.category)) {
            console.warn(`Invalid category '${cleanCat.category}' for index ${index}, defaulting to 'general'`)
            cleanCat.category = 'general'
        }

        // Final validation that we have non-empty strings
        if (!cleanCat.category || cleanCat.category === 'undefined' || cleanCat.category === 'null') {
            console.error(`Empty category detected for index ${index}, using 'general'`)
            cleanCat.category = 'general'
        }

        if (!cleanCat.fileName || cleanCat.fileName === 'undefined' || cleanCat.fileName === 'null') {
            console.error(`Empty fileName detected for index ${index}, using file name`)
            cleanCat.fileName = params.files[index]?.name || `file_${index}.txt`
        }

        return cleanCat
    })

    const cleanOcrResults =
        params.ocrResults?.map((ocr, index) => {
            const cleanOcr = {
                fileIndex: parseInt(String(ocr.fileIndex), 10) >= 0 ? parseInt(String(ocr.fileIndex), 10) : index,
                category: String(ocr.category || 'general'),
                confidence: parseFloat(String(ocr.confidence)) || 0.95,
                ocrData: ocr.ocrData || {}
            }

            // Validate category
            const validCategories = ['prenatal_screening', 'hereditary_cancer', 'gene_mutation', 'general']
            if (!validCategories.includes(cleanOcr.category)) {
                cleanOcr.category = 'general'
            }

            // Ensure fileIndex is a proper integer
            if (isNaN(cleanOcr.fileIndex) || cleanOcr.fileIndex < 0) {
                cleanOcr.fileIndex = index
            }

            return cleanOcr
        }) || []

    // Final validation before sending
    const hasEmptyCategories = cleanFileCategories.some((cat) => !cat.category || !cat.fileName)
    const hasInvalidOcr = cleanOcrResults.some((ocr) => typeof ocr.fileIndex !== 'number' || !ocr.category)

    if (hasEmptyCategories) {
        console.error('Empty categories detected:', cleanFileCategories)
        throw new Error('Invalid file categories detected')
    }

    if (hasInvalidOcr) {
        console.error('Invalid OCR results detected:', cleanOcrResults)
        throw new Error('Invalid OCR results detected')
    }

    // Validate JSON serialization/deserialization works correctly
    try {
        const testCategories = JSON.parse(JSON.stringify(cleanFileCategories))
        const testOcr = cleanOcrResults.length > 0 ? JSON.parse(JSON.stringify(cleanOcrResults)) : []

        console.log('JSON serialization test - categories:', testCategories)
        console.log('JSON serialization test - OCR:', testOcr)

        // Ensure the deserialized data still has valid values
        if (testCategories.some((cat: any) => !cat.category || !cat.fileName)) {
            throw new Error('Categories lost data during JSON serialization')
        }

        if (testOcr.some((ocr: any) => typeof ocr.fileIndex !== 'number' || !ocr.category)) {
            throw new Error('OCR data lost data during JSON serialization')
        }
    } catch (error) {
        console.error('JSON serialization test failed:', error)
        throw new Error('Data serialization validation failed')
    }

    // Add form fields with extra validation
    formData.append('patientId', String(params.patientId))
    formData.append('typeLabSession', String(params.typeLabSession))

    // Create a clean, minimal JSON string for fileCategories
    const categoriesJson = JSON.stringify(cleanFileCategories)
    formData.append('fileCategories', categoriesJson)

    console.log('=== FINAL DATA BEING SENT ===')
    console.log('patientId:', String(params.patientId))
    console.log('typeLabSession:', String(params.typeLabSession))
    console.log('fileCategories JSON string:', categoriesJson)
    console.log('fileCategories parsed back:', JSON.parse(categoriesJson))
    console.log('files count:', params.files.length)
    console.log(
        'files names:',
        params.files.map((f) => f.name)
    )

    if (cleanOcrResults.length > 0) {
        const ocrJson = JSON.stringify(cleanOcrResults)
        formData.append('ocrResults', ocrJson)
        console.log('ocrResults JSON string:', ocrJson)
        console.log('ocrResults parsed back:', JSON.parse(ocrJson))
    }

    // Debug FormData contents
    console.log('=== FormData Debug ===')
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`${key}: File(${value.name}, ${value.size} bytes)`)
        } else {
            console.log(`${key}: ${value}`)
            // For JSON fields, parse and log the structure
            if (key === 'fileCategories' || key === 'ocrResults') {
                try {
                    const parsed = JSON.parse(value)
                    console.log(`${key} parsed:`, parsed)
                } catch (e) {
                    console.log(`${key} parse error:`, e)
                }
            }
        }
    }
    console.log('========================')

    try {
        const response = await backendApi
            .post('api/v1/staff/patient-files/upload-v2', {
                body: formData
                // Don't set headers for FormData - let the browser handle Content-Type
            })
            .json<CategorizedUploadResponse>()

        console.log('Upload successful:', response)
        return response
    } catch (error: any) {
        console.error('Upload failed with error:', error)
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            response: error.response,
            status: error.response?.status,
            statusText: error.response?.statusText
        })

        // Try to get the error body
        if (error.response) {
            try {
                const errorBody = await error.response.clone().json()
                console.error('Backend error response:', errorBody)
            } catch (parseError) {
                console.error('Could not parse error response:', parseError)
                try {
                    const errorText = await error.response.clone().text()
                    console.error('Error response as text:', errorText)
                } catch (textError) {
                    console.error('Could not get error response as text:', textError)
                }
            }
        }

        throw error
    }
}
