import { useState } from 'react'
import { Container, Stack } from '@mantine/core'
import PageHeader from './components/PageHeader'
import FileStatistics from './components/FileStatistics'
import FileGrid from './components/FileGrid'
import ImportFileModal from './components/ImportFileModal'

type FileWithPath = File & { path?: string }

const mockImportFiles = [
    {
        id: 'f1',
        name: 'Patient_General_Data.xlsx',
        type: 'excel',
        size: '2.5 MB',
        uploadedAt: '2024-01-15'
    },
    {
        id: 'f2',
        name: 'Processed_Patient_Data.xlsx',
        type: 'excel',
        size: '1.8 MB',
        uploadedAt: '2024-01-16'
    },
    {
        id: 'f3',
        name: 'Hospital_Data_Import.csv',
        type: 'csv',
        size: '0.5 MB',
        uploadedAt: '2024-01-17'
    },
    {
        id: 'f4',
        name: 'Import_Report.pdf',
        type: 'pdf',
        size: '1.2 MB',
        uploadedAt: '2024-01-18'
    },
    {
        id: 'f5',
        name: 'Medical_Records_Batch.xlsx',
        type: 'excel',
        size: '5.2 MB',
        uploadedAt: '2024-01-16'
    },
    {
        id: 'f6',
        name: 'Error_Log.txt',
        type: 'text',
        size: '0.8 MB',
        uploadedAt: '2024-01-17'
    }
]

const InputGeneralDataPage = () => {
    const [files, setFiles] = useState<any[]>(mockImportFiles)
    const [importModalOpened, setImportModalOpened] = useState(false)

    const handleViewFile = (fileId: string) => {
        console.log('View file:', fileId)
    }

    const handleDownloadFile = (fileId: string) => {
        console.log('Download file:', fileId)
    }

    const handleDeleteFile = (fileId: string) => {
        setFiles(prev => prev.filter(file => file.id !== fileId))
    }

    const handleImport = () => {
        setImportModalOpened(true)
    }

    const handleImportFiles = async (uploadedFiles: FileWithPath[]) => {
        // Simulate file upload and processing
        const newFiles = uploadedFiles.map((file, index) => ({
            id: `f${files.length + index + 1}`,
            name: file.name,
            type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            uploadedAt: new Date().toISOString().split('T')[0]
        }))

        setFiles(prev => [...prev, ...newFiles])
        console.log('Files imported successfully:', newFiles)
    }

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <PageHeader 
                    onImport={handleImport}
                />

                <FileStatistics totalFiles={files.length} />

                <FileGrid
                    files={files}
                    onViewFile={handleViewFile}
                    onDownloadFile={handleDownloadFile}
                    onDeleteFile={handleDeleteFile}
                />

                <ImportFileModal
                    opened={importModalOpened}
                    onClose={() => setImportModalOpened(false)}
                    onImport={handleImportFiles}
                />
            </Stack>
        </Container>
    )
}

export default InputGeneralDataPage