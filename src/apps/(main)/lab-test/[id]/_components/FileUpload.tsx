import { Paper, Stack, Group, Title, Badge, Text, Card, ActionIcon } from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import { IconFileDescription, IconUpload, IconX, IconFile, IconTrash, IconLock } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { statusConfig } from '@/types/lab-test.types'
import type { FastQ } from '@/types/fastq'

interface FileUploadProps {
    latestFastQFile?: FastQ | null
    uploadedFiles: File[]
    onFileDrop: (files: File[]) => void
    onRemoveFile: (index: number) => void
}

export const FileUpload = ({ latestFastQFile, uploadedFiles, onFileDrop, onRemoveFile }: FileUploadProps) => {
    const getCurrentStatus = () => {
        return latestFastQFile?.status || 'UPLOADED'
    }

    const getStatusLabel = (status: string) => {
        return statusConfig[status as keyof typeof statusConfig]?.label || status
    }

    const canModifyFiles = () => {
        const status = getCurrentStatus()
        return status === 'UPLOADED'
    }

    const handleFileDrop = (files: File[]) => {
        // Only allow if status is UPLOADED
        if (!canModifyFiles()) {
            notifications.show({
                title: 'Không thể tải file',
                message: 'Chỉ có thể tải file khi trạng thái là UPLOADED',
                color: 'red'
            })
            return
        }
        onFileDrop(files)
    }

    return (
        <Paper p='lg' withBorder radius='md' h='fit-content' shadow='sm'>
            <Stack gap='lg'>
                <Group justify='space-between'>
                    <Group gap='sm'>
                        <IconFileDescription size={20} color='var(--mantine-color-teal-6)' />
                        <Title order={3} c='teal.7'>
                            Tải lên File FastQ
                        </Title>
                    </Group>
                    {latestFastQFile && (
                        <Badge variant='light' color='teal'>
                            Trạng thái: {getStatusLabel(getCurrentStatus())}
                        </Badge>
                    )}
                </Group>

                {/* Show dropzone only if files can be modified */}
                {canModifyFiles() ? (
                    <Dropzone
                        onDrop={handleFileDrop}
                        onReject={() => {
                            notifications.show({
                                title: 'File không hợp lệ',
                                message: 'Vui lòng chọn file FastQ hợp lệ',
                                color: 'red'
                            })
                        }}
                        maxSize={100 * 1024 * 1024} // 100MB
                        accept={['.fastq', '.fq', '.fastq.gz', '.fq.gz']}
                    >
                        <Group justify='center' gap='xl' mih={220} style={{ pointerEvents: 'none' }}>
                            <Dropzone.Accept>
                                <IconUpload
                                    style={{ width: 52, height: 52, color: 'var(--mantine-color-blue-6)' }}
                                    stroke={1.5}
                                />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX
                                    style={{ width: 52, height: 52, color: 'var(--mantine-color-red-6)' }}
                                    stroke={1.5}
                                />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconFile
                                    style={{ width: 52, height: 52, color: 'var(--mantine-color-dimmed)' }}
                                    stroke={1.5}
                                />
                            </Dropzone.Idle>

                            <div>
                                <Text size='xl' inline>
                                    Kéo thả file FastQ vào đây hoặc click để chọn
                                </Text>
                                <Text size='sm' c='dimmed' inline mt={7}>
                                    Hỗ trợ: .fastq, .fq, .fastq.gz, .fq.gz (Tối đa 100MB)
                                </Text>
                            </div>
                        </Group>
                    </Dropzone>
                ) : (
                    /* Show locked state for non-modifiable statuses */
                    <Paper p='xl' bg='gray.0' radius='sm' withBorder style={{ borderStyle: 'dashed' }}>
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
                    </Paper>
                )}

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                    <Stack gap='sm'>
                        <Text fw={600}>File đã chọn:</Text>
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
                                        <ActionIcon color='red' variant='light' onClick={() => onRemoveFile(index)}>
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    )}
                                </Group>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Paper>
    )
}
