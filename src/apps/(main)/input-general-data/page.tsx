import { useState, useEffect } from 'react'
import { Container, Stack } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import PageHeader from './components/PageHeader'
import FileStatistics from './components/FileStatistics'
import FileGrid from './components/FileGrid'
import ImportFileModal from './components/ImportFileModal'
import { staffService } from '@/services/function/staff'

type FileWithPath = File & { path?: string }

const InputGeneralDataPage = () => {
    const [files, setFiles] = useState<any[]>([])
    const [importModalOpened, setImportModalOpened] = useState(false)
    const [, setLoading] = useState(false)

    // Load files on component mount
    useEffect(() => {
        loadFiles()
    }, [])

    const loadFiles = async () => {
        try {
            setLoading(true)
            const response = await staffService.getAllGeneralFiles()
            setFiles(response.data || response || [])
        } catch (error) {
            console.error('Error loading files:', error)
            notifications.show({
                title: 'Error',
                message: 'Failed to load files',
                color: 'red'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleViewFile = async (fileId: string) => {
        try {
            const fileData = await staffService.getGeneralFile(fileId)
            console.log('File data:', fileData)
            // Handle file viewing logic here
        } catch (error) {
            console.error('Error viewing file:', error)
            notifications.show({
                title: 'Error',
                message: 'Failed to view file',
                color: 'red'
            })
        }
    }

    const handleDownloadFile = async (fileId: string) => {
        try {
            const blob = await staffService.downloadGeneralFile(fileId)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `file-${fileId}`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            
            notifications.show({
                title: 'Success',
                message: 'File downloaded successfully',
                color: 'green'
            })
        } catch (error) {
            console.error('Error downloading file:', error)
            notifications.show({
                title: 'Error',
                message: 'Failed to download file',
                color: 'red'
            })
        }
    }

    const handleDeleteFile = async (fileId: string) => {
        try {
            await staffService.deleteGeneralFile(fileId)
            setFiles(prev => prev.filter(file => file.id !== fileId))
            
            notifications.show({
                title: 'Success',
                message: 'File deleted successfully',
                color: 'green'
            })
        } catch (error) {
            console.error('Error deleting file:', error)
            notifications.show({
                title: 'Error',
                message: 'Failed to delete file',
                color: 'red'
            })
        }
    }

    const handleImport = () => {
        setImportModalOpened(true)
    }

    const handleImportFiles = async (uploadedFiles: FileWithPath[]) => {
        try {
            setLoading(true)
            
            // Upload each file using the API
            const uploadPromises = uploadedFiles.map(file => 
                staffService.uploadGeneralFile(file)
            )
            
            await Promise.all(uploadPromises)
            
            // Reload files after successful upload
            await loadFiles()
            
            notifications.show({
                title: 'Success',
                message: `${uploadedFiles.length} file(s) uploaded successfully`,
                color: 'green'
            })
            
            setImportModalOpened(false)
        } catch (error) {
            console.error('Error uploading files:', error)
            notifications.show({
                title: 'Error',
                message: 'Failed to upload files',
                color: 'red'
            })
        } finally {
            setLoading(false)
        }
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