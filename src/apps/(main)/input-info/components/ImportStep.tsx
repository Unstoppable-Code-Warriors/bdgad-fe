import type { FileWithPath } from '@mantine/dropzone'
import { Stack } from '@mantine/core'
import type { CategorizedSubmittedFile } from '@/types/categorized-upload'

import FileUploadZone from './FileUploadZone'
import SubmittedFilesTable from './SubmittedFilesTable'

interface ImportStepProps {
    submittedFiles: CategorizedSubmittedFile[]
    error: string | null
    ocrProgress: { [fileId: string]: number }
    onFileDrop: (files: FileWithPath[]) => void
    onStartOCR: (fileId: string) => void
    onViewOCR: (submittedFile: CategorizedSubmittedFile) => void
    onDeleteSubmittedFile: (id: string) => void
}

const ImportStep = ({
    submittedFiles,
    ocrProgress,
    onFileDrop,
    onStartOCR,
    onViewOCR,
    onDeleteSubmittedFile
}: ImportStepProps) => {
    return (
        <Stack gap='lg' mt='xl'>

            <FileUploadZone onDrop={onFileDrop} />

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
