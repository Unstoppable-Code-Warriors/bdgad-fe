import { Stack, Group, Title, Badge, Text, Card, ActionIcon, Button, Progress } from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import {
    IconFileDescription,
    IconUpload,
    IconFile,
    IconTrash,
    IconLock,
    IconCloudUpload,
    IconDownload
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { statusConfig } from '@/types/lab-test.types'
import { labTestService } from '@/services/function/lab-test'
import type { FastQ } from '@/types/fastq'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDeleteFastQ } from '@/services/hook/lab-test.hook'
import { modals } from '@mantine/modals'

interface FileUploadProps {
    sessionId: number
    latestFastQFile?: FastQ | null
    fastqFiles?: FastQ[]
    uploadedFiles: File[]
    onFileDrop: (files: File[]) => void
    onRemoveFile: (index: number) => void
    onUploadSuccess?: () => void
}

export const FileUpload = ({
    sessionId,
    latestFastQFile,
    fastqFiles = [],
    uploadedFiles,
    onFileDrop,
    onRemoveFile,
    onUploadSuccess
}: FileUploadProps) => {
    const [isUploading, setIsUploading] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const queryClient = useQueryClient()
    const deleteFastQMutation = useDeleteFastQ()

    const getCurrentStatus = () => {
        return latestFastQFile?.status || 'uploaded'
    }

    const getStatusLabel = (status: string) => {
        return statusConfig[status as keyof typeof statusConfig]?.label || status
    }

    const getStatusColor = (status: string) => {
        return statusConfig[status as keyof typeof statusConfig]?.color || 'gray'
    }

    // Show dropzone only when no FastQ files exist OR when latest status is rejected
    const shouldShowDropzone = () => {
        return fastqFiles.length === 0 || latestFastQFile?.status === 'rejected'
    }

    const canModifyFiles = () => {
        const status = getCurrentStatus()
        return (status === 'uploaded' || status === 'rejected') && !isUploading
    }

    const handleFileDrop = (files: File[]) => {
        // Only allow if status allows modification
        if (!canModifyFiles()) {
            notifications.show({
                title: 'Không thể tải file',
                message: 'Chỉ có thể tải file khi trạng thái cho phép',
                color: 'red'
            })
            return
        }
        // Replace existing files with new file (only allow one file)
        onFileDrop(files.slice(0, 1))
    }

    const handleUpload = async () => {
        if (uploadedFiles.length === 0) {
            notifications.show({
                title: 'Không có file nào',
                message: 'Vui lòng chọn file FastQ để tải lên',
                color: 'orange'
            })
            return
        }

        // Upload the single file
        const file = uploadedFiles[0]

        try {
            setIsUploading(true)
            await labTestService.uploadFastQ(sessionId, file)

            // Manually invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['lab-test-session-detail', sessionId.toString()] })
            queryClient.invalidateQueries({ queryKey: ['lab-test-sessions'] })

            notifications.show({
                title: 'Tải file thành công',
                message: `File ${file.name} đã được tải lên thành công`,
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

    const handleDownload = async () => {
        if (!latestFastQFile) return

        try {
            setIsDownloading(true)
            const response = await labTestService.downloadFastQ(latestFastQFile.id)
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
        if (!latestFastQFile) return

        // Check if file can be deleted (only uploaded status)
        if (latestFastQFile.status !== 'uploaded') {
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
                    Bạn có chắc chắn muốn xóa file FastQ #{latestFastQFile.id}? Hành động này không thể hoàn tác.
                </Text>
            ),
            labels: { confirm: 'Xóa', cancel: 'Hủy' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                deleteFastQMutation.mutate(latestFastQFile.id, {
                    onSuccess: () => {
                        notifications.show({
                            title: 'Xóa file thành công',
                            message: `File FastQ #${latestFastQFile.id} đã được xóa`,
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

    return (
        <Card p='lg' withBorder radius='md' h='fit-content' shadow='sm' pos='sticky'>
            <Stack gap='lg'>
                <Group justify='space-between'>
                    <Group gap='sm'>
                        <IconFileDescription size={20} color='var(--mantine-color-teal-6)' />
                        <Title order={3} c='teal.7'>
                            {shouldShowDropzone() ? 'Tải lên File FastQ' : 'File FastQ hiện tại'}
                        </Title>
                    </Group>
                    {latestFastQFile && (
                        <Badge variant='light' color={getStatusColor(getCurrentStatus())}>
                            Trạng thái: {getStatusLabel(getCurrentStatus())}
                        </Badge>
                    )}
                </Group>

                {/* Show upload progress */}
                {isUploading && (
                    <Stack gap='xs'>
                        <Text size='sm' fw={500}>
                            Đang tải lên file...
                        </Text>
                        <Progress value={100} size='sm' animated />
                    </Stack>
                )}

                {/* Show dropzone when no files or latest is rejected */}
                {shouldShowDropzone() ? (
                    canModifyFiles() ? (
                        <Dropzone
                            onDrop={handleFileDrop}
                            onReject={() => {
                                notifications.show({
                                    title: 'File không hợp lệ',
                                    message: 'Vui lòng chọn file FastQ hợp lệ',
                                    color: 'red'
                                })
                            }}
                            maxSize={100 * 1024 * 1024 * 1024} // 100MB
                            maxFiles={1}
                            accept={['.fastq', '.fq', '.fastq.gz', '.fq.gz']}
                            disabled={isUploading}
                        >
                            <Group justify='center' gap='xl' mih={180} style={{ pointerEvents: 'none' }}>
                                <Dropzone.Accept>
                                    <IconUpload
                                        style={{ width: 52, height: 52, color: 'var(--mantine-color-blue-6)' }}
                                        stroke={1.5}
                                    />
                                </Dropzone.Accept>
                                {/* <Dropzone.Reject>
                                    <IconX
                                        style={{ width: 52, height: 52, color: 'var(--mantine-color-red-6)' }}
                                        stroke={1.5}
                                    />
                                </Dropzone.Reject> */}
                                <Dropzone.Idle>
                                    <IconFile
                                        style={{ width: 52, height: 52, color: 'var(--mantine-color-dimmed)' }}
                                        stroke={1.5}
                                    />
                                </Dropzone.Idle>

                                <div>
                                    <Text size='sm' c='dimmed' inline>
                                        Kéo thả file FastQ vào đây hoặc click để chọn
                                    </Text>
                                    <Text size='sm' c='dimmed' inline mt={15}>
                                        Hỗ trợ: .fastq, .fq, .fastq.gz, .fq.gz (Tối đa 100MB, chỉ 1 file)
                                    </Text>
                                </div>
                            </Group>
                        </Dropzone>
                    ) : (
                        /* Show locked state for non-modifiable statuses */
                        <Card p='xl' bg='gray.0' radius='sm' withBorder style={{ borderStyle: 'dashed' }}>
                            <Stack align='center' gap='md'>
                                <IconLock size={48} color='var(--mantine-color-gray-5)' />
                                <div style={{ textAlign: 'center' }}>
                                    <Text size='lg' fw={500} c='dimmed'>
                                        Không thể tải file trong trạng thái hiện tại
                                    </Text>
                                    <Text size='sm' c='dimmed' mt={4}>
                                        Trạng thái: {getStatusLabel(getCurrentStatus())}
                                    </Text>
                                </div>
                            </Stack>
                        </Card>
                    )
                ) : (
                    /* Show latest FastQ file information */
                    latestFastQFile && (
                        <Card p='md' withBorder>
                            <Stack gap='md'>
                                <Group justify='space-between'>
                                    <Group gap='sm'>
                                        <IconFile size={24} color='var(--mantine-color-teal-6)' />
                                        <div>
                                            <Text fw={500} size='sm'>
                                                FastQ File #{latestFastQFile.id}
                                            </Text>
                                            <Text size='xs' c='dimmed'>
                                                Tạo ngày:{' '}
                                                {new Date(latestFastQFile.createdAt).toLocaleDateString('vi-VN')}
                                            </Text>
                                        </div>
                                    </Group>
                                    <Badge color={getStatusColor(latestFastQFile.status)} variant='light'>
                                        {getStatusLabel(latestFastQFile.status)}
                                    </Badge>
                                </Group>

                                <Group gap='sm'>
                                    <Text size='sm' c='dimmed'>
                                        Tạo bởi: {latestFastQFile.creator.name}
                                    </Text>
                                </Group>

                                {latestFastQFile.rejector && (
                                    <Group gap='sm'>
                                        <Text size='sm' c='red'>
                                            Từ chối bởi: {latestFastQFile.rejector.name}
                                        </Text>
                                    </Group>
                                )}

                                {latestFastQFile.redoReason && (
                                    <Text size='sm' c='red'>
                                        Lý do làm lại: {latestFastQFile.redoReason}
                                    </Text>
                                )}

                                <Group gap='sm'>
                                    <Button
                                        variant='light'
                                        color='teal'
                                        size='sm'
                                        leftSection={<IconDownload size={16} />}
                                        onClick={handleDownload}
                                        loading={isDownloading}
                                    >
                                        Tải xuống
                                    </Button>
                                    {latestFastQFile.status === 'uploaded' && (
                                        <Button
                                            variant='light'
                                            color='red'
                                            size='sm'
                                            leftSection={<IconTrash size={16} />}
                                            onClick={handleDelete}
                                            loading={deleteFastQMutation.isPending}
                                        >
                                            Xóa
                                        </Button>
                                    )}
                                </Group>
                            </Stack>
                        </Card>
                    )
                )}

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && shouldShowDropzone() && (
                    <Stack gap='sm'>
                        <Group justify='space-between'>
                            <Text fw={600}>File đã chọn:</Text>
                            {canModifyFiles() && (
                                <Button
                                    variant='filled'
                                    color='teal'
                                    leftSection={<IconCloudUpload size={16} />}
                                    onClick={handleUpload}
                                    loading={isUploading}
                                    disabled={uploadedFiles.length === 0}
                                >
                                    Tải lên
                                </Button>
                            )}
                        </Group>
                        {uploadedFiles.map((file, index) => (
                            <Card key={index} p='sm' withBorder>
                                <Group justify='space-between'>
                                    <Group gap='sm'>
                                        <IconFile size={16} />
                                        <div>
                                            <Text size='sm' fw={500}>
                                                {file.name}
                                            </Text>
                                            <Text size='xs' c='dimmed'>
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </Text>
                                        </div>
                                    </Group>
                                    {canModifyFiles() && (
                                        <ActionIcon
                                            color='red'
                                            variant='light'
                                            onClick={() => onRemoveFile(index)}
                                            disabled={isUploading}
                                        >
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    )}
                                </Group>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Card>
    )
}
