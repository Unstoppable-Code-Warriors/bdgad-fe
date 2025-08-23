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
import { useMarkNotificationAsRead } from '@/services/hook/notification.hook'
import { useUser } from '@/services/hook/auth.hook'
import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { showErrorNotification } from '@/utils/notifications'
import type { Notification } from '@/types/notification'
import { Role } from '@/utils/constant'
import { notificationService } from '@/services/function/notification'

const NotificationBell = () => {
    const navigate = useNavigate()
    const [opened, setOpened] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const { data: user } = useUser()
    const userProfile = user?.data?.user

    const markAsReadMutation = useMarkNotificationAsRead()

    // Fetch initial notifications
    useEffect(() => {
        if (!userProfile?.id) return

        const fetchInitialNotifications = async () => {
            try {
                setIsLoading(true)
                console.log('📥 Fetching initial notifications for user:', userProfile.id)

                const initialNotifications = await notificationService.getAllNotificationByQuery({
                    receiverId: userProfile.id.toString(),
                    sortOrder: 'DESC'
                })

                console.log('📥 Fetched initial notifications:', initialNotifications.length)
                setNotifications(initialNotifications || [])
            } catch (error) {
                console.error('Failed to fetch initial notifications:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchInitialNotifications()
    }, [userProfile?.id])

    // Setup SSE connection
    useEffect(() => {
        if (!userProfile?.id) return

        console.log('🔗 Setting up SSE connection for user:', userProfile.id)

        // Connect to SSE
        notificationService.connectSse(userProfile.id)

        // Handle SSE connection status
        const unsubConnection = notificationService.onSseConnectionChange((status) => {
            console.log('🔗 SSE connection status received in component:', status)
        })

        // Handle SSE notifications
        const unsubNotification = notificationService.onSseNotification((event) => {
            console.log('🔔 SSE notification received in component:', event.type, event.data)

            if (event.type === 'notification_created') {
                const newNotification = event.data as Notification
                console.log('🆕 Adding new notification to local state:', newNotification.id)

                setNotifications((prev) => {
                    // Add new notification at the beginning, avoid duplicates
                    const exists = prev.some((n) => n.id === newNotification.id)
                    if (exists) {
                        console.log('⚠️ Notification already exists, skipping')
                        return prev
                    }

                    const updated = [newNotification, ...prev]
                    console.log('✅ Updated notifications count:', updated.length)
                    return updated
                })
            } else if (event.type === 'notification_updated') {
                const updatedNotification = event.data as Notification
                console.log('🔄 Updating notification in local state:', updatedNotification.id)

                setNotifications((prev) => prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n)))
            }
        })

        console.log('🔗 SSE callbacks registered successfully')

        return () => {
            console.log('🧹 Cleaning up SSE connection')
            unsubConnection()
            unsubNotification()
            notificationService.disconnectSse()
        }
    }, [userProfile?.id])

    // Debug logging
    useEffect(() => {
        console.log('🔔 Notifications state updated:', {
            count: notifications.length,
            notifications: notifications.map((n) => ({ id: n.id, title: n.title, createdAt: n.createdAt }))
        })
    }, [notifications])

    const unreadCount = useMemo(() => notifications.filter((n: Notification) => !n.isRead).length, [notifications])

    // Handle errors
    if (isLoading) {
        return (
            <ActionIcon variant='light' size='lg' radius='md' loading>
                <IconBell size={18} />
            </ActionIcon>
        )
    }

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
                if (notification.labcode) {
                    navigate(`/lab-test?search=${notification.labcode}`)
                } else {
                    navigate('/lab-test')
                }
                break

            case Role.ANALYSIS_TECHNICIAN:
                if (notification.labcode) {
                    navigate(`/analysis?search=${notification.labcode}`)
                } else {
                    navigate('/analysis')
                }
                break

            case Role.VALIDATION_TECHNICIAN:
                if (notification.labcode) {
                    navigate(`/validation?search=${notification.labcode}`)
                } else {
                    navigate('/validation')
                }
                break

            case Role.STAFF:
            default:
                if (notification.labcode) {
                    navigate(`/lab-test?search=${notification.labcode}`)
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
        let diff = now.getTime() - date.getTime()

        // Chống số âm do sai lệch đồng hồ/zone
        if (diff < 0) diff = 0

        const minutes = Math.floor(diff / (1000 * 60))
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (minutes < 1) {
            return 'Vừa xong'
        } else if (minutes < 60) {
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

        // Use type field from BE for color (INFO, WARNING, ERROR, SUCCESS)
        switch (type) {
            case 'INFO':
                return 'blue'
            case 'WARNING':
                return 'orange'
            case 'ERROR':
                return 'red'
            case 'SUCCESS':
                return 'green'
            default:
                return 'gray'
        }
    }

    const getNotificationTypeLabel = (type: string) => {
        // Use type field from BE for display label
        switch (type) {
            case 'INFO':
                return 'Thông tin'
            case 'WARNING':
                return 'Cảnh báo'
            case 'ERROR':
                return 'Lỗi'
            case 'SUCCESS':
                return 'Thành công'
            default:
                return 'Khác'
        }
    }

    const getTaskTypeLabel = (taskType?: string) => {
        if (!taskType) return 'Khác'
        switch (taskType) {
            case 'lab_task':
                return 'Xét nghiệm'
            case 'analysis_task':
                return 'Phân tích'
            case 'validation_task':
                return 'Thẩm định'
            case 'system':
                return 'Hệ thống'
            default:
                return 'Khác'
        }
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
                    <Group gap='xs'>
                        {unreadCount > 0 && (
                            <UnstyledButton onClick={handleMarkAllAsRead} disabled={markAsReadMutation.isPending}>
                                <Text size='xs' c='blue'>
                                    {markAsReadMutation.isPending ? 'Đang xử lý...' : 'Đánh dấu đã đọc tất cả'}
                                </Text>
                            </UnstyledButton>
                        )}
                    </Group>
                </Group>
                <Divider />

                <ScrollArea h={300}>
                    {isLoading ? (
                        <Text ta='center' c='dimmed' p='md'>
                            Đang tải thông báo cũ...
                        </Text>
                    ) : notifications.length === 0 ? (
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
                                        color={getNotificationColor(notification.type, notification.subType)}
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
                                            <Group gap='xs'>
                                                <Badge
                                                    size='xs'
                                                    color={getNotificationColor(
                                                        notification.type,
                                                        notification.subType
                                                    )}
                                                    variant='light'
                                                >
                                                    {getNotificationTypeLabel(notification.type)}
                                                </Badge>
                                                <Badge size='xs' color='gray' variant='outline'>
                                                    {getTaskTypeLabel(notification.taskType)}
                                                </Badge>
                                            </Group>
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

                <UnstyledButton w='100%' p='sm'></UnstyledButton>
            </Menu.Dropdown>
        </Menu>
    )
}

export default NotificationBell
