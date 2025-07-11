import { useState } from 'react'
import type { FileWithPath } from '@mantine/dropzone'
import { Stack, Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import FileUploadZone from './FileUploadZone'
import SelectedFilesList from './SelectedFilesList'
import SubmitButton from './SubmitButton'
import SubmittedFilesTable from './SubmittedFilesTable'
import OCRProcessor from './OCRProcessor'
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
}

const ImportStep = ({ onFilesSubmitted, onOCRComplete }: ImportStepProps) => {
    const [selectedFiles, setSelectedFiles] = useState<FileWithPath[]>([])
    const [submittedFiles, setSubmittedFiles] = useState<SubmittedFile[]>([])
    const [currentStep, setCurrentStep] = useState<'upload' | 'ocr'>('upload')
    const [selectedFileForOCR, setSelectedFileForOCR] = useState<FileWithPath | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleFileDrop = (files: FileWithPath[]) => {
        setSelectedFiles(prev => [...prev, ...files])
        setError(null)
    }

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmitFiles = () => {
        if (selectedFiles.length === 0) {
            setError('Please select at least one file')
            return
        }

        const newSubmittedFiles: SubmittedFile[] = selectedFiles.map(file => ({
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

        // Notify parent component about the submitted files
        if (onFilesSubmitted) {
            onFilesSubmitted(updatedSubmittedFiles)
        }
    }

    const handleStartOCR = (file: FileWithPath) => {
        setSelectedFileForOCR(file)
        setCurrentStep('ocr')
    }

    const handleOCRComplete = (data: any) => {
        const updatedSubmittedFiles = submittedFiles.map(f => 
            f.file === selectedFileForOCR 
                ? { ...f, status: 'completed' as const }
                : f
        )
        setSubmittedFiles(updatedSubmittedFiles)
        
        setCurrentStep('upload')
        setSelectedFileForOCR(null)
        
        // Notify parent component about OCR completion
        if (onOCRComplete) {
            onOCRComplete(data)
        }

        // Update parent with new files state
        if (onFilesSubmitted) {
            onFilesSubmitted(updatedSubmittedFiles)
        }
    }

    const handleBackToUpload = () => {
        setCurrentStep('upload')
        setSelectedFileForOCR(null)
    }

    const handleDeleteSubmittedFile = (id: string) => {
        const updatedSubmittedFiles = submittedFiles.filter(f => f.id !== id)
        setSubmittedFiles(updatedSubmittedFiles)
        
        // Update parent component
        if (onFilesSubmitted) {
            onFilesSubmitted(updatedSubmittedFiles)
        }
    }

    // OCR Step
    if (currentStep === 'ocr' && selectedFileForOCR) {
        return (
            <OCRProcessor
                selectedFile={selectedFileForOCR}
                onComplete={handleOCRComplete}
                onBack={handleBackToUpload}
            />
        )
    }

    // Upload Step
    return (
        <Stack gap='lg' mt='xl'>
            {error && (
                <Alert icon={<IconAlertCircle size='1rem' />} color='red' variant='light'>
                    {error}
                </Alert>
            )}

            <FileUploadZone onDrop={handleFileDrop} />
            
            <SelectedFilesList 
                files={selectedFiles} 
                onRemove={handleRemoveFile} 
            />

            <SubmitButton 
                fileCount={selectedFiles.length}
                onSubmit={handleSubmitFiles}
            />

            <SubmittedFilesTable
                files={submittedFiles}
                onStartOCR={handleStartOCR}
                onDelete={handleDeleteSubmittedFile}
            />
        </Stack>
    )
}

export default ImportStep