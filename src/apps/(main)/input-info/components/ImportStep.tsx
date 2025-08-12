import type { FileWithPath } from '@mantine/dropzone'
import { Stack, Paper, Alert, Text, Group } from '@mantine/core'
import type { CategorizedSubmittedFile, FileCategoryDto } from '@/types/categorized-upload'
import { FileCategory } from '@/types/categorized-upload'

import FileUploadZone from './FileUploadZone'
import { FileCategorizationList } from './FileCategorizationList'
import SubmittedFilesTable from './SubmittedFilesTable'
import SubmitButton from './SubmitButton'

interface ImportStepProps {
    selectedFiles: FileWithPath[]
    fileCategories: FileCategoryDto[]
    submittedFiles: CategorizedSubmittedFile[]
    error: string | null
    skipOCR?: boolean
    skipCategorization?: boolean
    bypassPrescriptionCheck?: boolean
    ocrProgress: { [fileId: string]: number }
    validationResult: {
        isValid: boolean
        errors: { [index: number]: string }
        globalErrors: string[]
        summary: string
    }
    onFileDrop: (files: FileWithPath[]) => void
    onCategoryChange: (index: number, category: FileCategory) => void
    onRemoveFile: (index: number) => void
    onSubmitFiles: () => void
    onStartOCR: (fileId: string) => void
    onViewOCR: (submittedFile: CategorizedSubmittedFile) => void
    onDeleteSubmittedFile: (id: string) => void
}

const ImportStep = ({
    selectedFiles,
    fileCategories,
    submittedFiles,
    skipOCR = false,
    skipCategorization = false,
    bypassPrescriptionCheck = false,
    ocrProgress,
    validationResult,
    onFileDrop,
    onCategoryChange,
    onRemoveFile,
    onSubmitFiles,
    onStartOCR,
    onViewOCR,
    onDeleteSubmittedFile
}: ImportStepProps) => {
    return (
        <Stack gap='lg' mt='xl'>
            <FileUploadZone onDrop={onFileDrop} existingFiles={submittedFiles} />

            {/* File Categorization Step */}
            {selectedFiles.length > 0 && (
                <Paper p='lg' withBorder mt='md'>
                    {!skipCategorization && (
                        <>
                            <FileCategorizationList
                                files={selectedFiles}
                                fileCategories={fileCategories}
                                validationErrors={validationResult.errors}
                                onCategoryChange={onCategoryChange}
                                onRemove={onRemoveFile}
                            />

                            {/* Validation Summary */}
                            {validationResult.globalErrors.length > 0 && (
                                <Alert variant='light' color='red' mt='md'>
                                    <Stack gap='xs'>
                                        {validationResult.globalErrors.map((error, index) => (
                                            <Text key={index} size='sm'>
                                                {error}
                                            </Text>
                                        ))}
                                    </Stack>
                                </Alert>
                            )}

                            <Group justify='center' mt='md'>
                                <Text size='sm' c={validationResult.isValid ? 'green' : 'red'}>
                                    {validationResult.summary}
                                </Text>
                            </Group>

                            {/* Continue Button - Hide for auto-submit uploads */}
                            {!bypassPrescriptionCheck && (
                                <SubmitButton fileCount={selectedFiles.length} onSubmit={onSubmitFiles} />
                            )}
                        </>
                    )}

                    {skipCategorization && (
                        <Group justify='center' mb='md'>
                            <Text size='sm' c='green'>
                                ✓ Sẵn sàng tải lên {selectedFiles.length} file kết quả xét nghiệm (không cần phân loại)
                            </Text>
                        </Group>
                    )}

                    {/* Continue Button for skip categorization mode */}
                    {skipCategorization && !bypassPrescriptionCheck && (
                        <SubmitButton fileCount={selectedFiles.length} onSubmit={onSubmitFiles} />
                    )}
                </Paper>
            )}

            <SubmittedFilesTable
                files={submittedFiles}
                ocrProgress={ocrProgress}
                skipOCR={skipOCR}
                onStartOCR={onStartOCR}
                onViewOCR={onViewOCR}
                onDelete={onDeleteSubmittedFile}
            />
        </Stack>
    )
}

export default ImportStep
