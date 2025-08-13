import { Card, Text, Badge, Group, Stack, ThemeIcon, Box, Timeline, Avatar, Button, Divider } from '@mantine/core'
import {
    IconChartLine,
    IconUser,
    IconClock,
    IconAlertTriangle,
    IconCheck,
    IconDna,
    IconDownload
} from '@tabler/icons-react'
import { RejectionDisplay } from './RejectionDisplay'
import { ApprovedDisplay } from './ApprovedDisplay'

interface EtlResultData {
    id: number
    status: string | null
    createdAt?: string
    etlCompletedAt?: string
    reasonApprove?: string
    error?: string
    reasonReject?: string | null
    resultPath?: string
    fastqFilePairId?: number
    fastqPair?: {
        id: number
        createdAt: string
        status: string
    }
    creator?: {
        id: number
        name: string
        email: string
    }
    rejector?: {
        id: number
        name: string
        email: string
    }
    approver?: {
        id: number
        name: string
        email: string
    }
}

interface EtlResultAction {
    type: 'download' | 'retry' | 'send' | 'approve' | 'reject'
    label: string
    icon: React.ReactNode
    color: string
    variant?: 'filled' | 'light' | 'outline'
    condition: (result: EtlResultData) => boolean
    handler: (resultId: number) => void
}

interface EtlResultHistoryProps {
    results?: EtlResultData[]
    title?: string
    subtitle?: string
    emptyStateTitle?: string
    emptyStateDescription?: string
    icon?: React.ReactNode
    iconColor?: string
    statusConfig: Record<string, { label: string; color: string }>
    fastqStatusConfig?: Record<string, { label: string; color: string }>
    actions?: EtlResultAction[]
    showCreator?: boolean
    showTimestamp?: boolean
    showFastqPair?: boolean
    resultNamePrefix?: string
    onDownload?: (resultId: number, resultPath?: string) => void
}

export const EtlResultHistory = ({
    results,
    title = 'Lịch sử kết quả ETL',
    subtitle = 'Theo dõi các kết quả phân tích đã hoàn thành',
    emptyStateTitle = 'Chưa có kết quả ETL nào',
    emptyStateDescription = 'Kết quả ETL sẽ xuất hiện ở đây sau khi hoàn thành xử lý',
    icon = <IconChartLine size={20} />,
    iconColor = 'teal',
    statusConfig,
    actions = [],
    showCreator = true,
    showTimestamp = true,
    showFastqPair = false,
    resultNamePrefix = 'Kết quả ETL'
}: EtlResultHistoryProps) => {

    const getStatusColor = (status: string) => {
        return statusConfig[status]?.color || 'gray'
    }

    const getStatusLabel = (status: string) => {
        return statusConfig[status]?.label || status
    }

    const handleDownloadETLResult = (resultId: number, resultPath?: string) => {
        console.log(`Downloading ETL result ${resultId} from path: ${resultPath}`)
    }

    if (!results || results.length === 0) {
        return (
            <Card shadow='sm' padding='xl' radius='lg' withBorder>
                <Group gap='sm' mb='lg'>
                    <ThemeIcon size='lg' radius='md' variant='light' color={iconColor}>
                        {icon}
                    </ThemeIcon>
                    <Box>
                        <Text fw={700} size='xl'>
                            {title}
                        </Text>
                        <Text size='sm' c='dimmed'>
                            {subtitle}
                        </Text>
                    </Box>
                </Group>
                <Card p='xl' radius='md' bg='gray.0' ta='center'>
                    <Stack align='center' gap='md'>
                        <ThemeIcon size={60} radius='xl' variant='light' color='gray'>
                            {icon}
                        </ThemeIcon>
                        <Text c='dimmed' fw={500}>
                            {emptyStateTitle}
                        </Text>
                        <Text size='sm' c='dimmed'>
                            {emptyStateDescription}
                        </Text>
                    </Stack>
                </Card>
            </Card>
        )
    }

    return (
        <Card shadow='sm' padding='xl' radius='lg' withBorder>
            <Group gap='sm' mb='xl'>
                <ThemeIcon size='lg' radius='md' variant='light' color={iconColor}>
                    {icon}
                </ThemeIcon>
                <Box>
                    <Text fw={700} size='xl'>
                        {title}
                    </Text>
                    <Text size='sm' c='dimmed'>
                        {results.length} kết quả đã được xử lý
                    </Text>
                </Box>
            </Group>

            <Timeline active={results.length} bulletSize={32} lineWidth={3}>
                {results.map((result, index) => (
                    <Timeline.Item
                        key={index}
                        bullet={
                            <ThemeIcon size='lg' radius='xl' color={getStatusColor(result.status || '')}>
                                {result.status && statusConfig[result.status]?.color === 'red' ? (
                                    <IconAlertTriangle size={16} />
                                ) : result.status &&
                                  (statusConfig[result.status]?.color === 'green' ||
                                      statusConfig[result.status]?.color === 'teal') ? (
                                    <IconCheck size={16} />
                                ) : (
                                    <IconChartLine size={16} />
                                )}
                            </ThemeIcon>
                        }
                        title={
                            <Box w='100%'>
                                <Group gap='sm' mb='sm'>
                                    <Text fw={600} size='md'>
                                        {resultNamePrefix} #{result.id}
                                    </Text>
                                    <Badge color={getStatusColor(result.status || '')} size='md' radius='md'>
                                        {getStatusLabel(result.status || '')}
                                    </Badge>
                                </Group>

                                <Card p='md' radius='md' bg='gray.0' withBorder>
                                    <Stack gap='sm'>
                                        {/* Creator Info */}
                                        {showCreator && result.creator && (
                                            <Group gap='xs'>
                                                <Avatar size='sm' radius='xl' color='blue' variant='light'>
                                                    <IconUser size={12} />
                                                </Avatar>
                                                <Text size='sm' c='dimmed'>
                                                    Được tạo bởi <strong>{result.creator.name}</strong>
                                                </Text>
                                            </Group>
                                        )}

                                        {/* Timestamp */}
                                        {showTimestamp && (
                                            <Group gap='xs'>
                                                <IconClock size={14} color='var(--mantine-color-gray-6)' />
                                                <Text size='sm' c='dimmed'>
                                                    {new Date(
                                                        result.createdAt || result.etlCompletedAt || ''
                                                    ).toLocaleString('vi-VN')}
                                                </Text>
                                            </Group>
                                        )}

                                        {/* FASTQ File Pair Information */}
                                        {showFastqPair && result.fastqPair && (
                                            <Group gap='xs'>
                                                <IconDna size={14} color='var(--mantine-color-blue-6)' />
                                                <Text size='sm' c='dimmed'>
                                                    Nguồn: Cặp file fastQ{' '}
                                                    <span className='font-semibold'>#{result.fastqPair.id}</span>
                                                </Text>
                                            </Group>
                                        )}

                                        {/* Error */}
                                        {result.error && (
                                            <Group gap='xs' align='flex-start'>
                                                <IconAlertTriangle size={14} color='var(--mantine-color-red-6)' />
                                                <Box style={{ flex: 1 }}>
                                                    <Text size='sm' c='red' fw={500}>
                                                        Lỗi:
                                                    </Text>
                                                    <Text size='sm' c='red' style={{ wordBreak: 'break-word' }}>
                                                        {result.error}
                                                    </Text>
                                                </Box>
                                            </Group>
                                        )}

                                        {/* Approver Display */}
                                        {result.approver && result.reasonApprove && (
                                            <ApprovedDisplay
                                                approver={result.approver}
                                                reasonApprove={result.reasonApprove}
                                                approvalDate={result.createdAt || result.etlCompletedAt || ''}
                                                itemType={resultNamePrefix}
                                                itemId={result.id}
                                                compact
                                            />
                                        )}

                                        {/* Simple Approver Info (when no approval reason) */}
                                        {result.approver && !result.reasonApprove && (
                                            <Group gap='xs'>
                                                <Avatar size='sm' radius='xl' color='green' variant='light'>
                                                    <IconCheck size={12} />
                                                </Avatar>
                                                <Text size='sm' c='dimmed'>
                                                    Được phê duyệt bởi <strong>{result.approver.name}</strong>
                                                </Text>
                                            </Group>
                                        )}

                                        {/* Rejection Display */}
                                        {result.rejector && result.reasonReject && (
                                            <RejectionDisplay
                                                rejector={result.rejector}
                                                redoReason={result.reasonReject}
                                                rejectionDate={result.createdAt || result.etlCompletedAt || ''}
                                                itemType={resultNamePrefix}
                                                itemId={result.id}
                                                compact
                                            />
                                        )}

                                        {/* Download Button */}
                                        {result.resultPath && (
                                            <>
                                                <Divider my='xs' />
                                                <Group gap='sm' justify='flex-end'>
                                                    <Button
                                                        variant='light'
                                                        color='blue'
                                                        leftSection={<IconDownload size={16} />}
                                                        onClick={() =>
                                                            handleDownloadETLResult(result.id, result.resultPath)
                                                        }
                                                        size='sm'
                                                        radius='md'
                                                    >
                                                        Tải xuống kết quả
                                                    </Button>
                                                </Group>
                                            </>
                                        )}

                                        {/* Action buttons */}
                                        {actions.length > 0 && (
                                            <>
                                                <Divider my='xs' />
                                                <Group gap='sm' justify='flex-end'>
                                                    {actions.map((action, actionIndex) => {
                                                        if (!action.condition(result)) return null

                                                        return (
                                                            <Button
                                                                key={actionIndex}
                                                                variant={action.variant || 'light'}
                                                                color={action.color}
                                                                leftSection={action.icon}
                                                                onClick={() => action.handler(result.id)}
                                                                size='sm'
                                                                radius='md'
                                                            >
                                                                {action.label}
                                                            </Button>
                                                        )
                                                    })}
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
