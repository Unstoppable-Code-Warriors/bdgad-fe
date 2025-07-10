import { useCallback, useState } from 'react'
import { Container, Stack, Modal, Text, Button, Group } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import PageHeader from './components/PageHeader'
import FileStatistics from './components/FileStatistics'
import FileGrid from './components/FileGrid'
import ImportFileModal from './components/ImportFileModal'
import {
    useGeneralFiles,
    useDownloadGeneralFile,
    useDeleteGeneralFile,
    useUploadGeneralFile
} from '@/services/hook/staff.hook'

type FileWithPath = File & { path?: string }

const InputGeneralDataPage = () => {
    const [importModalOpened, setImportModalOpened] = useState(false)
    const [viewModalOpened, setViewModalOpened] = useState(false)
    const [selectedFile] = useState<any>(null)

    // Use hooks
    const { data: filesResponse, isLoading } = useGeneralFiles()
    const downloadMutation = useDownloadGeneralFile()
    const deleteMutation = useDeleteGeneralFile()
    const uploadMutation = useUploadGeneralFile()

    const files = filesResponse?.data || filesResponse || []

    const handleDownloadFile = useCallback(async (fileId: string) => {
        try {
            // Fetch the file using the download mutation
            const response = await downloadMutation.mutateAsync(fileId)

            const link = document.createElement('a')
            link.href = response.downloadUrl
            link.download = 'abc.pdf'
            link.click()

            URL.revokeObjectURL(response.downloadUrl);

            notifications.show({
                title: 'Thành công',
                message: 'Tệp tin đã được tải xuống thành công',
                color: 'green'
            })
        } catch (error) {
            console.error('Download failed:', error)
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể tải xuống tệp tin',
                color: 'red'
            })
        }
    }, [])

    const handleDeleteFile = async (fileId: string) => {
        try {
            await deleteMutation.mutateAsync(fileId)
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
            // Upload each file using the mutation
            const uploadPromises = uploadedFiles.map((file) => uploadMutation.mutateAsync(file))

            await Promise.all(uploadPromises)

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
        }
    }

    return (
        <Container size='xl' py='xl'>
            <Stack gap='lg'>
                <PageHeader onImport={handleImport} />

                <FileStatistics totalFiles={files.length} />

                <FileGrid
                    files={files}
                    onDownloadFile={handleDownloadFile}
                    onDeleteFile={handleDeleteFile}
                    loading={isLoading}
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
                    title='Thông tin tệp tin'
                    size='md'
                >
                    {selectedFile && (
                        <Stack gap='md'>
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

                            <Group justify='flex-end' mt='md'>
                                <Button variant='outline' onClick={() => setViewModalOpened(false)}>
                                    Đóng
                                </Button>
                                <Button
                                    onClick={() => handleDownloadFile(selectedFile.id)}
                                    loading={downloadMutation.isPending}
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
