import { Card, Text, Badge, Group, Stack, Divider, ThemeIcon, Box, Timeline, Avatar, Button } from '@mantine/core'
import {
    IconFileDescription,
    IconDownload,
    IconTrash,
    IconUser,
    IconClock,
    IconAlertTriangle
} from '@tabler/icons-react'
import { statusConfig } from '@/types/lab-test.types'
import { labTestService } from '@/services/function/lab-test'
import { notifications } from '@mantine/notifications'
import { modals } from '@mantine/modals'
import type { FastqFilePair } from '@/types/fastq'
import { useState } from 'react'
import { useDeleteFastQPair } from '@/services/hook/lab-test.hook'
import { RejectionDisplay } from '@/components/RejectionDisplay'

interface FileHistoryProps {
    fastqFilePairs?: FastqFilePair[]
}

const getStatusColor = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.color || 'gray'
}

const getStatusLabel = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.label || status
}

export const FileHistory = ({ fastqFilePairs }: FileHistoryProps) => {
    const [isDownloading, setIsDownloading] = useState(false)
    const [isDownloadingR2, setIsDownloadingR2] = useState(false)

    const deleteFastQPairMutation = useDeleteFastQPair()

    const handleDownload = async (file: FastqFilePair) => {
        try {
            setIsDownloading(true)
            const response = await labTestService.downloadFastQ(file.fastqFileR1.id)
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

    const handleDownloadR2 = async (file: FastqFilePair) => {
        try {
            setIsDownloadingR2(true)
            const response = await labTestService.downloadFastQ(file.fastqFileR2.id)
            // Open the download URL in a new window/tab
            window.open(response.downloadUrl, '_blank')
        } catch (error: any) {
            notifications.show({
                title: 'Lỗi tải file',
                message: error.message || 'Không thể tạo link tải xuống',
                color: 'red'
            })
        } finally {
            setIsDownloadingR2(false)
        }
    }

    const handleDelete = (file: FastqFilePair) => {
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
            title: 'Xóa cặp file FastQ',
            children: (
                <Text size='sm'>
                    Bạn có chắc chắn muốn xóa cặp file FastQ #{file.id}? Hành động này không thể hoàn tác.
                </Text>
            ),
            labels: { confirm: 'Xóa', cancel: 'Hủy' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                deleteFastQPairMutation.mutate(file.id, {
                    onSuccess: () => {
                        notifications.show({
                            title: 'Xóa file thành công',
                            message: `Cặp file FastQ #${file.id} đã được xóa`,
                            color: 'green'
                        })
                    },
                    onError: (error: any) => {
                        notifications.show({
                            title: 'Lỗi xóa file',
                            message: error.message || 'Không thể xóa cặp file FastQ',
                            color: 'red'
                        })
                    }
                })
            }
        })
    }

    const handleViewReason = (file: FastqFilePair) => {
        modals.open({
            title: (
                <Group gap='sm'>
                    <IconAlertTriangle size={20} color='var(--mantine-color-red-6)' />
                    <Text fw={600} c='red.7'>
                        Chi tiết từ chối
                    </Text>
                </Group>
            ),
            children: (
                <Stack gap='lg'>
                    <Card p='md' bg='red.0' radius='md' withBorder>
                        <Group gap='sm' mb='md'>
                            <Avatar size='md' radius='xl' color='red' variant='light'>
                                <IconUser size={14} />
                            </Avatar>
                            <Box>
                                <Text size='sm' fw={500} c='red.8'>
                                    File FastQ #{file.id}
                                </Text>
                                <Text size='xs' c='red.6'>
                                    Từ chối lúc: {new Date(file.createdAt).toLocaleString('vi-VN')}
                                </Text>
                            </Box>
                        </Group>

                        {file.rejector && (
                            <Box>
                                <Text size='sm' fw={500} c='red.7' mb='xs'>
                                    Người từ chối:
                                </Text>
                                <Group gap='sm'>
                                    <Avatar size='sm' radius='xl' color='red' variant='light'>
                                        <IconUser size={12} />
                                    </Avatar>
                                    <Box>
                                        <Text size='sm' fw={500}>
                                            {file.rejector.name}
                                        </Text>
                                        <Text size='xs' c='dimmed'>
                                            {file.rejector.email}
                                        </Text>
                                    </Box>
                                </Group>
                            </Box>
                        )}
                    </Card>

                    <Box>
                        <Text size='sm' fw={500} mb='xs'>
                            Lý do từ chối:
                        </Text>
                        {file.redoReason ? (
                            <Card p='md' bg='gray.0' radius='md' withBorder>
                                <Text size='sm' style={{ lineHeight: 1.6 }}>
                                    {file.redoReason}
                                </Text>
                            </Card>
                        ) : (
                            <Card p='md' bg='gray.1' radius='md' withBorder style={{ borderStyle: 'dashed' }}>
                                <Group gap='sm'>
                                    <IconAlertTriangle size={16} color='var(--mantine-color-orange-6)' />
                                    <Text size='sm' c='orange.7' fs='italic'>
                                        Không có lý do từ chối được ghi nhận
                                    </Text>
                                </Group>
                            </Card>
                        )}
                    </Box>

                    <Group justify='flex-end' mt='md'>
                        <Button variant='light' onClick={() => modals.closeAll()}>
                            Đóng
                        </Button>
                    </Group>
                </Stack>
            )
        })
    }

    const canDeleteFile = (file: FastqFilePair) => {
        return file.status === 'uploaded'
    }

    if (!fastqFilePairs || fastqFilePairs.length === 0) {
        return (
            <Card shadow='sm' padding='xl' radius='lg' withBorder>
                <Group gap='sm' mb='lg'>
                    <ThemeIcon size='lg' radius='md' variant='light' color='orange'>
                        <IconFileDescription size={20} />
                    </ThemeIcon>
                    <Box>
                        <Text fw={700} size='xl'>
                            Lịch sử File FastQ
                        </Text>
                        <Text size='sm' c='dimmed'>
                            Theo dõi các file FastQ đã tải lên
                        </Text>
                    </Box>
                </Group>
                <Card p='xl' radius='md' bg='gray.0' ta='center'>
                    <Stack align='center' gap='md'>
                        <ThemeIcon size={60} radius='xl' variant='light' color='gray'>
                            <IconFileDescription size={30} />
                        </ThemeIcon>
                        <Text c='dimmed' fw={500}>
                            Chưa có file FastQ nào
                        </Text>
                        <Text size='sm' c='dimmed'>
                            File FastQ sẽ xuất hiện ở đây sau khi được tải lên
                        </Text>
                    </Stack>
                </Card>
            </Card>
        )
    }

    return (
        <Card shadow='sm' padding='xl' radius='lg' withBorder>
            <Group gap='sm' mb='xl'>
                <ThemeIcon size='lg' radius='md' variant='light' color='orange'>
                    <IconFileDescription size={20} />
                </ThemeIcon>
                <Box>
                    <Text fw={700} size='xl'>
                        Lịch sử cặp file FastQ
                    </Text>
                    <Text size='sm' c='dimmed'>
                        {fastqFilePairs.length} cặp file đã được tải lên
                    </Text>
                </Box>
            </Group>

            <Timeline active={fastqFilePairs.length} bulletSize={32} lineWidth={3}>
                {fastqFilePairs.map((file) => (
                    <Timeline.Item
                        key={file.id}
                        bullet={
                            <ThemeIcon size='lg' radius='xl' color={getStatusColor(file.status || '')}>
                                {file.status === 'rejected' ? (
                                    <IconAlertTriangle size={16} />
                                ) : (
                                    <IconFileDescription size={16} />
                                )}
                            </ThemeIcon>
                        }
                        title={
                            <Box w='100%'>
                                <Group gap='sm' mb='sm'>
                                    <Text fw={600} size='md'>
                                        Cặp file FastQ #{file.id}
                                    </Text>
                                    <Badge
                                        color={getStatusColor(file.status || '')}
                                        variant='light'
                                        size='md'
                                        radius='md'
                                    >
                                        {getStatusLabel(file.status || '')}
                                    </Badge>
                                </Group>

                                <Card p='md' radius='md' bg='gray.0' withBorder>
                                    <Stack gap='sm'>
                                        <Group gap='xs'>
                                            <IconClock size={14} color='var(--mantine-color-gray-6)' />
                                            <Text size='sm' c='dimmed'>
                                                Tải lên: {new Date(file.createdAt).toLocaleString('vi-VN')}
                                            </Text>
                                        </Group>

                                        <Group gap='sm'>
                                            <Avatar size='sm' radius='xl' color='blue' variant='light'>
                                                <IconUser size={12} />
                                            </Avatar>
                                            <Stack gap={2}>
                                                <Text size='sm' fw={500}>
                                                    {file.creator.name}
                                                </Text>
                                                <Text size='xs' c='dimmed'>
                                                    {file.creator.email}
                                                </Text>
                                            </Stack>
                                        </Group>

                                        {file.rejector && (
                                            <RejectionDisplay
                                                rejector={file.rejector}
                                                redoReason={file.redoReason}
                                                rejectionDate={file.createdAt}
                                                itemType='File FastQ'
                                                itemId={file.id}
                                                onViewDetails={() => handleViewReason(file)}
                                            />
                                        )}

                                        {/* Action buttons */}
                                        <Divider my='xs' />
                                        <Group gap='sm' justify='flex-end'>
                                            <Button
                                                variant='light'
                                                color='teal'
                                                leftSection={<IconDownload size={16} />}
                                                onClick={() => handleDownload(file)}
                                                loading={isDownloading}
                                                size='sm'
                                                radius='md'
                                            >
                                                R1 file
                                            </Button>

                                            <Button
                                                variant='light'
                                                color='blue'
                                                leftSection={<IconDownload size={16} />}
                                                onClick={() => handleDownloadR2(file)}
                                                loading={isDownloadingR2}
                                                size='sm'
                                                radius='md'
                                            >
                                                R2 file
                                            </Button>

                                            {canDeleteFile(file) && (
                                                <Button
                                                    variant='light'
                                                    color='red'
                                                    leftSection={<IconTrash size={16} />}
                                                    onClick={() => handleDelete(file)}
                                                    loading={deleteFastQPairMutation.isPending}
                                                    size='sm'
                                                    radius='md'
                                                >
                                                    Xóa
                                                </Button>
                                            )}
                                        </Group>
                                    </Stack>
                                </Card>
                            </Box>
                        }
                    />
                ))}
            </Timeline>
        </Card>
    )
}
