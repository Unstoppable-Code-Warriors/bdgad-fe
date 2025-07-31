import { useState, useEffect } from 'react'
import type { FileWithPath } from '@mantine/dropzone'
import { Stack, Alert, Text, Paper, Group, Badge } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { modals } from '@mantine/modals'

import FileUploadZone from './FileUploadZone'
import SelectedFilesList from './SelectedFilesList'
import SubmitButton from './SubmitButton'
import SubmittedFilesTable from './SubmittedFilesTable'
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
}

const ImportStep = ({ onFilesSubmitted }: ImportStepProps) => {
    const [selectedFiles, setSelectedFiles] = useState<FileWithPath[]>([])
    const [submittedFiles, setSubmittedFiles] = useState<SubmittedFile[]>([])
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
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
            type: getFileType(file)
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

    const handleOCRClick = (file: File) => {
        const fileToOCR = submittedFiles.find((f) => f.file === file)

        navigate('/input-info/ocr', {
            state: {
                file: file,
                fileId: fileToOCR?.id,
                patientId: location.state?.patientId || location.state?.patient?.id,
                typeLabSession: 'test',
                returnPath: '/import-file/input',
                returnState: location.state,
                submittedFiles: submittedFiles
            }
        })
    }

    const handleViewOCR = (ocrData: any) => {
        modals.open({
            title: 'OCR Results',
            size: 'xl',
            children: (
                <Stack gap='md'>
                    <Text size='sm' c='dimmed'>
                        OCR processing results for the medical requisition
                    </Text>

                    <Paper p='md' withBorder>
                        <Stack gap='sm'>
                            <Group>
                                <Text fw={600}>Patient Name:</Text>
                                <Text>{ocrData.ocrResult?.full_name || 'N/A'}</Text>
                            </Group>
                            <Group>
                                <Text fw={600}>Doctor:</Text>
                                <Text>{ocrData.ocrResult?.doctor || 'N/A'}</Text>
                            </Group>
                            <Group>
                                <Text fw={600}>Clinic:</Text>
                                <Text>{ocrData.ocrResult?.clinic || 'N/A'}</Text>
                            </Group>
                            <Group>
                                <Text fw={600}>Test Code:</Text>
                                <Text>{ocrData.ocrResult?.['Test code'] || 'N/A'}</Text>
                            </Group>
                            <Group>
                                <Text fw={600}>Sample Date:</Text>
                                <Text>{ocrData.ocrResult?.sample_collection_date || 'N/A'}</Text>
                            </Group>
                        </Stack>
                    </Paper>

                    {/* Show selected tests */}
                    {ocrData.ocrResult?.non_invasive_prenatal_testing?.test_options && (
                        <Paper p='md' withBorder>
                            <Text fw={600} mb='sm'>
                                Selected Tests:
                            </Text>
                            <Stack gap='xs'>
                                {ocrData.ocrResult.non_invasive_prenatal_testing.test_options
                                    .filter((test: any) => test.is_selected)
                                    .map((test: any, index: number) => (
                                        <Badge key={index} variant='light' color='blue'>
                                            {test.package_name}
                                        </Badge>
                                    ))}
                            </Stack>
                        </Paper>
                    )}
                </Stack>
            )
        })
    }

    return (
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
    )
}

export default ImportStep
