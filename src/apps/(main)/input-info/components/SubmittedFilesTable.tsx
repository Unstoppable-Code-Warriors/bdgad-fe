import type { FileWithPath } from '@mantine/dropzone'
import { Card, Stack, Group, Text, Badge, Table, Image, ActionIcon, Box, Button, Loader, Progress } from '@mantine/core'
import { IconScan, IconEye, IconTrash, IconDownload, IconRefresh } from '@tabler/icons-react'
import { getFileIcon, getFileTypeLabel, formatFileSize } from '../utils/fileUtils'
import type { CategorizedSubmittedFile } from '@/types/categorized-upload'

interface SubmittedFilesTableProps {
    files: CategorizedSubmittedFile[]
    ocrProgress: { [fileId: string]: number }
    skipOCR?: boolean
    onStartOCR: (fileId: string) => void
    onViewOCR?: (submittedFile: CategorizedSubmittedFile) => void
    onDelete: (id: string) => void
}

const SubmittedFilesTable = ({
    files,
    ocrProgress,
    skipOCR = false,
    onStartOCR,
    onViewOCR,
    onDelete
}: SubmittedFilesTableProps) => {
    if (files.length === 0) return null

    const handleDownload = (file: FileWithPath) => {
        const url = URL.createObjectURL(file)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        a.click()
        URL.revokeObjectURL(url)
    }
    const getOCRButton = (submittedFile: CategorizedSubmittedFile) => {
        if (skipOCR) return null

        if (submittedFile.type !== 'image') return null

        const isAnyFileProcessing = files.some((file) => file.ocrStatus === 'processing')
        const isThisFileProcessing = submittedFile.ocrStatus === 'processing'

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
            const progress = ocrProgress[submittedFile.id] || 0
            return (
                <Stack gap='xs' align='left' style={{ width: 120 }}>
                    <Button
                        size='sm'
                        variant='light'
                        color='blue'
                        leftSection={<Loader size={14} />}
                        disabled
                        loading
                        w='100%'
                    >
                        Đang xử lý...
                    </Button>

                    <Progress value={progress} size='sm' color='blue' w='100%' />
                </Stack>
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
                style={{ flexShrink: 0, width: 120 }}
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
                        File đã upload
                    </Text>
                    <Badge color='green' variant='light'>
                        {files.length} file
                    </Badge>
                </Group>

                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>File</Table.Th>
                            <Table.Th>Tên file</Table.Th>
                            <Table.Th>Loại</Table.Th>
                            <Table.Th>Kích thước</Table.Th>
                            <Table.Th>Trạng thái</Table.Th>
                            <Table.Th>Thao tác</Table.Th>
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
                                            Đã tải lên: {submittedFile.uploadedAt}
                                        </Text>
                                    </Stack>
                                </Table.Td>
                                <Table.Td>{getFileTypeLabel(submittedFile.file)}</Table.Td>
                                <Table.Td>
                                    <Text size='sm'>{formatFileSize(submittedFile.file.size)}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Box>{getOCRButton(submittedFile)}</Box>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap='xs' align='center'>
                                        <Group gap='xs' align='center'>
                                            <ActionIcon
                                                variant='light'
                                                color='green'
                                                onClick={() => handleDownload(submittedFile.file)}
                                                title='Tải xuống file'
                                                size='sm'
                                                disabled={files.some((file) => file.ocrStatus === 'processing')}
                                            >
                                                <IconDownload size='1rem' />
                                            </ActionIcon>

                                            <ActionIcon
                                                variant='light'
                                                color='red'
                                                onClick={() => onDelete(submittedFile.id)}
                                                title='Xóa file'
                                                size='sm'
                                                disabled={files.some((file) => file.ocrStatus === 'processing')}
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
