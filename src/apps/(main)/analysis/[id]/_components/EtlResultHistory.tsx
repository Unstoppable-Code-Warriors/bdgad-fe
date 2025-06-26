import { Card, Text, Badge, Group, ActionIcon, Stack, Divider } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import type { EtlResultResponse } from '@/types/analysis'
import { analysisStatusConfig, ANALYSIS_STATUS } from '@/types/analysis'

interface EtlResultHistoryProps {
    etlResults: EtlResultResponse[]
    onDownload: (etlResultId: number) => void
}

const getStatusColor = (status: string) => {
    return analysisStatusConfig[status as keyof typeof analysisStatusConfig]?.color || 'gray'
}

const getStatusLabel = (status: string) => {
    return analysisStatusConfig[status as keyof typeof analysisStatusConfig]?.label || status
}

export const EtlResultHistory = ({ etlResults, onDownload }: EtlResultHistoryProps) => {
    if (!etlResults || etlResults.length === 0) {
        return (
            <Card shadow='sm' padding='lg' radius='md' withBorder>
                <Text fw={600} size='lg' mb='md'>
                    Lịch sử kết quả ETL
                </Text>
                <Text c='dimmed' ta='center' py='xl'>
                    Chưa có kết quả ETL nào
                </Text>
            </Card>
        )
    }

    return (
        <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Text fw={600} size='lg' mb='md'>
                Lịch sử kết quả ETL ({etlResults.length} kết quả)
            </Text>

            <Stack gap='md'>
                {etlResults.map((result, index) => (
                    <div key={result.id}>
                        <Group justify='space-between' align='flex-start'>
                            <Stack gap='xs' style={{ flex: 1 }}>
                                <Group gap='xs'>
                                    <Text size='sm' fw={500}>
                                        Kết quả #{etlResults.length - index}
                                    </Text>
                                    <Badge color={getStatusColor(result.status || '')} variant='light' size='sm'>
                                        {getStatusLabel(result.status || '')}
                                    </Badge>
                                </Group>

                                <Text size='xs' c='dimmed'>
                                    Hoàn thành: {new Date(result.etlCompletedAt).toLocaleString('vi-VN')}
                                </Text>

                                {result.comment && <Text size='xs'>Ghi chú: {result.comment}</Text>}

                                {result.redoReason && (
                                    <Text size='xs' c='red'>
                                        Lý do từ chối: {result.redoReason}
                                    </Text>
                                )}

                                {result.rejector && (
                                    <Text size='xs' c='dimmed'>
                                        Người từ chối: {result.rejector.name} ({result.rejector.email})
                                    </Text>
                                )}

                                {result.commenter && (
                                    <Text size='xs' c='dimmed'>
                                        Người ghi chú: {result.commenter.name} ({result.commenter.email})
                                    </Text>
                                )}
                            </Stack>

                            {/* Download button for completed results */}
                            {result.status === ANALYSIS_STATUS.COMPLETED && (
                                <ActionIcon
                                    variant='light'
                                    color='teal'
                                    onClick={() => onDownload(result.id)}
                                    size='sm'
                                >
                                    <IconDownload size={14} />
                                </ActionIcon>
                            )}
                        </Group>

                        {index < etlResults.length - 1 && <Divider my='sm' />}
                    </div>
                ))}
            </Stack>
        </Card>
    )
}
