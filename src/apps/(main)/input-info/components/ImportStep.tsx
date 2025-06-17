import { useState } from 'react'
import type { FileWithPath } from '@mantine/dropzone'
import { Stack, Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import FileUploadZone from './FileUploadZone'
import SelectedFilesList from './SelectedFilesList'
import SubmitButton from './SubmitButton'
import SubmittedFilesTable from './SubmittedFilesTable'
import SaveButton from './SaveButton'
import OCRProcessor from './OCRProcessor'
import { getFileType } from '../utils/fileUtils'

interface ImportStepProps {
    onComplete?: (data: any) => void
    onSave?: (files: SubmittedFile[]) => void
}

interface SubmittedFile {
    id: string
    file: FileWithPath
    uploadedAt: string
    status: 'uploaded' | 'processing' | 'completed'
    type: 'image' | 'pdf' | 'document' | 'other'
}

const ImportStep = ({ onComplete, onSave }: ImportStepProps) => {
    const [selectedFiles, setSelectedFiles] = useState<FileWithPath[]>([])
    const [submittedFiles, setSubmittedFiles] = useState<SubmittedFile[]>([])
    const [currentStep, setCurrentStep] = useState<'upload' | 'ocr'>('upload')
    const [selectedFileForOCR, setSelectedFileForOCR] = useState<FileWithPath | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)

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

        setSubmittedFiles(prev => [...prev, ...newSubmittedFiles])
        setSelectedFiles([])
        setError(null)

        if (onComplete) {
            onComplete({
                files: newSubmittedFiles
            })
        }
    }

    const handleSaveFiles = async () => {
        if (submittedFiles.length === 0) return

        setIsSaving(true)
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            if (onSave) {
                onSave(submittedFiles)
            }
            
        } catch (error) {
            console.error('Error saving files:', error)
            setError('Failed to save files. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleStartOCR = (file: FileWithPath) => {
        setSelectedFileForOCR(file)
        setCurrentStep('ocr')
    }

    const handleOCRComplete = (data: any) => {
        setSubmittedFiles(prev => prev.map(f => 
            f.file === selectedFileForOCR 
                ? { ...f, status: 'completed' as const }
                : f
        ))
        
        setCurrentStep('upload')
        setSelectedFileForOCR(null)
        
        if (onComplete) {
            onComplete(data)
        }
    }

    const handleBackToUpload = () => {
        setCurrentStep('upload')
        setSelectedFileForOCR(null)
    }

    const handleDeleteSubmittedFile = (id: string) => {
        setSubmittedFiles(prev => prev.filter(f => f.id !== id))
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

            <SaveButton
                fileCount={submittedFiles.length}
                onSave={handleSaveFiles}
                disabled={isSaving}
            />
        </Stack>
    )
}

export default ImportStep