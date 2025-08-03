import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Container, Center, Title, Select, Paper, Stack, Button, Group, Drawer } from '@mantine/core'
import { IconMicroscope, IconClipboardCheck, IconDeviceFloppy, IconArrowNarrowLeft } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import type { FileWithPath } from '@mantine/dropzone'
import { useUploadMedicalTestRequisition } from '@/services/hook/staff-upload.hook'
import { staffService } from '@/services/function/staff'
import { getFileType } from './utils/fileUtils'
import type { SubmittedFile, EditedOCRRes } from './types'
import type { CommonOCRRes } from '@/types/ocr-file'
import ImportStep from './components/ImportStep'
import OCRDrawer from './components/OCRDrawer'

const InputInfoPage = () => {
    const [typeLabSession, setTypeLabSession] = useState<string>('test')
    const [submittedFiles, setSubmittedFiles] = useState<SubmittedFile[]>([])
    const [selectedFiles, setSelectedFiles] = useState<FileWithPath[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [ocrDrawerOpen, setOcrDrawerOpen] = useState(false)
    const [selectedFileForOCR, setSelectedFileForOCR] = useState<SubmittedFile | null>(null)
    const [ocrProgress, setOcrProgress] = useState<{ [fileId: string]: number }>({})
    const location = useLocation()
    const navigate = useNavigate()

    const patientId = location.state?.patientId || location.state?.patient?.id

    const uploadMutation = useUploadMedicalTestRequisition()

    useEffect(() => {
        if (location.state?.ocrResult) {
            handleOCRComplete(location.state.ocrResult)
        }
        if (location.state?.submittedFiles) {
            console.log('Restoring submitted files from OCR:', location.state.submittedFiles)
            setSubmittedFiles(location.state.submittedFiles)
        }
    }, [location.state])

    const handleOCRComplete = (data: CommonOCRRes<EditedOCRRes>) => {
        console.log('OCR completed:', data)
        // The OCR complete handling is now done inline
    }

    // File handling functions
    const handleFileDrop = (files: FileWithPath[]) => {
        setSelectedFiles((prev) => [...prev, ...files])
        setError(null)
    }

    const handleRemoveFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSubmitFiles = () => {
        if (selectedFiles.length === 0) {
            setError('Please select at least one file')
            return
        }

        const newSubmittedFiles: SubmittedFile[] = selectedFiles.map((file) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            file,
            uploadedAt: new Date().toLocaleString('vi-VN'),
            status: 'uploaded',
            type: getFileType(file),
            ocrStatus: 'idle'
        }))

        const updatedSubmittedFiles = [...submittedFiles, ...newSubmittedFiles]
        setSubmittedFiles(updatedSubmittedFiles)
        setSelectedFiles([])
        setError(null)
    }

    const handleDeleteSubmittedFile = (id: string) => {
        const updatedSubmittedFiles = submittedFiles.filter((f) => f.id !== id)
        setSubmittedFiles(updatedSubmittedFiles)
    }

    // OCR functions
    const handleOCRClick = async (fileId: string) => {
        // Set OCR status to processing for this file
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
            // Call OCR API
            const result = await staffService.ocrFile(fileToProcess.file)

            // Complete progress
            setOcrProgress((prev) => ({ ...prev, [fileId]: 100 }))

            // Small delay to show 100% progress
            setTimeout(() => {
                setOcrProgress((prev) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [fileId]: _, ...rest } = prev
                    return rest
                })
            }, 1000)
        }
    }

    const handleViewOCR = (submittedFile: SubmittedFile) => {
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
            // Call OCR API
            const result = await staffService.ocrFile(fileToProcess.file)

            // Complete progress
            setOcrProgress((prev) => ({ ...prev, [fileId]: 100 }))

            // Small delay to show 100% progress
            setTimeout(() => {
                setOcrProgress((prev) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const handleSaveFiles = async () => {
        if (submittedFiles.length === 0) {
            notifications.show({
                title: 'Lỗi',
                message: 'Vui lòng chọn ít nhất một file',
                color: 'red'
            })
            return
        }

        setIsSaving(true)

        try {
            // Include OCR results in the upload
            const ocrResults = submittedFiles.filter((file) => file.ocrResult).map((file) => file.ocrResult)

            const formData = {
                files: submittedFiles.map((sf) => sf.file),
                patientId: parseInt(patientId),
                typeLabSession: typeLabSession,
                ocrResult: ocrResults.length > 0 ? JSON.stringify(ocrResults[0]) : undefined
            }

            await uploadMutation.mutateAsync(formData)

            notifications.show({
                title: 'Thành công',
                message: 'Upload file thành công',
                color: 'green'
            })

            navigate(`/patient-detail/${patientId}`)
        } catch (error) {
            console.error('Upload error:', error)
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể upload file',
                color: 'red'
            })
        } finally {
            setIsSaving(false)
        }
    }

    const sessionTypeOptions = [
        {
            value: 'test',
            label: 'Xét nghiệm',
            icon: <IconMicroscope size={16} />
        },
        {
            value: 'validation',
            label: 'Thẩm định',
            icon: <IconClipboardCheck size={16} />
        }
    ]

    return (
        <>
            <Container size='xl' py='xl'>
                <Center mb='xl'>
                    <div>
                        <Title order={1} ta='center' mb='sm'>
                            Tạo lần khám mới
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

                {/* Session Type Selection */}
                <Paper p='lg' withBorder mb='xl' style={{ margin: '0 auto' }}>
                    <Stack gap='md'>
                        <Select
                            label='Loại lần khám'
                            placeholder='Chọn loại lần khám'
                            value={typeLabSession}
                            onChange={(value) => setTypeLabSession(value || 'test')}
                            data={sessionTypeOptions.map((option) => ({
                                value: option.value,
                                label: option.label
                            }))}
                            size='md'
                            required
                            leftSection={
                                typeLabSession === 'test' ? (
                                    <IconMicroscope size={16} />
                                ) : (
                                    <IconClipboardCheck size={16} />
                                )
                            }
                        />
                    </Stack>
                </Paper>

                {/* File Import Section */}
                <ImportStep
                    selectedFiles={selectedFiles}
                    submittedFiles={submittedFiles}
                    error={error}
                    ocrProgress={ocrProgress}
                    onFileDrop={handleFileDrop}
                    onRemoveFile={handleRemoveFile}
                    onSubmitFiles={handleSubmitFiles}
                    onStartOCR={handleOCRClick}
                    onViewOCR={handleViewOCR}
                    onDeleteSubmittedFile={handleDeleteSubmittedFile}
                />

                {/* Save Files Button */}
                {submittedFiles.length > 0 && (
                    <Paper p='lg' withBorder mt='xl'>
                        <Group justify='right' mb='md'>
                            <Button
                                size='lg'
                                leftSection={<IconDeviceFloppy size={20} />}
                                onClick={handleSaveFiles}
                                loading={isSaving}
                                disabled={isSaving}
                                color='green'
                                style={{ minWidth: 200 }}
                            >
                                {isSaving ? 'Đang lưu...' : `Lưu ${submittedFiles.length} file`}
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
