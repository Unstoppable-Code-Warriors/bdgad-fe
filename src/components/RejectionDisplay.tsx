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

export const RejectionDisplay = ({
    rejector,
    redoReason,
    rejectionDate,
    compact = false
}: RejectionDisplayProps) => {
 

    if (compact) {
        return (
            <Card p='sm' radius='md' bg='red.0' withBorder style={{ borderColor: 'var(--mantine-color-red-3)' }}>
                <Group gap='xs' mb='xs'>
                    <IconAlertTriangle size={14} color='var(--mantine-color-red-6)' />
                    <Text size='sm' fw={500} c='red'>
                        Bị từ chối bởi
                    </Text>
                </Group>
                <Group gap='sm'>
                    <Avatar size='sm' radius='xl' color='red' variant='light'>
                        <IconUser size={12} />
                    </Avatar>
                    <Stack gap={2} style={{ flex: 1 }}>
                        <Text size='sm' fw={500} c='red.7'>
                            {rejector.name}
                        </Text>
                        <Text size='xs' c='red.6'>
                            {rejector.email}
                        </Text>
                    </Stack>

                </Group>
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
