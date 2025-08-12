import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Container, Center, Title, Paper, Button, Group, Drawer, Alert, Text } from '@mantine/core'
import { IconDeviceFloppy, IconArrowNarrowLeft } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import type { FileWithPath } from '@mantine/dropzone'
import { useUploadCategorizedFiles } from '@/services/hook/categorized-upload.hook'
import { useUploadResultRequisition } from '@/services/hook/staff-upload.hook'
import { staffService } from '@/services/function/staff'
import { getFileType } from './utils/fileUtils'
import type { EditedOCRRes } from './types'
import type { CommonOCRRes } from '@/types/ocr-file'
import {
    FileCategory,
    FILE_CATEGORY_OPTIONS,
    type FileCategoryDto,
    type OCRResultDto,
    type CategorizedSubmittedFile
} from '@/types/categorized-upload'
import { validateCategorizedFiles, generateDefaultFileCategories } from './utils/fileValidation'
import ImportStep from './components/ImportStep'
import OCRDrawer from './components/OCRDrawer'

const InputInfoPage = () => {
    const [typeLabSession, setTypeLabSession] = useState<string>('test')
    const [skipOCR, setSkipOCR] = useState<boolean>(false)
    const [bypassPrescriptionCheck, setBypassPrescriptionCheck] = useState<boolean>(false)
    const [selectedFiles, setSelectedFiles] = useState<FileWithPath[]>([])
    const [fileCategories, setFileCategories] = useState<FileCategoryDto[]>([])
    const [submittedFiles, setSubmittedFiles] = useState<CategorizedSubmittedFile[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [ocrError, setOcrError] = useState<string | null>(null)
    const [ocrDrawerOpen, setOcrDrawerOpen] = useState(false)
    const [selectedFileForOCR, setSelectedFileForOCR] = useState<CategorizedSubmittedFile | null>(null)
    const [ocrProgress, setOcrProgress] = useState<{ [fileId: string]: number }>({})
    const [validationResult, setValidationResult] = useState<{
        isValid: boolean
        errors: { [index: number]: string }
        globalErrors: string[]
        summary: string
    }>({ isValid: true, errors: {}, globalErrors: [], summary: '' })

    const location = useLocation()
    const navigate = useNavigate()

    const patientId = location.state?.patientId || location.state?.patient?.id

    const uploadMutation = useUploadCategorizedFiles()
    const uploadResultMutation = useUploadResultRequisition()

    useEffect(() => {
        if (location.state?.ocrResult) {
            handleOCRComplete(location.state.ocrResult)
        }
        if (location.state?.submittedFiles) {
            console.log('Restoring submitted files from OCR:', location.state.submittedFiles)
            setSubmittedFiles(location.state.submittedFiles)
        }
        // Set session type and skip OCR if provided in navigation state
        if (location.state?.typeLabSession) {
            setTypeLabSession(location.state.typeLabSession)
        }
        if (location.state?.skipOCR) {
            setSkipOCR(location.state.skipOCR)
        }
        if (location.state?.bypassPrescriptionCheck) {
            setBypassPrescriptionCheck(location.state.bypassPrescriptionCheck)
        }
    }, [location.state])

    const handleOCRComplete = (data: CommonOCRRes<EditedOCRRes>) => {
        console.log('OCR completed:', data)
        // The OCR complete handling is now done inline
    }

    // File handling functions
    const handleFileDrop = (files: FileWithPath[]) => {
        const newFiles = [...selectedFiles, ...files]
        const newCategories = [...fileCategories, ...generateDefaultFileCategories(files)]
        
        setSelectedFiles(newFiles)
        setFileCategories(newCategories)
        setError(null)
        
        validateFiles(newFiles, newCategories)

        if (bypassPrescriptionCheck) {
            setTimeout(() => {
                autoSubmitFiles(newFiles, newCategories)
            }, 100)
        }
    }

    const autoSubmitFiles = (files: FileWithPath[], categories: FileCategoryDto[]) => {
        if (files.length === 0) {
            return
        }

        const result = validateCategorizedFilesWithBypass(files as File[], categories, submittedFiles)
        if (!result.isValid) {
            setError(result.globalErrors[0] || 'Vui lòng khắc phục các lỗi trước khi tiếp tục')
            return
        }

        const newSubmittedFiles: CategorizedSubmittedFile[] = files.map((file, index) => {
            const categoryData = categories[index] || {
                category: FileCategory.GENERAL,
                priority: 5,
                fileName: file.name
            }

            return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                file,
                uploadedAt: new Date().toLocaleString('vi-VN'),
                status: 'uploaded',
                type: getFileType(file),
                ocrStatus: 'idle',
                category: categoryData.category,
                priority: categoryData.priority || 5,
                isRequired: categoryData.category !== FileCategory.GENERAL
            }
        })

        setSubmittedFiles((prev) => [...prev, ...newSubmittedFiles])
        setSelectedFiles([])
        setFileCategories([])
        setError(null)
    }

    const handleRemoveFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
        setFileCategories((prev) => prev.filter((_, i) => i !== index))

        const updatedFiles = selectedFiles.filter((_, i) => i !== index)
        const updatedCategories = fileCategories.filter((_, i) => i !== index)
        validateFiles(updatedFiles, updatedCategories)
    }

    const handleCategoryChange = (index: number, category: FileCategory) => {
        setFileCategories((prev) => {
            const updated = [...prev]
            // Auto-assign priority based on category
            const categoryOption = FILE_CATEGORY_OPTIONS.find((opt) => opt.value === category)
            const autoPriority = categoryOption?.priority || 5

            updated[index] = {
                ...updated[index],
                category,
                priority: autoPriority,
                fileName: selectedFiles[index]?.name || ''
            }
            validateFiles(selectedFiles, updated)
            return updated
        })
    }

    // ...existing code...

    const validateFiles = (files: FileWithPath[], categories: FileCategoryDto[]) => {
        const result = bypassPrescriptionCheck 
            ? validateCategorizedFilesWithBypass(files as File[], categories, submittedFiles)
            : validateCategorizedFiles(files as File[], categories, submittedFiles)
        setValidationResult(result)

        if (result.globalErrors.length > 0) {
            setError(result.globalErrors[0])
        } else {
            setError(null)
        }
    }

    const validateCategorizedFilesWithBypass = (
        files: File[],
        _fileCategories: FileCategoryDto[],
        submittedFiles: CategorizedSubmittedFile[] = []
    ) => {
        const errors: { [index: number]: string } = {}
        const globalErrors: string[] = []

        if (files.length === 0 && submittedFiles.length === 0) {
            globalErrors.push('Cần ít nhất một file')
        }

        // Basic file validation only
        files.forEach((file, index) => {
            // Check file size
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                errors[index] = `File quá lớn. Kích thước tối đa: 10MB`
            }

            // Check file type - allow common file types for test results
            const allowedTypes = [
                'application/pdf',
                'image/jpeg',
                'image/jpg', 
                'image/png',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword',
                'text/csv'
            ]
            
            if (!allowedTypes.includes(file.type)) {
                errors[index] = 'Loại file không được hỗ trợ'
            }
        })

        const isValid = Object.keys(errors).length === 0 && globalErrors.length === 0
        const totalFiles = files.length + submittedFiles.length
        
        const summary = isValid
            ? `✓ Sẵn sàng tải lên: ${files.length} file mới${submittedFiles.length > 0 ? ` (tổng: ${totalFiles} file)` : ``} - Không yêu cầu phân loại`
            : `✗ Có ${Object.keys(errors).length + globalErrors.length} lỗi cần khắc phục`

        return {
            isValid,
            errors,
            globalErrors,
            summary
        }
    }

    const handleSubmitFiles = () => {
        if (selectedFiles.length === 0) {
            setError('Please select at least one file')
            return
        }

        // Validate before submitting
        const result = bypassPrescriptionCheck 
            ? validateCategorizedFilesWithBypass(selectedFiles as File[], fileCategories, submittedFiles)
            : validateCategorizedFiles(selectedFiles as File[], fileCategories, submittedFiles)
        if (!result.isValid) {
            setError(result.globalErrors[0] || 'Vui lòng khắc phục các lỗi trước khi tiếp tục')
            return
        }

        console.log('Debug - handleSubmitFiles - selectedFiles:', selectedFiles)
        console.log('Debug - handleSubmitFiles - fileCategories:', fileCategories)

        const newSubmittedFiles: CategorizedSubmittedFile[] = selectedFiles.map((file, index) => {
            const categoryData = fileCategories[index] || {
                category: FileCategory.GENERAL,
                priority: 5,
                fileName: file.name
            }

            return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                file,
                uploadedAt: new Date().toLocaleString('vi-VN'),
                status: 'uploaded',
                type: getFileType(file),
                ocrStatus: 'idle',
                category: categoryData.category,
                priority: categoryData.priority || 5,
                isRequired: categoryData.category !== FileCategory.GENERAL
            }
        })

        console.log('Debug - newSubmittedFiles:', newSubmittedFiles)

        const updatedSubmittedFiles = [...submittedFiles, ...newSubmittedFiles]
        setSubmittedFiles(updatedSubmittedFiles)
        console.log('Debug - updatedSubmittedFiles after setSubmittedFiles:', updatedSubmittedFiles)
        setSelectedFiles([])
        setFileCategories([])
        setError(null)
    }

    const handleDeleteSubmittedFile = (id: string) => {
        const updatedSubmittedFiles = submittedFiles.filter((f) => f.id !== id)
        setSubmittedFiles(updatedSubmittedFiles)
    }

    // OCR functions
    const handleOCRClick = async (fileId: string) => {
        setSubmittedFiles((prev) =>
            prev.map((file) => (file.id === fileId ? { ...file, ocrStatus: 'processing' as const } : file))
        )

        setOcrProgress((prev) => ({ ...prev, [fileId]: 0 }))

        const progressInterval = setInterval(() => {
            setOcrProgress((prev) => {
                const currentProgress = prev[fileId] || 0
                if (currentProgress < 90) {
                    return { ...prev, [fileId]: currentProgress + 10 }
                }
                return prev
            })
        }, 300)

        const fileToProcess = submittedFiles.find((f) => f.id === fileId)
        if (!fileToProcess) {
            clearInterval(progressInterval)
            setOcrProgress((prev) => {
                const { [fileId]: _, ...rest } = prev
                return rest
            })
            return
        }

        try {
            const result = await staffService.ocrFile(fileToProcess.file)

            setOcrProgress((prev) => ({ ...prev, [fileId]: 100 }))

            setTimeout(() => {
                setOcrProgress((prev) => {
                    const { [fileId]: _, ...rest } = prev
                    return rest
                })
            }, 500)

            // Update file with success status and result
            const updatedFiles = submittedFiles.map((file) =>
                file.id === fileId
                    ? {
                          ...file,
                          ocrStatus: 'success' as const,
                          ocrResult: result,
                          status: 'completed' as const
                      }
                    : file
            )

            setSubmittedFiles(updatedFiles)

            // Update the selected file for OCR if it's the same file
            if (selectedFileForOCR && selectedFileForOCR.id === fileId) {
                setSelectedFileForOCR({
                    ...selectedFileForOCR,
                    ocrStatus: 'success',
                    ocrResult: result,
                    status: 'completed'
                })
            }

            notifications.show({
                title: 'Thành công',
                message: 'OCR đã được xử lý thành công',
                color: 'green'
            })
        } catch (error) {
            console.error('OCR error:', error)

            // Update file with failed status
            const updatedFiles = submittedFiles.map((file) =>
                file.id === fileId
                    ? {
                          ...file,
                          ocrStatus: 'failed' as const,
                          ocrError: error instanceof Error ? error.message : 'OCR processing failed'
                      }
                    : file
            )

            setSubmittedFiles(updatedFiles)

            // Update the selected file for OCR if it's the same file
            if (selectedFileForOCR && selectedFileForOCR.id === fileId) {
                setSelectedFileForOCR({
                    ...selectedFileForOCR,
                    ocrStatus: 'failed',
                    ocrError: error instanceof Error ? error.message : 'OCR processing failed'
                })
            }

            notifications.show({
                title: 'Lỗi',
                message: 'Không thể xử lý OCR',
                color: 'red'
            })
        } finally {
            clearInterval(progressInterval)
            // Clean up progress after a delay
            setTimeout(() => {
                setOcrProgress((prev) => {
                    const { [fileId]: _, ...rest } = prev
                    return rest
                })
            }, 1000)
        }
    }

    const handleViewOCR = (submittedFile: CategorizedSubmittedFile) => {
        // Always get the latest file data from submittedFiles to ensure we have the most recent OCR result
        const latestFileData = submittedFiles.find((f) => f.id === submittedFile.id) || submittedFile
        console.log('Opening OCR drawer for file:', latestFileData)
        console.log('OCR result:', latestFileData.ocrResult)
        setSelectedFileForOCR(latestFileData)
        setOcrDrawerOpen(true)
    }

    const handleOCRDrawerClose = () => {
        setOcrDrawerOpen(false)
        setSelectedFileForOCR(null)
    }

    const handleOCRRetry = async (fileId: string) => {
        // Set OCR status to processing for retry
        setSubmittedFiles((prev) =>
            prev.map((file) => (file.id === fileId ? { ...file, ocrStatus: 'processing' as const } : file))
        )

        // Initialize progress for this file
        setOcrProgress((prev) => ({ ...prev, [fileId]: 0 }))

        // Simulate progress updates
        const progressInterval = setInterval(() => {
            setOcrProgress((prev) => {
                const currentProgress = prev[fileId] || 0
                if (currentProgress < 90) {
                    return { ...prev, [fileId]: currentProgress + 10 }
                }
                return prev
            })
        }, 300)

        const fileToProcess = submittedFiles.find((f) => f.id === fileId)
        if (!fileToProcess) {
            clearInterval(progressInterval)
            setOcrProgress((prev) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [fileId]: _, ...rest } = prev
                return rest
            })
            return
        }

        try {
            const result = await staffService.ocrFile(fileToProcess.file)

            setOcrProgress((prev) => ({ ...prev, [fileId]: 100 }))

            setTimeout(() => {
                setOcrProgress((prev) => {
                    const { [fileId]: _, ...rest } = prev
                    return rest
                })
            }, 500)

            // Update file with success status and result
            const updatedFiles = submittedFiles.map((file) =>
                file.id === fileId
                    ? {
                          ...file,
                          ocrStatus: 'success' as const,
                          ocrResult: result,
                          status: 'completed' as const
                      }
                    : file
            )

            setSubmittedFiles(updatedFiles)

            // Update the selected file for OCR if it's the same file
            if (selectedFileForOCR && selectedFileForOCR.id === fileId) {
                setSelectedFileForOCR({
                    ...selectedFileForOCR,
                    ocrStatus: 'success',
                    ocrResult: result,
                    status: 'completed'
                })
            }

            notifications.show({
                title: 'Thành công',
                message: 'OCR đã được xử lý lại thành công',
                color: 'green'
            })
        } catch (error) {
            console.error('OCR retry error:', error)

            // Update file with failed status
            const updatedFiles = submittedFiles.map((file) =>
                file.id === fileId
                    ? {
                          ...file,
                          ocrStatus: 'failed' as const,
                          ocrError: error instanceof Error ? error.message : 'OCR retry failed'
                      }
                    : file
            )

            setSubmittedFiles(updatedFiles)

            // Update the selected file for OCR if it's the same file
            if (selectedFileForOCR && selectedFileForOCR.id === fileId) {
                setSelectedFileForOCR({
                    ...selectedFileForOCR,
                    ocrStatus: 'failed',
                    ocrError: error instanceof Error ? error.message : 'OCR retry failed'
                })
            }

            notifications.show({
                title: 'Lỗi',
                message: 'Không thể xử lý lại OCR',
                color: 'red'
            })
        } finally {
            clearInterval(progressInterval)
            // Clean up progress after a delay
            setTimeout(() => {
                setOcrProgress((prev) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [fileId]: _, ...rest } = prev
                    return rest
                })
            }, 1000)
        }
    }

    const handleOCRResultUpdate = (updatedResult: CommonOCRRes<EditedOCRRes>) => {
        if (!selectedFileForOCR) return

        setSubmittedFiles((prev) =>
            prev.map((file) =>
                file.id === selectedFileForOCR.id
                    ? {
                          ...file,
                          ocrResult: updatedResult,
                          ocrStatus: 'success' as const,
                          status: 'completed' as const
                      }
                    : file
            )
        )
    }

    // Function to check if any file is currently processing OCR
    const isAnyFileProcessingOCR = () => {
        return submittedFiles.some((file) => file.ocrStatus === 'processing')
    }

    // Function to check and update OCR error based on OCR results
    useEffect(() => {
        const filesWithOCR = submittedFiles.filter((file) => file.ocrResult && file.ocrStatus === 'success')

        if (filesWithOCR.length > 0) {
            // If there are files with OCR results, clear the OCR error
            setOcrError(null)
        }
    }, [submittedFiles])

    const handleSaveFiles = async () => {
        if (submittedFiles.length === 0) {
            notifications.show({
                title: 'Lỗi',
                message: 'Vui lòng chọn ít nhất một file',
                color: 'red'
            })
            return
        }

        // Check if at least one file has OCR result
        //const filesWithOCR = submittedFiles.filter((file) => file.ocrResult && file.ocrStatus === 'success')

        // if (filesWithOCR.length === 0) {
        //     console.error('Error log: Must perform at least one OCR result to generate labcode')
        //     setOcrError('Phải thực hiện ít nhất một OCR để tạo mã xét nghiệm labcode')
        //     return
        // }

        // Clear OCR error if validation passes
        setOcrError(null)

        // Validate submitted files and categories - ensure data integrity
        if (submittedFiles.length === 0) {
            notifications.show({
                title: 'Lỗi',
                message: 'Không có file nào để upload',
                color: 'red'
            })
            return
        }

        // Ensure all submitted files have valid categories and file names
        const validSubmittedFiles = submittedFiles.filter(
            (sf) => sf.file && sf.file.name && sf.category && Object.values(FileCategory).includes(sf.category)
        )

        console.log('Debug - submittedFiles before filtering:', submittedFiles)
        console.log('Debug - validSubmittedFiles after filtering:', validSubmittedFiles)

        if (validSubmittedFiles.length !== submittedFiles.length) {
            console.error('Some files failed validation:', {
                totalFiles: submittedFiles.length,
                validFiles: validSubmittedFiles.length,
                invalidFiles: submittedFiles.filter(
                    (sf) =>
                        !sf.file || !sf.file.name || !sf.category || !Object.values(FileCategory).includes(sf.category)
                )
            })
            notifications.show({
                title: 'Lỗi dữ liệu',
                message: 'Một số file không có thông tin phân loại hợp lệ',
                color: 'red'
            })
            return
        }

        const fileArray = validSubmittedFiles.map((sf) => sf.file)
        const categoryArray = validSubmittedFiles.map((sf) => ({
            category: sf.category || FileCategory.GENERAL, // Additional safety check
            priority: sf.priority || 5,
            fileName: sf.file?.name || 'unknown-file' // Additional safety check
        }))

        console.log('Debug - categoryArray:', categoryArray)

        // Additional validation for categoryArray
        const invalidCategories = categoryArray.filter((cat) => !cat.category || !cat.fileName)
        if (invalidCategories.length > 0) {
            console.error('Invalid categories detected:', invalidCategories)
            notifications.show({
                title: 'Lỗi dữ liệu',
                message: 'Dữ liệu phân loại file không hợp lệ',
                color: 'red'
            })
            return
        }

        const validation = bypassPrescriptionCheck 
            ? validateCategorizedFilesWithBypass(fileArray, categoryArray, submittedFiles)
            : validateCategorizedFiles(fileArray, categoryArray, submittedFiles)
        if (!validation.isValid) {
            notifications.show({
                title: 'Lỗi validation',
                message: validation.globalErrors[0] || 'Có lỗi trong dữ liệu file',
                color: 'red'
            })
            return
        }

        setIsSaving(true)

        try {
            // Prepare OCR results for files that have them
            const ocrResults: OCRResultDto[] = validSubmittedFiles
                .map((file, index) => {
                    if (file.ocrResult && file.ocrStatus === 'success') {
                        // Extract the actual OCR data from the nested structure
                        const actualOcrData = file.ocrResult.ocrResult || file.ocrResult

                        return {
                            fileIndex: Number(index), // Ensure it's a proper integer
                            category: file.category, // Already validated above
                            ocrData: actualOcrData, // Use the extracted data, not the full response
                            confidence: file.ocrResult.confidence || 0.95
                        }
                    }
                    return null
                })
                .filter(Boolean) as OCRResultDto[]

            console.log('Debug - ocrResults:', ocrResults)

            const uploadParams = {
                files: validSubmittedFiles.map((sf) => sf.file),
                patientId: parseInt(patientId),
                typeLabSession: typeLabSession,
                fileCategories: categoryArray,
                // Only include ocrResults if there are actual OCR results
                ...(ocrResults.length > 0 ? { ocrResults } : {}),
                labcode: ['O5123A', 'N5456B'] // Use the same labcode as the old implementation
            }

            console.log('Debug - uploadParams:', uploadParams)

            let result
            if (bypassPrescriptionCheck) {
                // Use uploadResultRequisition API for test results (bypass workflow)
                const resultParams = {
                    files: validSubmittedFiles.map((sf) => sf.file),
                    patientId: parseInt(patientId),
                    typeLabSession: 'result_test' // Use 'result_test' for test results
                }
                console.log('Debug - using uploadResultRequisition with params:', resultParams)
                result = await uploadResultMutation.mutateAsync(resultParams)
            } else {
                // Use regular categorized upload for examinations
                result = await uploadMutation.mutateAsync(uploadParams)
            }

            const uploadCount = result.data?.uploadedFilesCount || result.uploadedFilesCount || validSubmittedFiles.length

            notifications.show({
                title: 'Thành công',
                message: `Upload thành công ${uploadCount} file`,
                color: 'green'
            })

            navigate(`/patient-detail/${patientId}`)
        } catch (error) {
            console.error('Upload error:', error)

            // Try to extract detailed error information
            let errorMessage = 'Không thể upload file'
            if (error && typeof error === 'object') {
                const apiError = error as any
                if (apiError.errorData && apiError.errorData.message) {
                    if (Array.isArray(apiError.errorData.message)) {
                        console.error('Backend validation errors:', apiError.errorData.message)
                        errorMessage = `Lỗi validation: ${apiError.errorData.message.join(', ')}`
                    } else {
                        console.error('Backend error message:', apiError.errorData.message)
                        errorMessage = `Lỗi: ${apiError.errorData.message}`
                    }
                }
            }

            notifications.show({
                title: 'Lỗi',
                message: errorMessage,
                color: 'red'
            })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <>
            <Container size='xl' py='xl'>
                <Center mb='xl'>
                    <div>
                        <Title order={1} ta='center' mb='sm'>
                            {skipOCR ? 'Tải lên kết quả xét nghiệm' : 'Tạo lần khám mới'}
                        </Title>
                    </div>
                </Center>
                <Button
                    mb='xl'
                    leftSection={<IconArrowNarrowLeft size={16} />}
                    onClick={() => navigate(`/patient-detail/${patientId}`)}
                >
                    Quay lại hồ sơ bệnh nhân
                </Button>

                {/* File Import and Categorization Section */}
                <ImportStep
                    selectedFiles={selectedFiles}
                    fileCategories={fileCategories}
                    submittedFiles={submittedFiles}
                    error={error}
                    skipOCR={skipOCR}
                    skipCategorization={bypassPrescriptionCheck}
                    bypassPrescriptionCheck={bypassPrescriptionCheck}
                    ocrProgress={ocrProgress}
                    validationResult={validationResult}
                    onFileDrop={handleFileDrop}
                    onCategoryChange={handleCategoryChange}
                    onRemoveFile={handleRemoveFile}
                    onSubmitFiles={handleSubmitFiles}
                    onStartOCR={handleOCRClick}
                    onViewOCR={handleViewOCR}
                    onDeleteSubmittedFile={handleDeleteSubmittedFile}
                />

                {/* Save Files Button */}
                {submittedFiles.length > 0 && (
                    <Paper p='lg' withBorder mt='xl'>
                        {isAnyFileProcessingOCR() && (
                            <Alert variant='light' color='orange' mb='md'>
                                <Text size='sm'>
                                    <strong>Chưa thể lưu:</strong> Đang xử lý OCR, vui lòng chờ hoàn thành.
                                </Text>
                            </Alert>
                        )}
                        {ocrError && (
                            <Alert variant='light' color='red' mb='md'>
                                <Text size='sm'>
                                    <strong>Lỗi:</strong> {ocrError}
                                </Text>
                            </Alert>
                        )}
                        <Group justify='right' mb='md'>
                            <Button
                                size='lg'
                                leftSection={<IconDeviceFloppy size={20} />}
                                onClick={handleSaveFiles}
                                loading={isSaving}
                                disabled={isSaving || isAnyFileProcessingOCR()}
                                color={!isAnyFileProcessingOCR() ? 'green' : 'gray'}
                                style={{ minWidth: 200 }}
                            >
                                {isSaving
                                    ? 'Đang lưu...'
                                    : isAnyFileProcessingOCR()
                                      ? 'Đang xử lý OCR...'
                                      : `Lưu ${submittedFiles.length} file`}
                            </Button>
                        </Group>
                    </Paper>
                )}
            </Container>

            {/* OCR Drawer */}
            <Drawer
                opened={ocrDrawerOpen}
                onClose={handleOCRDrawerClose}
                position='right'
                size='80%'
                title='OCR Result'
                closeOnClickOutside={false}
                closeOnEscape={false}
            >
                {selectedFileForOCR && (
                    <OCRDrawer
                        file={selectedFileForOCR}
                        ocrResult={selectedFileForOCR.ocrResult}
                        ocrProgress={ocrProgress[selectedFileForOCR.id] || 0}
                        onUpdate={handleOCRResultUpdate}
                        onClose={handleOCRDrawerClose}
                        onRetryOCR={() => handleOCRRetry(selectedFileForOCR.id)}
                    />
                )}
            </Drawer>
        </>
    )
}

export default InputInfoPage
