import { Stack, Group, Title, Badge, Text, Card, ActionIcon, Button } from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import { IconFileDescription, IconUpload, IconFile, IconTrash, IconDownload } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { statusConfig } from '@/types/lab-test.types'
import { labTestService } from '@/services/function/lab-test'
import type { FastqFilePair } from '@/types/fastq'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDeleteFastQPair } from '@/services/hook/lab-test.hook'
import { modals } from '@mantine/modals'

interface FileUploadProps {
    sessionId: number
    latestFastqFilePair?: FastqFilePair | null
    fastqFilePairs?: FastqFilePair[]
    onUploadSuccess?: () => void
    r1File?: File | null
    r2File?: File | null
    onR1FileDrop: (file: File | null) => void
    onR2FileDrop: (file: File | null) => void
}

export const FileUpload = ({
    sessionId,
    latestFastqFilePair,
    fastqFilePairs = [],
    onUploadSuccess,
    r1File,
    r2File,
    onR1FileDrop,
    onR2FileDrop
}: FileUploadProps) => {
    const [isUploading, setIsUploading] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const queryClient = useQueryClient()
    const deleteFastQPairMutation = useDeleteFastQPair()

    const getCurrentStatus = () => {
        return latestFastqFilePair?.status || 'not_uploaded'
    }

    const getStatusLabel = (status: string) => {
        return statusConfig[status as keyof typeof statusConfig]?.label || status
    }

    const getStatusColor = (status: string) => {
        return statusConfig[status as keyof typeof statusConfig]?.color || 'gray'
    }

    // Show dropzone when:
    // 1. No FastQ file pairs exist
    // 2. Latest status is rejected
    // 3. Latest status is not_uploaded (allowing re-upload)
    const shouldShowDropzone = () => {
        if (fastqFilePairs.length === 0) return true
        if (!latestFastqFilePair) return true

        const status = latestFastqFilePair.status
        return status === 'rejected' || status === 'not_uploaded'
    }

    const canModifyFiles = () => {
        const status = getCurrentStatus()
        return status === 'uploaded' || status === 'rejected' || status === 'not_uploaded'
    }

    const handleFileUpload = async () => {
        if (!r1File || !r2File) {
            notifications.show({
                title: 'Lỗi',
                message: 'Vui lòng chọn đúng 2 file FASTQ (R1 và R2)',
                color: 'red'
            })
            return
        }

        try {
            setIsUploading(true)
            await labTestService.uploadFastQPair(sessionId, [r1File, r2File])

            // Manually invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['lab-test-session-detail', sessionId.toString()] })
            queryClient.invalidateQueries({ queryKey: ['lab-test-sessions'] })

            notifications.show({
                title: 'Tải file thành công',
                message: '2 file FASTQ đã được tải lên thành công',
                color: 'green'
            })

            // Clear uploaded files and call success callback
            onUploadSuccess?.()
        } catch (error: any) {
            notifications.show({
                title: 'Lỗi tải file',
                message: error.message || 'Có lỗi xảy ra khi tải file lên',
                color: 'red'
            })
        } finally {
            setIsUploading(false)
        }
    }

    const handleDownload = async (fileId: number) => {
        try {
            setIsDownloading(true)
            const response = await labTestService.downloadFastQ(fileId)
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

    const handleDelete = () => {
        if (!latestFastqFilePair) return

        // Check if file can be deleted (only uploaded status)
        if (latestFastqFilePair.status !== 'uploaded') {
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
                    Bạn có chắc chắn muốn xóa cặp file FastQ #{latestFastqFilePair.id}? Hành động này không thể hoàn
                    tác.
                </Text>
            ),
            labels: { confirm: 'Xóa', cancel: 'Hủy' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                deleteFastQPairMutation.mutate(latestFastqFilePair.id, {
                    onSuccess: () => {
                        notifications.show({
                            title: 'Xóa file thành công',
                            message: `Cặp file FastQ #${latestFastqFilePair.id} đã được xóa`,
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

    return (
        <Card shadow='sm' padding='xl' radius='lg' withBorder>
            <Stack gap='lg'>
                <Group gap='sm'>
                    <IconFileDescription size={24} color='var(--mantine-color-teal-6)' />
                    <div>
                        <Title order={4}>Tải lên cặp file FastQ</Title>
                        <Text size='xs' c='dimmed'>
                            Tải lên file R1 và R2 riêng biệt để đảm bảo thứ tự chính xác
                        </Text>
                    </div>
                </Group>

                {shouldShowDropzone() ? (
                    <>
                        <Card p='sm' withBorder bg='blue.0'>
                            <Text size='sm' c='blue.7' ta='center'>
                                💡 <strong>Hướng dẫn:</strong> Tải lên từng file riêng biệt để đảm bảo thứ tự đúng R1 và
                                R2
                            </Text>
                        </Card>

                        {/* R1 File Upload Section */}
                        <Card p='md' withBorder>
                            <Stack gap='md'>
                                <Group gap='sm'>
                                    <IconFile size={20} color='var(--mantine-color-blue-6)' />
                                    <Text fw={500} size='sm'>
                                        R1 File (Forward reads)
                                    </Text>
                                </Group>

                                {r1File ? (
                                    <Card p='sm' withBorder bg='green.0'>
                                        <Group justify='space-between'>
                                            <Group gap='sm'>
                                                <IconFile size={16} />
                                                <Text size='sm'>{r1File.name}</Text>
                                                <Badge color='green' size='xs'>
                                                    R1
                                                </Badge>
                                            </Group>
                                            <ActionIcon
                                                variant='light'
                                                color='red'
                                                size='sm'
                                                onClick={() => onR1FileDrop(null)}
                                                disabled={isUploading || isDownloading}
                                            >
                                                <IconTrash size={14} />
                                            </ActionIcon>
                                        </Group>
                                    </Card>
                                ) : (
                                    <Dropzone
                                        onDrop={(files) => files.length > 0 && onR1FileDrop(files[0])}
                                        accept={{
                                            'application/gzip': ['.gz'],
                                            'text/plain': ['.fastq', '.fq'],
                                            'application/x-gzip': ['.gz'],
                                            'application/octet-stream': ['.fastq', '.fq', '.gz']
                                        }}
                                        multiple={false}
                                        disabled={isUploading || isDownloading}
                                        maxFiles={1}
                                    >
                                        <Group justify='center' gap='sm' mih={80} style={{ pointerEvents: 'none' }}>
                                            <Dropzone.Accept>
                                                <IconUpload size={32} color='var(--mantine-color-blue-6)' />
                                            </Dropzone.Accept>
                                            <Dropzone.Reject>
                                                <IconFile size={32} color='var(--mantine-color-red-6)' />
                                            </Dropzone.Reject>
                                            <Dropzone.Idle>
                                                <IconFileDescription size={32} color='var(--mantine-color-dimmed)' />
                                            </Dropzone.Idle>
                                            <div>
                                                <Text size='sm' inline>
                                                    Kéo thả file R1 vào đây hoặc click để chọn
                                                </Text>
                                                <Text size='xs' c='dimmed' inline mt={4}>
                                                    File R1 thường có tên chứa "_R1_", "_1.", hoặc "_forward"
                                                </Text>
                                            </div>
                                        </Group>
                                    </Dropzone>
                                )}
                            </Stack>
                        </Card>

                        {/* R2 File Upload Section */}
                        <Card p='md' withBorder>
                            <Stack gap='md'>
                                <Group gap='sm'>
                                    <IconFile size={20} color='var(--mantine-color-orange-6)' />
                                    <Text fw={500} size='sm'>
                                        R2 File (Reverse reads)
                                    </Text>
                                </Group>

                                {r2File ? (
                                    <Card p='sm' withBorder bg='green.0'>
                                        <Group justify='space-between'>
                                            <Group gap='sm'>
                                                <IconFile size={16} />
                                                <Text size='sm'>{r2File.name}</Text>
                                                <Badge color='orange' size='xs'>
                                                    R2
                                                </Badge>
                                            </Group>
                                            <ActionIcon
                                                variant='light'
                                                color='red'
                                                size='sm'
                                                onClick={() => onR2FileDrop(null)}
                                                disabled={isUploading || isDownloading}
                                            >
                                                <IconTrash size={14} />
                                            </ActionIcon>
                                        </Group>
                                    </Card>
                                ) : (
                                    <Dropzone
                                        onDrop={(files) => files.length > 0 && onR2FileDrop(files[0])}
                                        accept={{
                                            'application/gzip': ['.gz'],
                                            'text/plain': ['.fastq', '.fq'],
                                            'application/x-gzip': ['.gz'],
                                            'application/octet-stream': ['.fastq', '.fq', '.gz']
                                        }}
                                        multiple={false}
                                        disabled={isUploading || isDownloading}
                                        maxFiles={1}
                                    >
                                        <Group justify='center' gap='sm' mih={80} style={{ pointerEvents: 'none' }}>
                                            <Dropzone.Accept>
                                                <IconUpload size={32} color='var(--mantine-color-orange-6)' />
                                            </Dropzone.Accept>
                                            <Dropzone.Reject>
                                                <IconFile size={32} color='var(--mantine-color-red-6)' />
                                            </Dropzone.Reject>
                                            <Dropzone.Idle>
                                                <IconFileDescription size={32} color='var(--mantine-color-dimmed)' />
                                            </Dropzone.Idle>
                                            <div>
                                                <Text size='sm' inline>
                                                    Kéo thả file R2 vào đây hoặc click để chọn
                                                </Text>
                                                <Text size='xs' c='dimmed' inline mt={4}>
                                                    File R2 thường có tên chứa "_R2_", "_2.", hoặc "_reverse"
                                                </Text>
                                            </div>
                                        </Group>
                                    </Dropzone>
                                )}
                            </Stack>
                        </Card>

                        {/* Upload Button */}
                        {r1File && r2File ? (
                            <Button
                                leftSection={<IconUpload size={16} />}
                                onClick={handleFileUpload}
                                loading={isUploading}
                                size='md'
                                fullWidth
                                color='green'
                            >
                                Tải lên cặp file FastQ (R1 & R2)
                            </Button>
                        ) : (
                            <Button
                                leftSection={<IconUpload size={16} />}
                                onClick={() => {
                                    const missingFiles = []
                                    if (!r1File) missingFiles.push('R1')
                                    if (!r2File) missingFiles.push('R2')

                                    notifications.show({
                                        title: 'Thiếu file',
                                        message: `Vui lòng chọn file ${missingFiles.join(' và ')} để hoàn thành cặp FastQ`,
                                        color: 'orange'
                                    })
                                }}
                                size='md'
                                fullWidth
                                variant='light'
                                color='orange'
                                disabled
                            >
                                Cần chọn {!r1File && !r2File ? 'cả R1 và R2' : !r1File ? 'file R1' : 'file R2'}
                            </Button>
                        )}
                    </>
                ) : (
                    /* Show latest FastQ file pair information */
                    latestFastqFilePair && (
                        <Card p='md' withBorder>
                            <Stack gap='md'>
                                <Group justify='space-between'>
                                    <Group gap='sm'>
                                        <IconFile size={24} color='var(--mantine-color-teal-6)' />
                                        <div>
                                            <Text fw={500} size='sm'>
                                                Cặp file FastQ #{latestFastqFilePair.id}
                                            </Text>
                                            <Text size='xs' c='dimmed'>
                                                Tạo ngày:{' '}
                                                {new Date(latestFastqFilePair.createdAt).toLocaleDateString('vi-VN')}
                                            </Text>
                                        </div>
                                    </Group>
                                    <Badge color={getStatusColor(latestFastqFilePair.status)} variant='light'>
                                        {getStatusLabel(latestFastqFilePair.status)}
                                    </Badge>
                                </Group>

                                <Stack gap='xs'>
                                    <Text size='sm' fw={500}>
                                        Files trong cặp:
                                    </Text>
                                    <Group gap='md'>
                                        <Button
                                            variant='light'
                                            size='xs'
                                            leftSection={<IconDownload size={14} />}
                                            onClick={() => handleDownload(latestFastqFilePair.fastqFileR1.id)}
                                            loading={isDownloading}
                                        >
                                            R1 File
                                        </Button>
                                        <Button
                                            variant='light'
                                            size='xs'
                                            leftSection={<IconDownload size={14} />}
                                            onClick={() => handleDownload(latestFastqFilePair.fastqFileR2.id)}
                                            loading={isDownloading}
                                        >
                                            R2 File
                                        </Button>
                                    </Group>
                                </Stack>

                                <Group gap='sm'>
                                    <Text size='sm' c='dimmed'>
                                        Tạo bởi: {latestFastqFilePair.creator.name}
                                    </Text>
                                </Group>

                                {latestFastqFilePair.rejector && (
                                    <Text size='sm' c='red'>
                                        Từ chối bởi: {latestFastqFilePair.rejector.name}
                                    </Text>
                                )}

                                {latestFastqFilePair.redoReason && (
                                    <Text size='sm' c='red'>
                                        Lý do làm lại: {latestFastqFilePair.redoReason}
                                    </Text>
                                )}

                                {canModifyFiles() && (
                                    <Group gap='sm' mt='md'>
                                        {latestFastqFilePair.status === 'uploaded' && (
                                            <Button
                                                variant='light'
                                                color='red'
                                                leftSection={<IconTrash size={16} />}
                                                onClick={handleDelete}
                                                loading={deleteFastQPairMutation.isPending}
                                                size='sm'
                                            >
                                                Xóa cặp file
                                            </Button>
                                        )}
                                    </Group>
                                )}
                            </Stack>
                        </Card>
                    )
                )}
            </Stack>
        </Card>
    )
}
