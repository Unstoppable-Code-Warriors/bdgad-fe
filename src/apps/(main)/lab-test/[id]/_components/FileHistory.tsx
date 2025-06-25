import { Paper, Stack, Group, Title, Badge, Table, Text, ActionIcon } from '@mantine/core'
import { IconFileDescription, IconEye, IconDownload } from '@tabler/icons-react'
import { statusConfig } from '@/types/lab-test.types'
import type { FastQ } from '@/types/fastq'

interface FileHistoryProps {
    fastqFiles?: FastQ[]
}

export const FileHistory = ({ fastqFiles }: FileHistoryProps) => {
    const getStatusColor = (status: string) => {
        return statusConfig[status as keyof typeof statusConfig]?.color || 'gray'
    }

    const getStatusLabel = (status: string) => {
        return statusConfig[status as keyof typeof statusConfig]?.label || status
    }

    const handleDownload = (file: FastQ) => {
        const link = document.createElement('a')
        link.href = file.filePath
        link.download = `fastq-${file.id}.fastq`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Paper p='lg' withBorder radius='md' shadow='sm'>
            <Stack gap='md'>
                <Group justify='space-between'>
                    <Title order={3} c='gray.7'>
                        Lịch sử File FastQ
                    </Title>
                    <Badge variant='light' color='gray'>
                        {fastqFiles?.length || 0} file(s)
                    </Badge>
                </Group>

                {fastqFiles && fastqFiles.length > 0 ? (
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>File ID</Table.Th>
                                <Table.Th>Trạng thái</Table.Th>
                                <Table.Th>Ngày tạo</Table.Th>
                                <Table.Th>Người tạo</Table.Th>
                                <Table.Th>Lý do làm lại</Table.Th>
                                <Table.Th>Thao tác</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {fastqFiles.map((file) => (
                                <Table.Tr key={file.id}>
                                    <Table.Td>
                                        <Text fw={500} ff='monospace'>
                                            #{file.id}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge color={getStatusColor(file.status)} variant='light' size='sm'>
                                            {getStatusLabel(file.status)}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size='sm'>{new Date(file.createdAt).toLocaleDateString('vi-VN')}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size='sm'>{file.creator.name}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size='sm' c={file.redoReason ? 'red' : 'dimmed'}>
                                            {file.redoReason || '-'}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap='xs'>
                                            <ActionIcon
                                                variant='light'
                                                color='blue'
                                                size='sm'
                                                onClick={() => window.open(file.filePath, '_blank')}
                                            >
                                                <IconEye size={14} />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant='light'
                                                color='teal'
                                                size='sm'
                                                onClick={() => handleDownload(file)}
                                            >
                                                <IconDownload size={14} />
                                            </ActionIcon>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                ) : (
                    <Paper p='xl' bg='gray.0' radius='sm'>
                        <Stack align='center' gap='sm'>
                            <IconFileDescription size={48} color='var(--mantine-color-gray-5)' />
                            <Text c='dimmed' ta='center'>
                                Chưa có file FastQ nào trong lịch sử
                            </Text>
                        </Stack>
                    </Paper>
                )}
            </Stack>
        </Paper>
    )
}
