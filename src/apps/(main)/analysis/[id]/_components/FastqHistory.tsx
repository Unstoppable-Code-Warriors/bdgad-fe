import { Card, Text, Badge, Group, Stack, Divider, ThemeIcon, Box, Timeline, Avatar, Button } from '@mantine/core'
import { IconPlayerPlay, IconX, IconFileText, IconUser, IconClock, IconAlertTriangle } from '@tabler/icons-react'
import type { FastqFileResponse } from '@/types/analysis'
import { analysisStatusConfig, AnalysisStatus } from '@/types/analysis'
import { RejectionDisplay } from '@/components/RejectionDisplay'

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
            <Card shadow='sm' padding='xl' radius='lg' withBorder>
                <Group gap='sm' mb='lg'>
                    <ThemeIcon size='lg' radius='md' variant='light' color='orange'>
                        <IconFileText size={20} />
                    </ThemeIcon>
                    <Box>
                        <Text fw={700} size='xl'>
                            Lịch sử FastQ
                        </Text>
                        <Text size='sm' c='dimmed'>
                            Theo dõi các file FastQ đã tải lên
                        </Text>
                    </Box>
                </Group>
                <Card p='xl' radius='md' bg='gray.0' ta='center'>
                    <Stack align='center' gap='md'>
                        <ThemeIcon size={60} radius='xl' variant='light' color='gray'>
                            <IconFileText size={30} />
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
                    <IconFileText size={20} />
                </ThemeIcon>
                <Box>
                    <Text fw={700} size='xl'>
                        Lịch sử FastQ
                    </Text>
                    <Text size='sm' c='dimmed'>
                        {fastqFiles.length} file đã được tải lên
                    </Text>
                </Box>
            </Group>

            <Timeline active={fastqFiles.length} bulletSize={32} lineWidth={3}>
                {fastqFiles.map((file, index) => (
                    <Timeline.Item
                        key={file.id}
                        bullet={
                            <ThemeIcon size='lg' radius='xl' color={getStatusColor(file.status || '')}>
                                {file.status === AnalysisStatus.REJECTED ? (
                                    <IconAlertTriangle size={16} />
                                ) : (
                                    <IconFileText size={16} />
                                )}
                            </ThemeIcon>
                        }
                        title={
                            <Box w='100%'>
                                <Group gap='sm' mb='sm'>
                                    <Text fw={600} size='md'>
                                        File FastQ #{fastqFiles.length - index}
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
                                                compact
                                            />
                                        )}

                                        {/* Action buttons for files waiting for approval */}
                                        {file.status === AnalysisStatus.WAIT_FOR_APPROVAL && (
                                            <>
                                                <Divider my='xs' />
                                                <Group gap='sm' justify='flex-end'>
                                                    <Button
                                                        variant='light'
                                                        color='green'
                                                        leftSection={<IconPlayerPlay size={16} />}
                                                        onClick={() => onProcess(file.id)}
                                                        size='sm'
                                                        radius='md'
                                                    >
                                                        Phê duyệt
                                                    </Button>
                                                    <Button
                                                        variant='light'
                                                        color='red'
                                                        leftSection={<IconX size={16} />}
                                                        onClick={() => onReject(file.id)}
                                                        size='sm'
                                                        radius='md'
                                                    >
                                                        Từ chối
                                                    </Button>
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
