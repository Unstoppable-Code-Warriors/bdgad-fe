import { Card, Text, Badge, Group, Stack, ThemeIcon, Box, Timeline, Avatar, Button, Divider } from '@mantine/core'
import {
    IconDownload,
    IconChartLine,
    IconUser,
    IconClock,
    IconAlertTriangle,
    IconMessage,
    IconCheck,
    IconRefresh,
    IconSend
} from '@tabler/icons-react'
import type { EtlResultResponse } from '@/types/analysis'
import { analysisStatusConfig, AnalysisStatus } from '@/types/analysis'
import { RejectionDisplay } from '@/components/RejectionDisplay'

interface EtlResultHistoryProps {
    etlResults: EtlResultResponse[]
    onDownload: (etlResultId: number) => void
    onRetry?: (etlResultId: number) => void
    onSendToValidation?: (etlResultId: number) => void
    latestFastQFile?: any
}

const getStatusColor = (status: string) => {
    return analysisStatusConfig[status as keyof typeof analysisStatusConfig]?.color || 'gray'
}

const getStatusLabel = (status: string) => {
    return analysisStatusConfig[status as keyof typeof analysisStatusConfig]?.label || status
}

export const EtlResultHistory = ({
    etlResults,
    onDownload,
    onRetry,
    onSendToValidation,
    latestFastQFile
}: EtlResultHistoryProps) => {
    if (!etlResults || etlResults.length === 0) {
        return (
            <Card shadow='sm' padding='xl' radius='lg' withBorder>
                <Group gap='sm' mb='lg'>
                    <ThemeIcon size='lg' radius='md' variant='light' color='teal'>
                        <IconChartLine size={20} />
                    </ThemeIcon>
                    <Box>
                        <Text fw={700} size='xl'>
                            Lịch sử kết quả phân tích
                        </Text>
                        <Text size='sm' c='dimmed'>
                            Theo dõi các kết quả phân tích đã hoàn thành
                        </Text>
                    </Box>
                </Group>
                <Card p='xl' radius='md' bg='gray.0' ta='center'>
                    <Stack align='center' gap='md'>
                        <ThemeIcon size={60} radius='xl' variant='light' color='gray'>
                            <IconChartLine size={30} />
                        </ThemeIcon>
                        <Text c='dimmed' fw={500}>
                            Chưa có kết quả phân tích nào
                        </Text>
                        <Text size='sm' c='dimmed'>
                            Kết quả phân tích sẽ xuất hiện ở đây sau khi hoàn thành xử lý
                        </Text>
                    </Stack>
                </Card>
            </Card>
        )
    }

    return (
        <Card shadow='sm' padding='xl' radius='lg' withBorder>
            <Group gap='sm' mb='xl'>
                <ThemeIcon size='lg' radius='md' variant='light' color='teal'>
                    <IconChartLine size={20} />
                </ThemeIcon>
                <Box>
                    <Text fw={700} size='xl'>
                        Lịch sử kết quả phân tích
                    </Text>
                    <Text size='sm' c='dimmed'>
                        {etlResults.length} kết quả đã được tạo
                    </Text>
                </Box>
            </Group>

            <Timeline active={etlResults.length} bulletSize={32} lineWidth={3}>
                {etlResults.map((result, index) => (
                    <Timeline.Item
                        key={result.id}
                        bullet={
                            <ThemeIcon size='lg' radius='xl' color={getStatusColor(result.status || '')}>
                                {result.status === AnalysisStatus.COMPLETED ? (
                                    <IconCheck size={16} />
                                ) : result.status === AnalysisStatus.REJECTED ? (
                                    <IconAlertTriangle size={16} />
                                ) : (
                                    <IconChartLine size={16} />
                                )}
                            </ThemeIcon>
                        }
                        title={
                            <Box w='100%'>
                                <Group gap='sm' mb='sm'>
                                    <Text fw={600} size='md'>
                                        Kết quả phân tích #{etlResults.length - index}
                                    </Text>
                                    <Badge
                                        color={getStatusColor(result.status || '')}
                                        variant='light'
                                        size='md'
                                        radius='md'
                                    >
                                        {getStatusLabel(result.status || '')}
                                    </Badge>
                                </Group>

                                <Card p='md' radius='md' bg='gray.0' withBorder>
                                    <Stack gap='sm'>
                                        <Group gap='xs'>
                                            <IconClock size={14} color='var(--mantine-color-gray-6)' />
                                            <Text size='sm' c='dimmed'>
                                                Hoàn thành: {new Date(result.etlCompletedAt).toLocaleString('vi-VN')}
                                            </Text>
                                        </Group>

                                        {result.comment && (
                                            <Card p='sm' radius='md' bg='blue.0' withBorder>
                                                <Group gap='xs' mb='xs'>
                                                    <IconMessage size={14} color='var(--mantine-color-blue-6)' />
                                                    <Text size='sm' fw={500} c='blue'>
                                                        Ghi chú
                                                    </Text>
                                                </Group>
                                                <Text size='sm' c='blue.7' mb='xs'>
                                                    {result.comment}
                                                </Text>
                                                {result.commenter && (
                                                    <Group gap='sm'>
                                                        <Avatar size='sm' radius='xl' color='blue' variant='light'>
                                                            <IconUser size={12} />
                                                        </Avatar>
                                                        <Stack gap={2}>
                                                            <Text size='sm' fw={500} c='blue.7'>
                                                                {result.commenter.name}
                                                            </Text>
                                                            <Text size='xs' c='blue.6'>
                                                                {result.commenter.email}
                                                            </Text>
                                                        </Stack>
                                                    </Group>
                                                )}
                                            </Card>
                                        )}

                                        {result.rejector && (
                                            <RejectionDisplay
                                                rejector={result.rejector}
                                                redoReason={result.redoReason}
                                                rejectionDate={result.etlCompletedAt}
                                                itemType='Kết quả phân tích'
                                                itemId={result.id}
                                                compact
                                            />
                                        )}

                                        {/* Action buttons */}
                                        {(result.status === AnalysisStatus.COMPLETED ||
                                            (result.status === AnalysisStatus.FAILED &&
                                                latestFastQFile?.id &&
                                                onRetry)) && (
                                            <>
                                                <Divider my='xs' />
                                                <Group gap='sm' justify='flex-end'>
                                                    {/* Download button for completed results */}
                                                    {result.status === AnalysisStatus.COMPLETED && (
                                                        <Button
                                                            variant='light'
                                                            color='teal'
                                                            leftSection={<IconDownload size={16} />}
                                                            onClick={() => onDownload(result.id)}
                                                            size='sm'
                                                            radius='md'
                                                        >
                                                            Tải xuống
                                                        </Button>
                                                    )}

                                                    {/* Send to Validation button for completed results */}
                                                    {result.status === AnalysisStatus.COMPLETED &&
                                                        onSendToValidation && (
                                                            <Button
                                                                variant='light'
                                                                color='blue'
                                                                leftSection={<IconSend size={16} />}
                                                                onClick={() => onSendToValidation(result.id)}
                                                                size='sm'
                                                                radius='md'
                                                            >
                                                                Gửi xác thực
                                                            </Button>
                                                        )}

                                                    {/* Retry button for failed results */}
                                                    {result.status === AnalysisStatus.FAILED &&
                                                        latestFastQFile?.id &&
                                                        onRetry && (
                                                            <Button
                                                                variant='light'
                                                                color='orange'
                                                                leftSection={<IconRefresh size={16} />}
                                                                onClick={() => onRetry(result.id)}
                                                                size='sm'
                                                                radius='md'
                                                            >
                                                                Thử lại phân tích
                                                            </Button>
                                                        )}
                                                </Group>
                                            </>
                                        )}
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
