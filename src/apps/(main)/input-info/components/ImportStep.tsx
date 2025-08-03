import { useState, useEffect } from 'react'
import type { FileWithPath } from '@mantine/dropzone'
import { Stack, Alert, Drawer } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useLocation } from 'react-router'
import { staffService } from '@/services/function/staff'
import { notifications } from '@mantine/notifications'

import FileUploadZone from './FileUploadZone'
import SelectedFilesList from './SelectedFilesList'
import SubmitButton from './SubmitButton'
import SubmittedFilesTable from './SubmittedFilesTable'
import OCRDrawer from './OCRDrawer'
import { getFileType } from '../utils/fileUtils'

interface ImportStepProps {
    onFilesSubmitted?: (files: SubmittedFile[]) => void
    onOCRComplete?: (data: any) => void
}

interface SubmittedFile {
    id: string
    file: FileWithPath
    uploadedAt: string
    status: 'uploaded' | 'processing' | 'completed'
    type: 'image' | 'pdf' | 'document' | 'other'
    ocrResult?: any
    ocrStatus?: 'idle' | 'processing' | 'success' | 'failed'
    ocrError?: string
}

const ImportStep = ({ onFilesSubmitted }: ImportStepProps) => {
    const [selectedFiles, setSelectedFiles] = useState<FileWithPath[]>([])
    const [submittedFiles, setSubmittedFiles] = useState<SubmittedFile[]>([])
    const [error, setError] = useState<string | null>(null)
    const [ocrDrawerOpen, setOcrDrawerOpen] = useState(false)
    const [selectedFileForOCR, setSelectedFileForOCR] = useState<SubmittedFile | null>(null)
    const location = useLocation()

    useEffect(() => {
        if (location.state?.submittedFiles) {
            console.log('Restoring submitted files from OCR:', location.state.submittedFiles)
            setSubmittedFiles(location.state.submittedFiles)

            if (onFilesSubmitted) {
                onFilesSubmitted(location.state.submittedFiles)
            }
        }
    }, [location.state?.submittedFiles, onFilesSubmitted])

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

        if (onFilesSubmitted) {
            onFilesSubmitted(updatedSubmittedFiles)
        }
    }

    const handleDeleteSubmittedFile = (id: string) => {
        const updatedSubmittedFiles = submittedFiles.filter((f) => f.id !== id)
        setSubmittedFiles(updatedSubmittedFiles)

        if (onFilesSubmitted) {
            onFilesSubmitted(updatedSubmittedFiles)
        }
    }

    const handleOCRClick = async (fileId: string) => {
        // Set OCR status to processing for this file
        setSubmittedFiles((prev) =>
            prev.map((file) => (file.id === fileId ? { ...file, ocrStatus: 'processing' as const } : file))
        )

        const fileToProcess = submittedFiles.find((f) => f.id === fileId)
        if (!fileToProcess) return

        try {
            // Call OCR API
            const formData = new FormData()
            formData.append('file', fileToProcess.file)

            const result = await staffService.ocrFile(fileToProcess.file)

            // Update file with success status and result
            setSubmittedFiles((prev) =>
                prev.map((file) =>
                    file.id === fileId
                        ? {
                              ...file,
                              ocrStatus: 'success' as const,
                              ocrResult: result,
                              status: 'completed' as const
                          }
                        : file
                )
            )

            notifications.show({
                title: 'Thành công',
                message: 'OCR đã được xử lý thành công',
                color: 'green'
            })
        } catch (error) {
            console.error('OCR error:', error)

            // Update file with failed status
            setSubmittedFiles((prev) =>
                prev.map((file) =>
                    file.id === fileId
                        ? {
                              ...file,
                              ocrStatus: 'failed' as const,
                              ocrError: error instanceof Error ? error.message : 'OCR processing failed'
                          }
                        : file
                )
            )

            notifications.show({
                title: 'Lỗi',
                message: 'Không thể xử lý OCR',
                color: 'red'
            })
        }

        // Update parent component
        const updatedFiles = submittedFiles.map((file) =>
            file.id === fileId ? { ...file, ocrStatus: 'success' as const } : file
        )
        if (onFilesSubmitted) {
            onFilesSubmitted(updatedFiles)
        }
    }

    const handleViewOCR = (submittedFile: SubmittedFile) => {
        setSelectedFileForOCR(submittedFile)
        setOcrDrawerOpen(true)
    }

    const handleOCRDrawerClose = () => {
        setOcrDrawerOpen(false)
        setSelectedFileForOCR(null)
    }

    const handleOCRResultUpdate = (updatedResult: any) => {
        if (!selectedFileForOCR) return

        setSubmittedFiles((prev) =>
            prev.map((file) => (file.id === selectedFileForOCR.id ? { ...file, ocrResult: updatedResult } : file))
        )

        const updatedFiles = submittedFiles.map((file) =>
            file.id === selectedFileForOCR.id ? { ...file, ocrResult: updatedResult } : file
        )
        if (onFilesSubmitted) {
            onFilesSubmitted(updatedFiles)
        }
    }

    return (
        <>
            <Stack gap='lg' mt='xl'>
                {error && (
                    <Alert icon={<IconAlertCircle size='1rem' />} color='red' variant='light'>
                        {error}
                    </Alert>
                )}

                <FileUploadZone onDrop={handleFileDrop} />

                <SelectedFilesList files={selectedFiles} onRemove={handleRemoveFile} />

                <SubmitButton fileCount={selectedFiles.length} onSubmit={handleSubmitFiles} />

                <SubmittedFilesTable
                    files={submittedFiles}
                    onStartOCR={handleOCRClick}
                    onViewOCR={handleViewOCR}
                    onDelete={handleDeleteSubmittedFile}
                />
            </Stack>

            {/* OCR Drawer */}
            <Drawer
                opened={ocrDrawerOpen}
                onClose={handleOCRDrawerClose}
                position='right'
                size='80%'
                title='OCR Result'
                closeOnClickOutside={false}
                closeOnEscape={true}
            >
                {selectedFileForOCR && (
                    <OCRDrawer
                        file={selectedFileForOCR}
                        onUpdate={handleOCRResultUpdate}
                        onClose={handleOCRDrawerClose}
                    />
                )}
            </Drawer>
        </>
    )
}

export default ImportStep
