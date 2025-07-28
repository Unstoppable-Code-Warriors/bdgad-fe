import {
    ActionIcon,
    Menu,
    Indicator,
    ScrollArea,
    UnstyledButton,
    Divider,
    Group,
    Text,
    Stack,
    Badge
} from '@mantine/core'
import { IconBell, IconCheck } from '@tabler/icons-react'
import { useNotifications, useMarkNotificationAsRead } from '@/services/hook/notification.hook'
import { useUser } from '@/services/hook/auth.hook'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { showErrorNotification } from '@/utils/notifications'
import type { Notification } from '@/types/notification'
import { Role } from '@/utils/constant'

const NotificationBell = () => {
    const navigate = useNavigate()
    const [opened, setOpened] = useState(false)
    const { data: user } = useUser()
    const userProfile = user?.data?.user

    const { data: notificationsResponse, isLoading } = useNotifications({
        receiverId: userProfile?.id?.toString(),
        sortOrder: 'DESC'
    })

    const markAsReadMutation = useMarkNotificationAsRead()

    const notifications = notificationsResponse || []

    const unreadCount = useMemo(() => notifications.filter((n: Notification) => !n.isRead).length, [notifications])

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await markAsReadMutation.mutateAsync(notificationId)
        } catch (error) {
            console.error('Error marking notification as read:', error)
            showErrorNotification({
                title: 'Lỗi',
                message: 'Không thể đánh dấu thông báo đã đọc'
            })
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter((n) => !n.isRead)

            const promises = unreadNotifications.map((notification) => markAsReadMutation.mutateAsync(notification.id))

            await Promise.all(promises)
        } catch (error) {
            console.error('Error marking all notifications as read:', error)
            showErrorNotification({
                title: 'Lỗi',
                message: 'Không thể đánh dấu tất cả thông báo đã đọc'
            })
        }
    }

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification.id)
        }

        setOpened(false)

        const userRole = Number(userProfile?.roles[0].code)

        switch (userRole) {
            case Role.LAB_TESTING_TECHNICIAN:
                if (notification.barcode) {
                    navigate(`/lab-test?search=${notification.barcode}`)
                } else {
                    navigate('/lab-test')
                }
                break

            case Role.ANALYSIS_TECHNICIAN:
                if (notification.barcode) {
                    navigate(`/analysis?search=${notification.barcode}`)
                } else {
                    navigate('/analysis')
                }
                break

            case Role.VALIDATION_TECHNICIAN:
                if (notification.barcode) {
                    navigate(`/validation?search=${notification.barcode}`)
                } else {
                    navigate('/validation')
                }
                break

            case Role.DOCTOR:
                if (notification.barcode) {
                    navigate(`/doctor-dashboard?search=${notification.barcode}`)
                } else {
                    navigate('/doctor-dashboard')
                }
                break

            case Role.STAFF:
            default:
                if (notification.barcode) {
                    navigate(`/lab-test?search=${notification.barcode}`)
                } else {
                    navigate('/lab-test')
                }
                break
        }
    }

    // Helper function để format thời gian
    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()

        const minutes = Math.floor(diff / (1000 * 60))
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (minutes < 60) {
            return `${minutes} phút trước`
        } else if (hours < 24) {
            return `${hours} giờ trước`
        } else {
            return `${days} ngày trước`
        }
    }

    // Helper function để format labcode array thành string
    const formatLabcode = (labcode?: string[]) => {
        if (!labcode || labcode.length === 0) return null
        return labcode.join(', ')
    }

    const getNotificationColor = (type: string, subType?: string) => {
        // If subType exists, prioritize it for color
        if (subType === 'accept') return 'green'
        if (subType === 'reject') return 'red'

        // Default type colors
        switch (type) {
            case 'system':
                return 'blue'
            case 'lab_task':
                return 'green'
            case 'analysis_task':
                return 'purple'
            case 'validation_task':
                return 'orange'
            default:
                return 'gray'
        }
    }

    const getNotificationTypeLabel = (type: string) => {
        switch (type) {
            case 'system':
                return 'Hệ thống'
            case 'lab_task':
                return 'Xét nghiệm'
            case 'analysis_task':
                return 'Phân tích'
            case 'validation_task':
                return 'Thẩm định'
            default:
                return 'Khác'
        }
    }

    if (isLoading) {
        return (
            <ActionIcon variant='light' size='lg' radius='md' loading>
                <IconBell size={18} />
            </ActionIcon>
        )
    }

    return (
        <Menu shadow='md' width={400} position='bottom-end' opened={opened} onChange={setOpened}>
            <Menu.Target>
                <ActionIcon variant='light' size='lg' radius='md'>
                    <Indicator
                        color='red'
                        size={16}
                        disabled={unreadCount === 0}
                        label={unreadCount > 9 ? '9+' : unreadCount}
                    >
                        <IconBell size={18} />
                    </Indicator>
                </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
                <Group justify='space-between' p='sm'>
                    <Text fw={600} size='sm'>
                        Thông báo
                    </Text>
                    {unreadCount > 0 && (
                        <UnstyledButton onClick={handleMarkAllAsRead} disabled={markAsReadMutation.isPending}>
                            <Text size='xs' c='blue'>
                                {markAsReadMutation.isPending ? 'Đang xử lý...' : 'Đánh dấu đã đọc tất cả'}
                            </Text>
                        </UnstyledButton>
                    )}
                </Group>
                <Divider />

                <ScrollArea h={300}>
                    {notifications.length === 0 ? (
                        <Text ta='center' c='dimmed' p='md'>
                            Không có thông báo nào
                        </Text>
                    ) : (
                        notifications.map((notification: Notification) => (
                            <UnstyledButton
                                key={notification.id}
                                w='100%'
                                p='sm'
                                onClick={() => handleNotificationClick(notification)}
                                style={{
                                    backgroundColor: notification.isRead
                                        ? 'transparent'
                                        : 'var(--mantine-color-blue-0)',
                                    borderBottom: '1px solid var(--mantine-color-gray-2)',
                                    cursor: 'pointer'
                                }}
                            >
                                <Group gap='sm' align='flex-start'>
                                    <Badge
                                        size='xs'
                                        color={getNotificationColor(notification.taskType, notification.subType)}
                                        variant='dot'
                                    />
                                    <Stack gap={2} style={{ flex: 1 }}>
                                        <Group justify='space-between' align='flex-start'>
                                            <Text size='sm' fw={notification.isRead ? 400 : 600} lineClamp={1}>
                                                {notification.title}
                                                {notification.subType === 'reject' && (
                                                    <Text span size='xs' c='red' fw={700} ml={5}>
                                                        (Từ chối)
                                                    </Text>
                                                )}
                                            </Text>
                                            <Badge
                                                size='xs'
                                                color={getNotificationColor(
                                                    notification.taskType,
                                                    notification.subType
                                                )}
                                                variant='light'
                                            >
                                                {getNotificationTypeLabel(notification.taskType)}
                                            </Badge>
                                        </Group>
                                        <Text size='xs' c='dimmed' lineClamp={2} mr='lg'>
                                            {notification.message}
                                        </Text>
                                        {(notification.labcode || notification.barcode) && (
                                            <Group gap='xs'>
                                                {notification.labcode && (
                                                    <Text size='xs' c='blue.6' fw={500}>
                                                        Labcode: {formatLabcode(notification.labcode)}
                                                    </Text>
                                                )}
                                                {notification.barcode && (
                                                    <Text size='xs' c='green.6' fw={500}>
                                                        Barcode: {notification.barcode}
                                                    </Text>
                                                )}
                                            </Group>
                                        )}
                                        <Group justify='space-between' align='center'>
                                            <Text size='xs' c='dimmed'>
                                                Từ: {notification.sender.name}
                                            </Text>
                                            <Text size='xs' c='dimmed'>
                                                {formatTime(notification.createdAt)}
                                            </Text>
                                        </Group>
                                    </Stack>
                                    {!notification.isRead && (
                                        <ActionIcon
                                            size='sm'
                                            variant='subtle'
                                            loading={markAsReadMutation.isPending}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleMarkAsRead(notification.id)
                                            }}
                                        >
                                            <IconCheck size={12} />
                                        </ActionIcon>
                                    )}
                                </Group>
                            </UnstyledButton>
                        ))
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <>
                        <Divider />
                        <UnstyledButton w='100%' p='sm'>
                            <Text ta='center' size='sm' c='blue'>
                                Xem tất cả thông báo
                            </Text>
                        </UnstyledButton>
                    </>
                )}
            </Menu.Dropdown>
        </Menu>
    )
}

export default NotificationBell
