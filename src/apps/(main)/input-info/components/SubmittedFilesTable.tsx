import type { FileWithPath } from '@mantine/dropzone'
import { Card, Stack, Group, Text, Badge, Table, Image, ActionIcon, Box } from '@mantine/core'
import { IconScan, IconTrash, IconDownload } from '@tabler/icons-react'
import { getFileIcon, getFileTypeLabel, formatFileSize } from '../utils/fileUtils'

interface SubmittedFile {
    id: string
    file: FileWithPath
    uploadedAt: string
    status: 'uploaded' | 'processing' | 'completed'
    type: 'image' | 'pdf' | 'document' | 'other'
}

interface SubmittedFilesTableProps {
    files: SubmittedFile[]
    onStartOCR: (file: FileWithPath) => void
    onDelete: (id: string) => void
}

const SubmittedFilesTable = ({ files, onStartOCR, onDelete }: SubmittedFilesTableProps) => {
    if (files.length === 0) return null

    const handleDownload = (file: FileWithPath) => {
        const url = URL.createObjectURL(file)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <Card withBorder padding="md" radius="md">
            <Stack gap="md">
                <Group justify="space-between">
                    <Text size="lg" fw={600} c="green.7">Submitted Files</Text>
                    <Badge color="green" variant="light">
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
                                            width: 100,
                                            height: 100,
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
                                                width={50}
                                                height={50}
                                                fit="cover"
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
                                    <Text size="sm" fw={500}>{submittedFile.file.name}</Text>
                                </Table.Td>
                                <Table.Td>
                                    {getFileTypeLabel(submittedFile.file)}
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm">{formatFileSize(submittedFile.file.size)}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">             
                                        <ActionIcon
                                            variant="light"
                                            color="green"
                                            onClick={() => handleDownload(submittedFile.file)}
                                        >
                                            <IconDownload size="1rem" />
                                        </ActionIcon>
                                        <ActionIcon
                                            variant="light"
                                            color="red"
                                            onClick={() => onDelete(submittedFile.id)}
                                        >
                                            <IconTrash size="1rem" />
                                        </ActionIcon>
                                         {submittedFile.type === 'image' && (
                                            <ActionIcon
                                                variant="light"
                                                color="blue"
                                                onClick={() => onStartOCR(submittedFile.file)}
                                                disabled={submittedFile.status === 'processing'}
                                            >
                                                <IconScan size="1rem" />
                                            </ActionIcon>
                                        )}
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