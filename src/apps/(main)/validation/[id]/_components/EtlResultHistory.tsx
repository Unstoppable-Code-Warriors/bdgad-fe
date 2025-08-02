import { Card, Text, Badge, Group, Stack, ThemeIcon, Box, Timeline, Avatar } from '@mantine/core'
import { IconHistory, IconUser, IconClock, IconMessage, IconCircleCheck, IconCircleX } from '@tabler/icons-react'
import type { ValidationSessionWithLatestEtlResponse } from '@/types/validation'
import { validationEtlStatusConfig, ValidationEtlStatus } from '@/types/validation'
import { RejectionDisplay } from '@/components/RejectionDisplay'

interface EtlResultHistoryProps {
    validation: ValidationSessionWithLatestEtlResponse
}

const getStatusColor = (status: string) => {
    return validationEtlStatusConfig[status as keyof typeof validationEtlStatusConfig]?.color || 'gray'
}

const getStatusLabel = (status: string) => {
    return validationEtlStatusConfig[status as keyof typeof validationEtlStatusConfig]?.label || status
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case ValidationEtlStatus.APPROVED:
            return <IconCircleCheck size={16} />
        case ValidationEtlStatus.REJECTED:
            return <IconCircleX size={16} />
        case ValidationEtlStatus.WAIT_FOR_APPROVAL:
            return <IconClock size={16} />
        default:
            return <IconClock size={16} />
    }
}

export const EtlResultHistory = ({ validation }: EtlResultHistoryProps) => {
    const etlResult = validation.latestEtlResult
    const results = etlResult ? [etlResult] : []
    // const downloadEtlResultMutation = useDownloadEtlResult()

    // const handleDownloadEtlResult = async (etlResultId: number) => {
    //     try {
    //         const response = await downloadEtlResultMutation.mutateAsync(etlResultId)
    //         window.open(response.downloadUrl, '_blank')
    //         notifications.show({
    //             title: 'Thành công',
    //             message: 'Đang tải xuống kết quả phân tích',
    //             color: 'green'
    //         })
    //     } catch (error: any) {
    //         notifications.show({
    //             title: 'Lỗi tải file',
    //             message: error.message || 'Không thể tải xuống kết quả phân tích',
    //             color: 'red'
    //         })
    //     }
    // }
    if (!etlResult) {
        return (
            <Card shadow='sm' padding='xl' radius='lg' withBorder>
                <Group gap='sm' mb='lg'>
                    <ThemeIcon size='lg' radius='md' variant='light' color='orange'>
                        <IconHistory size={20} />
                    </ThemeIcon>
                    <Box>
                        <Text fw={700} size='xl'>
                            Lịch sử kết quả phân tích
                        </Text>
                        <Text size='sm' c='dimmed'>
                            Chưa có kết quả phân tích
                        </Text>
                    </Box>
                </Group>
                <Card p='xl' radius='md' bg='gray.0' ta='center'>
                    <Stack align='center' gap='md'>
                        <ThemeIcon size={60} radius='xl' variant='light' color='gray'>
                            <IconHistory size={20} />
                        </ThemeIcon>
                        <Text c='dimmed' fw={500}>
                            Chưa có kết quả phân tích nào
                        </Text>
                        <Text size='sm' c='dimmed'>
                            Chưa có kết quả phân tích nào được tạo cho lần khám này
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
                    <IconHistory size={20} />
                </ThemeIcon>
                <Box>
                    <Text fw={700} size='xl'>
                        Lịch sử kết quả phân tích
                    </Text>
                    <Text size='sm' c='dimmed'>
                        Chi tiết về kết quả xử lý phân tích
                    </Text>
                </Box>
            </Group>

            <Timeline active={results.length} bulletSize={32} lineWidth={3}>
                {results.map((result) => (
                    <Timeline.Item
                        key={result.id}
                        bullet={
                            <ThemeIcon size='lg' radius='xl' color={getStatusColor(result.status || '')}>
                                {getStatusIcon(result.status || '')}
                            </ThemeIcon>
                        }
                        title={
                            <Box w='100%'>
                                <Group gap='sm' mb='sm'>
                                    <Text fw={600} size='md'>
                                        Kết quả phân tích #{result.id}
                                    </Text>
                                    <Badge
                                        color={getStatusColor(result.status || '')}
                                        variant='filled'
                                        size='md'
                                        radius='md'
                                    >
                                        {getStatusLabel(result.status || '')}
                                    </Badge>
                                </Group>

                                <Card p='md' radius='md' bg='gray.0' withBorder>
                                    <Stack gap='sm'>
                                        {/* Timestamp */}
                                        <Group gap='xs'>
                                            <IconClock size={14} color='var(--mantine-color-gray-6)' />
                                            <Text size='sm' c='dimmed'>
                                                {new Date(result.etlCompletedAt).toLocaleString('vi-VN')}
                                            </Text>
                                        </Group>

                                        {/* File Path */}
                                        {/* <Group gap='xs' align='flex-start'>
                                            <IconMessage size={14} color='var(--mantine-color-blue-6)' />
                                            <Box style={{ flex: 1 }}>
                                                <Text size='sm' c='dimmed' fw={500}>
                                                    Đường dẫn file:
                                                </Text>
                                                <Text size='sm' c='blue' style={{ wordBreak: 'break-word' }}>
                                                    {result.resultPath}
                                                </Text>
                                            </Box>
                                        </Group> */}

                                        {/* Comment */}
                                        {result.reasonApprove && (
                                            <Group gap='xs' align='flex-start'>
                                                <IconMessage size={14} color='var(--mantine-color-teal-6)' />
                                                <Box style={{ flex: 1 }}>
                                                    <Text size='sm' c='teal' fw={500}>
                                                        Ghi chú phê duyệt:
                                                    </Text>
                                                    <Text size='sm' c='teal.7' style={{ wordBreak: 'break-word' }}>
                                                        {result.reasonApprove}
                                                    </Text>
                                                    {result.approver && (
                                                        <Group gap='xs' mt='xs'>
                                                            <Avatar size='sm' radius='xl' color='teal' variant='light'>
                                                                <IconUser size={12} />
                                                            </Avatar>
                                                            <Text size='xs' c='dimmed'>
                                                                Bởi: {result.approver.name} ({result.approver.email})
                                                            </Text>
                                                        </Group>
                                                    )}
                                                </Box>
                                            </Group>
                                        )}

                                        {/* Rejection Reason */}
                                        {result.reasonReject && result.rejector && (
                                            <RejectionDisplay
                                                rejector={result.rejector}
                                                redoReason={result.reasonReject}
                                                rejectionDate={result.etlCompletedAt}
                                                itemType='Kết quả phân tích'
                                                itemId={result.id}
                                                compact
                                            />
                                        )}
                                        {/* Download Button */}
                                        {/* {result.status !== ValidationEtlStatus.FAILED &&
                                            result.status !== ValidationEtlStatus.PROCESSING && (
                                                <Group gap='sm' justify='flex-end'>
                                                    <Button
                                                        variant={'light'}
                                                        color='teal'
                                                        leftSection={<IconDownload size={16} />}
                                                        onClick={() => handleDownloadEtlResult(result.id)}
                                                        size='sm'
                                                        radius='md'
                                                    >
                                                        Tải xuống
                                                    </Button>
                                                </Group>
                                            )} */}
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
