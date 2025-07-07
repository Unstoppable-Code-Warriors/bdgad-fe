import { useState, useEffect } from 'react'
import { Container, Stack, Modal, Text, Button, Group } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { modals } from '@mantine/modals'
import PageHeader from './components/PageHeader'
import FileStatistics from './components/FileStatistics'
import FileGrid from './components/FileGrid'
import ImportFileModal from './components/ImportFileModal'
import { staffService } from '@/services/function/staff'

type FileWithPath = File & { path?: string }

const InputGeneralDataPage = () => {
    const [files, setFiles] = useState<any[]>([])
    const [importModalOpened, setImportModalOpened] = useState(false)
    const [loading, setLoading] = useState(false)
    const [viewModalOpened, setViewModalOpened] = useState(false)
    const [selectedFile, setSelectedFile] = useState<any>(null)

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
                title: 'Lỗi',
                message: 'Không thể tải danh sách tệp tin',
                color: 'red'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleViewFile = async (fileId: string) => {
        try {
            const fileData = await staffService.getGeneralFile(fileId)
            setSelectedFile(fileData.data || fileData)
            setViewModalOpened(true)
        } catch (error) {
            console.error('Error viewing file:', error)
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể xem thông tin tệp tin',
                color: 'red'
            })
        }
    }

    const handleDownloadFile = async (fileId: string) => {
        try {
            const blob = await staffService.downloadGeneralFile(fileId)
            
            // Find file info for better filename
            const fileInfo = files.find(f => f.id === fileId)
            const fileName = fileInfo?.fileName || `file-${fileId}`
            
            // Create download link
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = fileName
            document.body.appendChild(a)
            a.click()
            
            // Cleanup
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            
            notifications.show({
                title: 'Thành công',
                message: 'Tệp tin đã được tải xuống thành công',
                color: 'green'
            })
        } catch (error) {
            console.error('Error downloading file:', error)
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể tải xuống tệp tin',
                color: 'red'
            })
        }
    }

    const handleDeleteFile = async (fileId: string) => {
        try {
            await staffService.deleteGeneralFile(fileId)
            setFiles(prev => prev.filter(file => file.id !== fileId))
            
            notifications.show({
                title: 'Thành công',
                message: 'Tệp tin đã được xóa thành công',
                color: 'green'
            })
        } catch (error) {
            console.error('Error deleting file:', error)
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể xóa tệp tin',
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
                title: 'Thành công',
                message: `${uploadedFiles.length} tệp tin đã được tải lên thành công`,
                color: 'green'
            })
            
            setImportModalOpened(false)
        } catch (error) {
            console.error('Error uploading files:', error)
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể tải lên tệp tin',
                color: 'red'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <PageHeader onImport={handleImport} />

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

                {/* File View Modal */}
                <Modal
                    opened={viewModalOpened}
                    onClose={() => setViewModalOpened(false)}
                    title="Thông tin tệp tin"
                    size="md"
                >
                    {selectedFile && (
                        <Stack gap="md">
                            <Group>
                                <Text fw={500}>Tên tệp:</Text>
                                <Text>{selectedFile.fileName}</Text>
                            </Group>
                            <Group>
                                <Text fw={500}>Loại tệp:</Text>
                                <Text>{selectedFile.fileType}</Text>
                            </Group>
                            <Group>
                                <Text fw={500}>Kích thước:</Text>
                                <Text>{(Number(selectedFile.fileSize) / 1024).toFixed(2)} KB</Text>
                            </Group>
                            <Group>
                                <Text fw={500}>Đường dẫn:</Text>
                                <Text>{selectedFile.filePath}</Text>
                            </Group>
                            <Group>
                                <Text fw={500}>Ngày tải lên:</Text>
                                <Text>{new Date(selectedFile.uploadedAt).toLocaleString('vi-VN')}</Text>
                            </Group>
                            
                            <Group justify="flex-end" mt="md">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setViewModalOpened(false)}
                                >
                                    Đóng
                                </Button>
                                <Button 
                                    onClick={() => handleDownloadFile(selectedFile.id)}
                                >
                                    Tải xuống
                                </Button>
                            </Group>
                        </Stack>
                    )}
                </Modal>
            </Stack>
        </Container>
    )
}

export default InputGeneralDataPage