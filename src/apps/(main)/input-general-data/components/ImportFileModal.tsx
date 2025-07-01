import { useState } from 'react'
import { Modal, Stack, Text, Button, Group } from '@mantine/core'
import { IconUpload, IconFile, IconX } from '@tabler/icons-react'
import { Dropzone } from '@mantine/dropzone'

type FileWithPath = File & { path?: string }

interface ImportFileModalProps {
    opened: boolean
    onClose: () => void
    onImport: (files: FileWithPath[]) => void
}

const ImportFileModal = ({ opened, onClose, onImport }: ImportFileModalProps) => {
    const [selectedFiles, setSelectedFiles] = useState<FileWithPath[]>([])
    const [isUploading, setIsUploading] = useState(false)

    const handleFileDrop = (files: FileWithPath[]) => {
        setSelectedFiles(files)
    }

    const handleImport = async () => {
        if (selectedFiles.length === 0) return
        
        setIsUploading(true)
        try {
            await onImport(selectedFiles)
            setSelectedFiles([])
            onClose()
        } catch (error) {
            console.error('Import failed:', error)
        } finally {
            setIsUploading(false)
        }
    }

    const handleClose = () => {
        setSelectedFiles([])
        onClose()
    }

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title="Tải lên file mới"
            size="lg"
        >
            <Stack gap="md">
                <Dropzone
                    onDrop={handleFileDrop}
                    onReject={(files) => console.log('rejected files', files)}
                    accept={{
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                        'application/vnd.ms-excel': ['.xls'],
                        'text/csv': ['.csv'],
                        'application/pdf': ['.pdf'],
                        'text/plain': ['.txt']
                    }}
                    maxSize={10 * 1024 * 1024} // 10MB
                >
                    <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                        <Dropzone.Accept>
                            <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <IconFile size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
                        </Dropzone.Idle>

                        <div>
                            <Text size="xl" inline>
                                Kéo thả file vào đây hoặc nhấp để chọn file
                            </Text>
                            <Text size="sm" c="dimmed" inline mt={7}>
                                Hỗ trợ các định dạng: .xlsx, .xls, .csv, .pdf, .txt (tối đa 10MB)
                            </Text>
                        </div>
                    </Group>
                </Dropzone>

                {selectedFiles.length > 0 && (
                    <Stack gap="xs">
                        <Text size="sm" fw={500}>File đã chọn:</Text>
                        {selectedFiles.map((file, index) => (
                            <Group key={index} justify="space-between" p="xs" style={{ 
                                border: '1px solid var(--mantine-color-gray-3)', 
                                borderRadius: 'var(--mantine-radius-sm)',
                                backgroundColor: 'var(--mantine-color-gray-0)'
                            }}>
                                <Group>
                                    <IconFile size={16} color="var(--mantine-color-blue-6)" />
                                    <div>
                                        <Text size="sm">{file.name}</Text>
                                        <Text size="xs" c="dimmed">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </Text>
                                    </div>
                                </Group>
                                <Button
                                    variant="subtle"
                                    color="red"
                                    size="xs"
                                    onClick={() => removeFile(index)}
                                >
                                    <IconX size={14} />
                                </Button>
                            </Group>
                        ))}
                    </Stack>
                )}

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={handleClose}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={selectedFiles.length === 0 || isUploading}
                        loading={isUploading}
                        leftSection={<IconUpload size={16} />}
                    >
                        Tải lên và Import
                    </Button>
                </Group>
            </Stack>
        </Modal>
    )
}

export default ImportFileModal