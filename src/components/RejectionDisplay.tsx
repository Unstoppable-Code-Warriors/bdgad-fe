import { Card, Text, Badge, Group, Avatar, Stack, Box } from '@mantine/core'
import { IconAlertTriangle, IconUser } from '@tabler/icons-react'

interface RejectionDisplayProps {
    rejector: {
        id: number
        name: string
        email: string
    }
    redoReason?: string | null
    rejectionDate?: string
    itemType?: string
    itemId?: number | string
    onViewDetails?: () => void
    compact?: boolean
}

export const RejectionDisplay = ({ rejector, redoReason, rejectionDate, compact = false }: RejectionDisplayProps) => {
    if (compact) {
        return (
            <Card
                p='sm'
                radius='md'
                bg='red.0'
                withBorder
                style={{
                    borderColor: 'var(--mantine-color-red-3)',
                    boxShadow: '0 2px 8px 0 rgba(255, 0, 0, 0.07)'
                }}
            >
                <Group gap='xs' mb='xs' align='center'>
                    <IconAlertTriangle size={16} color='var(--mantine-color-red-6)' />
                    <Text size='sm' fw={700} c='red.7' style={{ letterSpacing: 0.2 }}>
                        Đã bị từ chối
                    </Text>
                    <Badge color='red' variant='light' size='xs' radius='sm'>
                        TỪ CHỐI
                    </Badge>
                </Group>
                <Group gap='sm' align='flex-start' mb={redoReason ? 4 : 0}>
                    <Avatar size='sm' radius='xl' color='red' variant='light'>
                        <IconUser size={14} />
                    </Avatar>
                    <Stack gap={0} style={{ flex: 1 }}>
                        <Text size='sm' fw={600} c='red.8'>
                            {rejector.name}
                        </Text>
                        <Text size='xs' c='red.6'>
                            {rejector.email}
                        </Text>
                        {rejectionDate && (
                            <Text size='xs' c='red.5'>
                                {new Date(rejectionDate).toLocaleString('vi-VN')}
                            </Text>
                        )}
                    </Stack>
                </Group>
                <Box mt='xs'>
                    <Text size='xs' fw={500} c='red.7' mb={2}>
                        Lý do từ chối:
                    </Text>
                    {redoReason ? (
                        <Card
                            p='xs'
                            radius='sm'
                            bg='white'
                            withBorder
                            style={{
                                borderColor: 'var(--mantine-color-red-2)',
                                background: 'linear-gradient(90deg, #fff 80%, #ffeaea 100%)'
                            }}
                        >
                            <Text size='sm' c='red.8' style={{ lineHeight: 1.5 }}>
                                {redoReason}
                            </Text>
                        </Card>
                    ) : (
                        <Card
                            p='xs'
                            radius='sm'
                            bg='gray.1'
                            withBorder
                            style={{
                                borderStyle: 'dashed',
                                borderColor: 'var(--mantine-color-gray-4)'
                            }}
                        >
                            <Text size='sm' c='gray.6' fs='italic'>
                                Không có lý do được ghi nhận
                            </Text>
                        </Card>
                    )}
                </Box>
            </Card>
        )
    }

    return (
        <Card p='md' radius='md' bg='red.0' withBorder style={{ borderColor: 'var(--mantine-color-red-3)' }}>
            <Stack gap='md'>
                <Group gap='xs'>
                    <IconAlertTriangle size={16} color='var(--mantine-color-red-6)' />
                    <Text size='sm' fw={600} c='red.7'>
                        File đã bị từ chối
                    </Text>
                    <Badge color='red' variant='light' size='xs'>
                        TỪ CHỐI
                    </Badge>
                </Group>

                <Group gap='sm'>
                    <Avatar size='md' radius='xl' color='red' variant='light'>
                        <IconUser size={14} />
                    </Avatar>
                    <Box style={{ flex: 1 }}>
                        <Text size='sm' fw={500} c='red.8'>
                            {rejector.name}
                        </Text>
                        <Text size='xs' c='red.6'>
                            {rejector.email}
                        </Text>
                        {rejectionDate && (
                            <Text size='xs' c='red.6'>
                                Từ chối lúc: {new Date(rejectionDate).toLocaleString('vi-VN')}
                            </Text>
                        )}
                    </Box>
                </Group>

                {redoReason ? (
                    <Box>
                        <Text size='sm' fw={500} c='red.7' mb='xs'>
                            Lý do từ chối:
                        </Text>
                        <Card
                            p='sm'
                            radius='sm'
                            bg='white'
                            withBorder
                            style={{ borderColor: 'var(--mantine-color-red-2)' }}
                        >
                            <Text size='sm' c='red.8' style={{ lineHeight: 1.5 }}>
                                {redoReason}
                            </Text>
                        </Card>
                    </Box>
                ) : (
                    <Box>
                        <Text size='sm' fw={500} c='red.7' mb='xs'>
                            Lý do từ chối:
                        </Text>
                        <Card
                            p='sm'
                            radius='sm'
                            bg='gray.1'
                            withBorder
                            style={{
                                borderStyle: 'dashed',
                                borderColor: 'var(--mantine-color-gray-4)'
                            }}
                        >
                            <Text size='sm' c='gray.6' fs='italic'>
                                Không có lý do được ghi nhận
                            </Text>
                        </Card>
                    </Box>
                )}
            </Stack>
        </Card>
    )
}
