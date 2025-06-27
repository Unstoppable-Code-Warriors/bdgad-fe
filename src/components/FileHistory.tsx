import { Card, Text, Badge, Group, Stack, Divider, ThemeIcon, Box, Timeline, Avatar, Button } from '@mantine/core'
import { IconFileDescription, IconFileText, IconUser, IconClock, IconAlertTriangle } from '@tabler/icons-react'
import { RejectionDisplay } from './RejectionDisplay'

interface FileData {
    id: number
    filePath?: string
    fileName?: string
    status: string | null
    createdAt: string
    redoReason?: string | null
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
}

interface FileHistoryAction {
    type: 'process' | 'reject' | 'download' | 'delete'
    label: string
    icon: React.ReactNode
    color: string
    variant?: 'filled' | 'light' | 'outline'
    condition: (file: FileData) => boolean
    handler: (fileId: number) => void
}

interface FileHistoryProps {
    files?: FileData[]
    title?: string
    subtitle?: string
    emptyStateTitle?: string
    emptyStateDescription?: string
    icon?: React.ReactNode
    iconColor?: string
    statusConfig: Record<string, { label: string; color: string }>
    actions?: FileHistoryAction[]
    showCreator?: boolean
    showTimestamp?: boolean
    fileNamePrefix?: string
}

export const FileHistory = ({
    files,
    title = 'Lịch sử File',
    subtitle = 'Theo dõi các file đã tải lên',
    emptyStateTitle = 'Chưa có file nào',
    emptyStateDescription = 'File sẽ xuất hiện ở đây sau khi được tải lên',
    icon = <IconFileDescription size={20} />,
    iconColor = 'orange',
    statusConfig,
    actions = [],
    showCreator = true,
    showTimestamp = true,
    fileNamePrefix = 'File'
}: FileHistoryProps) => {
    const getStatusColor = (status: string) => {
        return statusConfig[status]?.color || 'gray'
    }

    const getStatusLabel = (status: string) => {
        return statusConfig[status]?.label || status
    }

    if (!files || files.length === 0) {
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
                        {files.length} file đã được tải lên
                    </Text>
                </Box>
            </Group>

            <Timeline active={files.length} bulletSize={32} lineWidth={3}>
                {files.map((file) => (
                    <Timeline.Item
                        key={file.id}
                        bullet={
                            <ThemeIcon size='lg' radius='xl' color={getStatusColor(file.status || '')}>
                                {file.status === 'rejected' || file.status === 'REJECTED' ? (
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
                                        {fileNamePrefix} #{file.id}
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
                                        {/* File Path/Name
                                        {(file.filePath || file.fileName) && (
                                            <Group gap='xs' wrap='wrap'>
                                                <Text size='sm' c='dimmed' fw={500}>
                                                    File:
                                                </Text>
                                                <Text size='sm' ff='monospace' style={{ wordBreak: 'break-all' }}>
                                                    {file.fileName || file.filePath}
                                                </Text>
                                            </Group>
                                        )} */}

                                        {/* Creator Info */}
                                        {showCreator && file.creator && (
                                            <Group gap='xs'>
                                                <Avatar size='sm' radius='xl' color='blue' variant='light'>
                                                    <IconUser size={12} />
                                                </Avatar>
                                                <Text size='sm' c='dimmed'>
                                                    Được tải lên bởi <strong>{file.creator.name}</strong>
                                                </Text>
                                            </Group>
                                        )}

                                        {/* Timestamp */}
                                        {showTimestamp && (
                                            <Group gap='xs'>
                                                <IconClock size={14} color='var(--mantine-color-gray-6)' />
                                                <Text size='sm' c='dimmed'>
                                                    {new Date(file.createdAt).toLocaleString('vi-VN')}
                                                </Text>
                                            </Group>
                                        )}

                                        {/* Rejection Display */}
                                        {file.rejector && file.redoReason && (
                                            <RejectionDisplay
                                                rejector={file.rejector}
                                                redoReason={file.redoReason}
                                                rejectionDate={file.createdAt}
                                                itemType={fileNamePrefix}
                                                itemId={file.id}
                                                compact
                                            />
                                        )}

                                        {/* Action buttons */}
                                        {actions.length > 0 && (
                                            <>
                                                <Divider my='xs' />
                                                <Group gap='sm' justify='flex-end'>
                                                    {actions.map((action, actionIndex) => {
                                                        if (!action.condition(file)) return null

                                                        return (
                                                            <Button
                                                                key={actionIndex}
                                                                variant={action.variant || 'light'}
                                                                color={action.color}
                                                                leftSection={action.icon}
                                                                onClick={() => action.handler(file.id)}
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
