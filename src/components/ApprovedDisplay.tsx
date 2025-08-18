import { Card, Text, Badge, Group, Avatar, Stack, Box } from '@mantine/core'
import { IconCircleCheck, IconUser } from '@tabler/icons-react'

interface ApprovedDisplayProps {
    approver: {
        id: number
        name: string
        email: string
    }
    reasonApprove?: string | null
    approvalDate?: string
    itemType?: string
    itemId?: number | string
    onViewDetails?: () => void
    compact?: boolean
}

export const ApprovedDisplay = ({ approver, reasonApprove, approvalDate, compact = false }: ApprovedDisplayProps) => {
    if (compact) {
        return (
            <Card
                p='sm'
                radius='md'
                withBorder
                style={{
                    borderColor: 'var(--mantine-color-green-3)'
                }}
            >
                <Group gap='xs' mb='xs' align='center'>
                    <IconCircleCheck size={16} color='var(--mantine-color-green-6)' />
                    <Text size='sm' fw={700} c='green.7' style={{ letterSpacing: 0.2 }}>
                        Đã được phê duyệt
                    </Text>
                    <Badge color='green' variant='light' size='xs' radius='sm'>
                        PHÊ DUYỆT
                    </Badge>
                </Group>
                <Group gap='sm' align='flex-start' mb={reasonApprove ? 4 : 0}>
                    <Avatar size='sm' radius='xl' color='green' variant='light'>
                        <IconUser size={14} />
                    </Avatar>
                    <Stack gap={0} style={{ flex: 1 }}>
                        <Text size='sm' fw={600} c='green.8'>
                            {approver.name}
                        </Text>
                        <Text size='xs' c='green.6'>
                            {approver.email}
                        </Text>
                        {approvalDate && (
                            <Text size='xs' c='green.5'>
                                {new Date(approvalDate).toLocaleString('vi-VN')}
                            </Text>
                        )}
                    </Stack>
                </Group>
                <Box mt='xs'>
                    <Text size='xs' fw={500} c='green.7' mb={2}>
                        Kết quả thẩm định:
                    </Text>
                    {reasonApprove ? (
                        <Card
                            p='xs'
                            radius='sm'
                            bg='white'
                            withBorder
                            style={{
                                borderColor: 'var(--mantine-color-green-2)'
                            }}
                        >
                            <Text size='sm' c='green.8' style={{ lineHeight: 1.5 }}>
                                {reasonApprove}
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
                                Không có kết quả thẩm định được ghi nhận
                            </Text>
                        </Card>
                    )}
                </Box>
            </Card>
        )
    }

    return (
        <Card p='md' radius='md' bg='green.0' withBorder style={{ borderColor: 'var(--mantine-color-green-3)' }}>
            <Stack gap='md'>
                <Group gap='xs'>
                    <IconCircleCheck size={16} color='var(--mantine-color-green-6)' />
                    <Text size='sm' fw={600} c='green.7'>
                        File đã được phê duyệt
                    </Text>
                    <Badge color='green' variant='light' size='xs'>
                        PHÊ DUYỆT
                    </Badge>
                </Group>

                <Group gap='sm'>
                    <Avatar size='md' radius='xl' color='green' variant='light'>
                        <IconUser size={14} />
                    </Avatar>
                    <Box style={{ flex: 1 }}>
                        <Text size='sm' fw={500} c='green.8'>
                            {approver.name}
                        </Text>
                        <Text size='xs' c='green.6'>
                            {approver.email}
                        </Text>
                        {approvalDate && (
                            <Text size='xs' c='green.6'>
                                Phê duyệt lúc: {new Date(approvalDate).toLocaleString('vi-VN')}
                            </Text>
                        )}
                    </Box>
                </Group>

                {reasonApprove ? (
                    <Box>
                        <Text size='sm' fw={500} c='green.7' mb='xs'>
                            Kết quả thẩm định:
                        </Text>
                        <Card
                            p='sm'
                            radius='sm'
                            bg='white'
                            withBorder
                            style={{ borderColor: 'var(--mantine-color-green-2)' }}
                        >
                            <Text size='sm' c='green.8' style={{ lineHeight: 1.5 }}>
                                {reasonApprove}
                            </Text>
                        </Card>
                    </Box>
                ) : (
                    <Box>
                        <Text size='sm' fw={500} c='green.7' mb='xs'>
                            Kết quả thẩm định:
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
                                Không có kết quả thẩm định được ghi nhận
                            </Text>
                        </Card>
                    </Box>
                )}
            </Stack>
        </Card>
    )
}
