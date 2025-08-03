import type { FileWithPath } from '@mantine/dropzone'
import { Card, Stack, Group, Text, Badge, Table, Image, ActionIcon, Box, Button, Loader } from '@mantine/core'
import { IconScan, IconEye, IconTrash, IconDownload, IconRefresh } from '@tabler/icons-react'
import { getFileIcon, getFileTypeLabel, formatFileSize } from '../utils/fileUtils'

interface SubmittedFile {
    id: string
    file: FileWithPath
    uploadedAt: string
    status: 'uploaded' | 'processing' | 'completed'
    type: 'image' | 'pdf' | 'document' | 'other'
    ocrResult?: any
    ocrStatus?: 'idle' | 'processing' | 'success' | 'failed'
    ocrError?: string
}

interface SubmittedFilesTableProps {
    files: SubmittedFile[]
    onStartOCR: (fileId: string) => void
    onViewOCR?: (submittedFile: SubmittedFile) => void
    onDelete: (id: string) => void
}

const SubmittedFilesTable = ({ files, onStartOCR, onViewOCR, onDelete }: SubmittedFilesTableProps) => {
    if (files.length === 0) return null

    const handleDownload = (file: FileWithPath) => {
        const url = URL.createObjectURL(file)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        a.click()
        URL.revokeObjectURL(url)
    }
    const getOCRButton = (submittedFile: SubmittedFile) => {
        if (submittedFile.type !== 'image') return null

        // Check if any file is currently processing OCR
        const isAnyFileProcessing = files.some((file) => file.ocrStatus === 'processing')
        const isThisFileProcessing = submittedFile.ocrStatus === 'processing'

        // Show OCR result if available
        if (submittedFile.ocrStatus === 'success' && submittedFile.ocrResult) {
            return (
                <Button
                    size='sm'
                    variant='light'
                    color='green'
                    leftSection={<IconEye size={14} />}
                    onClick={() => onViewOCR?.(submittedFile)}
                >
                    Xem OCR
                </Button>
            )
        }

        // Show retry button if failed
        if (submittedFile.ocrStatus === 'failed') {
            return (
                <Button
                    size='sm'
                    variant='light'
                    color='red'
                    leftSection={<IconRefresh size={14} />}
                    onClick={() => onStartOCR(submittedFile.id)}
                    disabled={isAnyFileProcessing}
                    title={submittedFile.ocrError}
                >
                    Thử lại
                </Button>
            )
        }

        // Show processing state
        if (isThisFileProcessing) {
            return (
                <Button size='sm' variant='light' color='blue' leftSection={<Loader size={14} />} disabled loading>
                    Đang xử lý...
                </Button>
            )
        }

        // Show OCR button
        return (
            <Button
                size='sm'
                variant='light'
                color='blue'
                leftSection={<IconScan size={14} />}
                onClick={() => onStartOCR(submittedFile.id)}
                disabled={isAnyFileProcessing}
            >
                OCR
            </Button>
        )
    }

    return (
        <Card withBorder padding='md' radius='md'>
            <Stack gap='md'>
                <Group justify='space-between'>
                    <Text size='lg' fw={600} c='green.7'>
                        Submitted Files
                    </Text>
                    <Badge color='green' variant='light'>
                        {files.length} file(s)
                    </Badge>
                </Group>

                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Preview</Table.Th>
                            <Table.Th>File Name</Table.Th>
                            <Table.Th>Type</Table.Th>
                            <Table.Th>Size</Table.Th>
                            <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {files.map((submittedFile) => (
                            <Table.Tr key={submittedFile.id}>
                                <Table.Td>
                                    <Box
                                        style={{
                                            width: 60,
                                            height: 60,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        {submittedFile.type === 'image' ? (
                                            <Image
                                                src={URL.createObjectURL(submittedFile.file)}
                                                alt={submittedFile.file.name}
                                                width={60}
                                                height={60}
                                                fit='cover'
                                                style={{
                                                    objectFit: 'cover',
                                                    width: '100%',
                                                    height: '100%'
                                                }}
                                            />
                                        ) : (
                                            getFileIcon(submittedFile.file)
                                        )}
                                    </Box>
                                </Table.Td>
                                <Table.Td>
                                    <Stack gap={2}>
                                        <Text size='sm' fw={500} lineClamp={1}>
                                            {submittedFile.file.name}
                                        </Text>
                                        <Text size='xs' c='dimmed'>
                                            Uploaded: {submittedFile.uploadedAt}
                                        </Text>
                                    </Stack>
                                </Table.Td>
                                <Table.Td>{getFileTypeLabel(submittedFile.file)}</Table.Td>
                                <Table.Td>
                                    <Text size='sm'>{formatFileSize(submittedFile.file.size)}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap='xs' align='center' style={{ minHeight: 36 }}>
                                        <Box style={{ width: 120, flexShrink: 0, marginRight: 45 }}>
                                            {getOCRButton(submittedFile)}
                                        </Box>

                                        <Group gap='xs' align='center'>
                                            <ActionIcon
                                                variant='light'
                                                color='green'
                                                onClick={() => handleDownload(submittedFile.file)}
                                                title='Download file'
                                                size='sm'
                                            >
                                                <IconDownload size='1rem' />
                                            </ActionIcon>

                                            <ActionIcon
                                                variant='light'
                                                color='red'
                                                onClick={() => onDelete(submittedFile.id)}
                                                title='Delete file'
                                                size='sm'
                                            >
                                                <IconTrash size='1rem' />
                                            </ActionIcon>
                                        </Group>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Stack>
        </Card>
    )
}

export default SubmittedFilesTable
