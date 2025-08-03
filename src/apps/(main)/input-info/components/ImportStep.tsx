import type { FileWithPath } from '@mantine/dropzone'
import { Stack, Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import type { SubmittedFile } from '../types'

import FileUploadZone from './FileUploadZone'
import SelectedFilesList from './SelectedFilesList'
import SubmitButton from './SubmitButton'
import SubmittedFilesTable from './SubmittedFilesTable'

interface ImportStepProps {
    selectedFiles: FileWithPath[]
    submittedFiles: SubmittedFile[]
    error: string | null
    ocrProgress: { [fileId: string]: number }
    onFileDrop: (files: FileWithPath[]) => void
    onRemoveFile: (index: number) => void
    onSubmitFiles: () => void
    onStartOCR: (fileId: string) => void
    onViewOCR: (submittedFile: SubmittedFile) => void
    onDeleteSubmittedFile: (id: string) => void
}

const ImportStep = ({
    selectedFiles,
    submittedFiles,
    error,
    ocrProgress,
    onFileDrop,
    onRemoveFile,
    onSubmitFiles,
    onStartOCR,
    onViewOCR,
    onDeleteSubmittedFile
}: ImportStepProps) => {
    return (
        <Stack gap='lg' mt='xl'>
            {error && (
                <Alert icon={<IconAlertCircle size='1rem' />} color='red' variant='light'>
                    {error}
                </Alert>
            )}

            <FileUploadZone onDrop={onFileDrop} />

            <SelectedFilesList files={selectedFiles} onRemove={onRemoveFile} />

            <SubmitButton fileCount={selectedFiles.length} onSubmit={onSubmitFiles} />

            <SubmittedFilesTable
                files={submittedFiles}
                ocrProgress={ocrProgress}
                onStartOCR={onStartOCR}
                onViewOCR={onViewOCR}
                onDelete={onDeleteSubmittedFile}
            />
        </Stack>
    )
}

export default ImportStep
