import { Paper, Stack, Group, Title, Badge, Table, Text, ActionIcon, Button } from '@mantine/core'
import { IconFileDescription, IconDownload, IconTrash, IconEye } from '@tabler/icons-react'
import { statusConfig } from '@/types/lab-test.types'
import { labTestService } from '@/services/function/lab-test'
import { notifications } from '@mantine/notifications'
import { modals } from '@mantine/modals'
import type { FastQ } from '@/types/fastq'
import { useState } from 'react'
import { useDeleteFastQ } from '@/services/hook/lab-test.hook'

interface FileHistoryProps {
    fastqFiles?: FastQ[]
}

export const FileHistory = ({ fastqFiles }: FileHistoryProps) => {
    const [isDownloading, setIsDownloading] = useState(false)
    const deleteFastQMutation = useDeleteFastQ()

    const getStatusColor = (status: string) => {
        return statusConfig[status as keyof typeof statusConfig]?.color || 'gray'
    }

    const getStatusLabel = (status: string) => {
        return statusConfig[status as keyof typeof statusConfig]?.label || status
    }

    const handleDownload = async (file: FastQ) => {
        try {
            setIsDownloading(true)
            const response = await labTestService.downloadFastQ(file.id)
            // Open the download URL in a new window/tab
            window.open(response.downloadUrl, '_blank')
        } catch (error: any) {
            notifications.show({
                title: 'Lỗi tải file',
                message: error.message || 'Không thể tạo link tải xuống',
                color: 'red'
            })
        } finally {
            setIsDownloading(false)
        }
    }

    const handleDelete = (file: FastQ) => {
        // Check if file can be deleted (only uploaded status)
        if (file.status !== 'uploaded') {
            notifications.show({
                title: 'Không thể xóa file',
                message: 'Chỉ có thể xóa file có trạng thái "Đã tải lên"',
                color: 'orange'
            })
            return
        }

        modals.openConfirmModal({
            title: 'Xóa file FastQ',
            children: (
                <Text size='sm'>
                    Bạn có chắc chắn muốn xóa file FastQ #{file.id}? Hành động này không thể hoàn tác.
                </Text>
            ),
            labels: { confirm: 'Xóa', cancel: 'Hủy' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                deleteFastQMutation.mutate(file.id, {
                    onSuccess: () => {
                        notifications.show({
                            title: 'Xóa file thành công',
                            message: `File FastQ #${file.id} đã được xóa`,
                            color: 'green'
                        })
                    },
                    onError: (error: any) => {
                        notifications.show({
                            title: 'Lỗi xóa file',
                            message: error.message || 'Không thể xóa file FastQ',
                            color: 'red'
                        })
                    }
                })
            }
        })
    }

    const handleViewReason = (file: FastQ) => {
        modals.open({
            title: 'Chi tiết từ chối',
            children: (
                <Stack gap='md'>
                    <Text size='sm' fw={500}>
                        File FastQ #{file.id}
                    </Text>
                    <Text size='sm'>{file.redoReason || 'Không có lý do được ghi nhận'}</Text>
                    {file.rejector && (
                        <Stack gap='xs'>
                            <Text size='sm' fw={500} c='red'>
                                Người từ chối:
                            </Text>
                            <Text size='sm'>
                                {file.rejector.name} ({file.rejector.email})
                            </Text>
                        </Stack>
                    )}
                    <Group justify='flex-end' mt='md'>
                        <Button variant='light' onClick={() => modals.closeAll()}>
                            Đóng
                        </Button>
                    </Group>
                </Stack>
            )
        })
    }

    const canDeleteFile = (file: FastQ) => {
        return file.status === 'uploaded'
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
                                <Table.Th>Người từ chối</Table.Th>
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
                                        {file.rejector ? (
                                            <Text size='sm'>{file.rejector.name}</Text>
                                        ) : (
                                            <Text size='sm' c='dimmed'>
                                                -
                                            </Text>
                                        )}
                                    </Table.Td>
                                    <Table.Td>
                                        {file.redoReason ? (
                                            <Button
                                                variant='light'
                                                color='orange'
                                                size='xs'
                                                leftSection={<IconEye size={14} />}
                                                onClick={() => handleViewReason(file)}
                                            >
                                                Xem lý do
                                            </Button>
                                        ) : (
                                            <Text size='sm' c='dimmed'>
                                                -
                                            </Text>
                                        )}
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap='xs'>
                                            <ActionIcon
                                                variant='light'
                                                color='teal'
                                                size='sm'
                                                onClick={() => handleDownload(file)}
                                                loading={isDownloading}
                                            >
                                                <IconDownload size={14} />
                                            </ActionIcon>
                                            {canDeleteFile(file) && (
                                                <ActionIcon
                                                    variant='light'
                                                    color='red'
                                                    size='sm'
                                                    onClick={() => handleDelete(file)}
                                                    loading={deleteFastQMutation.isPending}
                                                >
                                                    <IconTrash size={14} />
                                                </ActionIcon>
                                            )}
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
