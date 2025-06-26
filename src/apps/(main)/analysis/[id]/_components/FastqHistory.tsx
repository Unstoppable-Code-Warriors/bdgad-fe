import { Card, Text, Badge, Group, ActionIcon, Stack, Divider } from '@mantine/core'
import { IconPlayerPlay, IconX } from '@tabler/icons-react'
import type { FastqFileResponse } from '@/types/analysis'
import { analysisStatusConfig, ANALYSIS_STATUS } from '@/types/analysis'

interface FastqHistoryProps {
    fastqFiles: FastqFileResponse[]
    onReject: (fastqId: number) => void
    onProcess: (fastqId: number) => void
}

const getStatusColor = (status: string) => {
    return analysisStatusConfig[status as keyof typeof analysisStatusConfig]?.color || 'gray'
}

const getStatusLabel = (status: string) => {
    return analysisStatusConfig[status as keyof typeof analysisStatusConfig]?.label || status
}

export const FastqHistory = ({ fastqFiles, onReject, onProcess }: FastqHistoryProps) => {
    if (!fastqFiles || fastqFiles.length === 0) {
        return (
            <Card shadow='sm' padding='lg' radius='md' withBorder>
                <Text fw={600} size='lg' mb='md'>
                    Lịch sử FastQ
                </Text>
                <Text c='dimmed' ta='center' py='xl'>
                    Chưa có file FastQ nào
                </Text>
            </Card>
        )
    }

    return (
        <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Text fw={600} size='lg' mb='md'>
                Lịch sử FastQ ({fastqFiles.length} file)
            </Text>

            <Stack gap='md'>
                {fastqFiles.map((file, index) => (
                    <div key={file.id}>
                        <Group justify='space-between' align='flex-start'>
                            <Stack gap='xs' style={{ flex: 1 }}>
                                <Group gap='xs'>
                                    <Text size='sm' fw={500}>
                                        File #{fastqFiles.length - index}
                                    </Text>
                                    <Badge color={getStatusColor(file.status || '')} variant='light' size='sm'>
                                        {getStatusLabel(file.status || '')}
                                    </Badge>
                                </Group>

                                <Text size='xs' c='dimmed'>
                                    Tải lên: {new Date(file.createdAt).toLocaleString('vi-VN')}
                                </Text>

                                <Text size='xs' c='dimmed'>
                                    Người tải: {file.creator.name} ({file.creator.email})
                                </Text>

                                {file.rejector && (
                                    <Text size='xs' c='red'>
                                        Người từ chối: {file.rejector.name} ({file.rejector.email})
                                    </Text>
                                )}

                                {file.redoReason && (
                                    <Text size='xs' c='red'>
                                        Lý do từ chối: {file.redoReason}
                                    </Text>
                                )}
                            </Stack>

                            {/* Action buttons for files waiting for approval */}
                            {file.status === ANALYSIS_STATUS.WAIT_FOR_APPROVAL && (
                                <Group gap='xs'>
                                    <ActionIcon
                                        variant='light'
                                        color='green'
                                        onClick={() => onProcess(file.id)}
                                        size='sm'
                                    >
                                        <IconPlayerPlay size={14} />
                                    </ActionIcon>
                                    <ActionIcon variant='light' color='red' onClick={() => onReject(file.id)} size='sm'>
                                        <IconX size={14} />
                                    </ActionIcon>
                                </Group>
                            )}
                        </Group>

                        {index < fastqFiles.length - 1 && <Divider my='sm' />}
                    </div>
                ))}
            </Stack>
        </Card>
    )
}
