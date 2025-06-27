import { Card, Text, Badge, Group, Avatar, Stack, Box, Button } from '@mantine/core'
import { IconAlertTriangle, IconUser, IconEye } from '@tabler/icons-react'
import { modals } from '@mantine/modals'

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
    itemType = 'item',
    itemId,
    onViewDetails,
    compact = false
}: RejectionDisplayProps) => {
    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails()
            return
        }

        // Default modal implementation
        modals.open({
            title: (
                <Group gap='sm'>
                    <IconAlertTriangle size={20} color='var(--mantine-color-red-6)' />
                    <Text fw={600} c='red.7'>
                        Chi tiết từ chối
                    </Text>
                </Group>
            ),
            children: (
                <Stack gap='lg'>
                    <Card p='md' bg='red.0' radius='md' withBorder>
                        <Group gap='sm' mb='md'>
                            <Avatar size='md' radius='xl' color='red' variant='light'>
                                <IconUser size={14} />
                            </Avatar>
                            <Box>
                                <Text size='sm' fw={500} c='red.8'>
                                    {itemType} #{itemId}
                                </Text>
                                {rejectionDate && (
                                    <Text size='xs' c='red.6'>
                                        Từ chối lúc: {new Date(rejectionDate).toLocaleString('vi-VN')}
                                    </Text>
                                )}
                            </Box>
                        </Group>

                        <Box>
                            <Text size='sm' fw={500} c='red.7' mb='xs'>
                                Người từ chối:
                            </Text>
                            <Group gap='sm'>
                                <Avatar size='sm' radius='xl' color='red' variant='light'>
                                    <IconUser size={12} />
                                </Avatar>
                                <Box>
                                    <Text size='sm' fw={500}>
                                        {rejector.name}
                                    </Text>
                                    <Text size='xs' c='dimmed'>
                                        {rejector.email}
                                    </Text>
                                </Box>
                            </Group>
                        </Box>
                    </Card>

                    <Box>
                        <Text size='sm' fw={500} mb='xs'>
                            Lý do từ chối:
                        </Text>
                        {redoReason ? (
                            <Card p='md' bg='gray.0' radius='md' withBorder>
                                <Text size='sm' style={{ lineHeight: 1.6 }}>
                                    {redoReason}
                                </Text>
                            </Card>
                        ) : (
                            <Card p='md' bg='gray.1' radius='md' withBorder style={{ borderStyle: 'dashed' }}>
                                <Group gap='sm'>
                                    <IconAlertTriangle size={16} color='var(--mantine-color-orange-6)' />
                                    <Text size='sm' c='orange.7' fs='italic'>
                                        Không có lý do từ chối được ghi nhận
                                    </Text>
                                </Group>
                            </Card>
                        )}
                    </Box>

                    <Group justify='flex-end' mt='md'>
                        <Button variant='light' onClick={() => modals.closeAll()}>
                            Đóng
                        </Button>
                    </Group>
                </Stack>
            )
        })
    }

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
                    {(redoReason || onViewDetails) && (
                        <Button
                            variant='subtle'
                            color='red'
                            size='xs'
                            leftSection={<IconEye size={12} />}
                            onClick={handleViewDetails}
                        >
                            Chi tiết
                        </Button>
                    )}
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

                {(redoReason || onViewDetails) && (
                    <Group justify='flex-end'>
                        <Button
                            variant='filled'
                            color='red'
                            leftSection={<IconEye size={16} />}
                            onClick={handleViewDetails}
                            size='sm'
                            radius='md'
                        >
                            Xem chi tiết từ chối
                        </Button>
                    </Group>
                )}
            </Stack>
        </Card>
    )
}
