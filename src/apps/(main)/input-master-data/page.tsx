import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Container, Stack } from '@mantine/core'
import PageHeader from './components/PageHeader'
import FileStatistics from './components/FileStatistics'
import FileGrid from './components/FileGrid'

// Mock data for import files
const mockImportFiles = [
    {
        id: 'f1',
        name: 'Patient_Master_Data.xlsx',
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

const InputMasterDataPage = () => {
    const navigate = useNavigate()
    const [files, setFiles] = useState<any[]>(mockImportFiles)

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
        console.log('Start import process...')
    }

    const handleNavigateToUpload = () => {
        navigate('/import-file/input')
    }

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <PageHeader 
                    onNavigateToUpload={handleNavigateToUpload}
                    onImport={handleImport}
                />

                <FileStatistics totalFiles={files.length} />

                <FileGrid
                    files={files}
                    onViewFile={handleViewFile}
                    onDownloadFile={handleDownloadFile}
                    onDeleteFile={handleDeleteFile}
                />
            </Stack>
        </Container>
    )
}

export default InputMasterDataPage