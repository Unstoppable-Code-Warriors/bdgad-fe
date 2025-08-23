import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '../function/notification'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useUser } from './auth.hook'
import { FEATURE_FLAGS } from '@/utils/feature-flags'
import type { SseConnectionStatus, SseNotificationEvent } from '@/services/sse.service'
import type { Notification } from '@/types/notification'

export interface NotificationParams {
    sortOrder?: 'ASC' | 'DESC'
    isRead?: boolean
    taskType?: 'system' | 'lab_task' | 'analysis_task' | 'validation_task'
    receiverId?: string
}

export interface UseNotificationsOptions {
    enableSse?: boolean
    fallbackToPolling?: boolean
}

// Hook for REST API notifications with TanStack Query
export const useNotifications = (params?: NotificationParams, options: UseNotificationsOptions = {}) => {
    const { enableSse = FEATURE_FLAGS.SSE_NOTIFICATIONS } = options
    const [usePolling] = useState(!enableSse)

    // Stabilize params object to prevent infinite loop
    const stableParams = useMemo(
        () => params,
        [params?.receiverId, params?.sortOrder, params?.isRead, params?.taskType]
    )

    // Stable query key for cache operations
    const stableQueryKey = useMemo(() => ['notifications', stableParams], [stableParams])

    // HTTP polling query (used as fallback or when SSE is disabled)
    const httpQuery = useQuery({
        queryKey: stableQueryKey,
        queryFn: () => notificationService.getAllNotificationByQuery(stableParams),
        refetchInterval: usePolling ? 30000 : false, // Only poll when needed
        staleTime: usePolling ? 10000 : Infinity, // Cache longer when using SSE
        enabled: usePolling || !enableSse
    })

    return {
        ...httpQuery,
        // Add polling status
        usingPolling: usePolling
    }
}

// Hook for SSE real-time notifications (separate from TanStack Query)
export const useSseNotifications = (userId?: number) => {
    const [sseStatus, setSseStatus] = useState<SseConnectionStatus>({
        connected: false,
        connecting: false,
        error: null
    })
    const [isLoadingInitial, setIsLoadingInitial] = useState(false)
    const [realTimeNotifications, setRealTimeNotifications] = useState<Notification[]>([])

    // Ref to track if initial notifications have been fetched
    const initialNotificationsFetched = useRef(false)

    // SSE connection management
    useEffect(() => {
        if (!FEATURE_FLAGS.SSE_NOTIFICATIONS || !userId) return

        let retryTimeout: NodeJS.Timeout

        const handleConnectionChange = (status: SseConnectionStatus) => {
            setSseStatus(status)

            if (status.connected) {
                console.log('SSE connected successfully')

                // Fetch initial notifications when SSE connects for the first time
                if (!initialNotificationsFetched.current) {
                    initialNotificationsFetched.current = true
                    setIsLoadingInitial(true)

                    console.log('📥 Fetching initial notifications for user:', userId)

                    notificationService
                        .getInitialNotifications(userId, 50)
                        .then((initialData) => {
                            if (initialData && initialData.length > 0) {
                                console.log('📥 Fetched initial notifications:', initialData.length)

                                // Set initial notifications to local state (not TanStack Query)
                                setRealTimeNotifications(initialData)
                            }
                        })
                        .catch((error) => {
                            console.error('Failed to fetch initial notifications:', error)
                        })
                        .finally(() => {
                            setIsLoadingInitial(false)
                        })
                }
            } else if (status.error && FEATURE_FLAGS.SSE_FALLBACK_TO_POLLING) {
                console.warn('SSE failed, falling back to polling:', status.error)

                // Retry SSE connection after 5 seconds
                retryTimeout = setTimeout(() => {
                    if (FEATURE_FLAGS.SSE_NOTIFICATIONS && userId) {
                        console.log('Retrying SSE connection...')
                        notificationService.connectSse(userId)
                    }
                }, 5000)
            }
        }

        const handleNotification = (event: SseNotificationEvent) => {
            const notification = event.data as Notification
            console.log('🔔 SSE notification received:', event.type, notification)

            switch (event.type) {
                case 'notification_created':
                    setRealTimeNotifications((prev) => {
                        // Add new notification at the beginning
                        const updated = [notification, ...prev]
                        // Remove duplicates by ID
                        const unique = updated.filter(
                            (item, index, self) => index === self.findIndex((t) => t.id === item.id)
                        )
                        return unique
                    })
                    break

                case 'notification_updated':
                    setRealTimeNotifications((prev) => prev.map((n) => (n.id === notification.id ? notification : n)))
                    break
            }
        }

        // Connect to SSE
        notificationService.connectSse(userId)

        // Subscribe to events
        const unsubConnection = notificationService.onSseConnectionChange(handleConnectionChange)
        const unsubNotification = notificationService.onSseNotification(handleNotification)

        return () => {
            unsubConnection()
            unsubNotification()
            notificationService.disconnectSse()
            if (retryTimeout) {
                clearTimeout(retryTimeout)
            }
        }
    }, [userId])

    return {
        // SSE connection status
        sse: {
            connected: sseStatus.connected,
            error: sseStatus.error,
            usingPolling: false
        },
        // Real-time notifications (not from TanStack Query)
        realTimeNotifications,
        // Initial loading state
        isLoadingInitial
    }
}

// Combined hook that merges REST API and SSE notifications
export const useCombinedNotifications = (params?: NotificationParams, options: UseNotificationsOptions = {}) => {
    const { enableSse = FEATURE_FLAGS.SSE_NOTIFICATIONS } = options

    // Get REST API notifications
    const restNotifications = useNotifications(params, options)

    // Get SSE real-time notifications
    const { data: user } = useUser()
    const userId = user?.data?.user?.id
    const sseNotifications = useSseNotifications(userId)

    // Merge notifications: SSE real-time + REST API (if polling)
    const combinedNotifications = useMemo(() => {
        const sseData = sseNotifications.realTimeNotifications || []
        const restData = restNotifications.data || []

        if (!enableSse) {
            // Only REST API when SSE is disabled
            return restData
        }

        if (sseNotifications.sse.connected) {
            // SSE connected: use SSE data as primary, merge with REST if needed
            const merged = [...sseData, ...restData]
            // Remove duplicates by ID, prioritize SSE data
            const unique = merged.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
            return unique
        } else {
            // SSE not connected: fallback to REST API
            return restData
        }
    }, [sseNotifications.realTimeNotifications, restNotifications.data, sseNotifications.sse.connected, enableSse])

    return {
        // Combined data
        data: combinedNotifications,
        // Loading states
        isLoading: restNotifications.isLoading || sseNotifications.isLoadingInitial,
        isLoadingInitial: sseNotifications.isLoadingInitial,
        // SSE status
        sse: sseNotifications.sse,
        // REST API status
        usingPolling: restNotifications.usingPolling,
        // Error handling
        error: restNotifications.error || sseNotifications.sse.error,
        // Refetch function
        refetch: restNotifications.refetch
    }
}

export const useUnreadNotificationsCount = (receiverId?: string) => {
    return useQuery({
        queryKey: ['notifications-unread-count', receiverId],
        queryFn: () =>
            notificationService.getAllNotificationByQuery({
                isRead: false,
                receiverId,
                sortOrder: 'DESC'
            }),
        refetchInterval: 30000,
        staleTime: 10000,
        select: (data) => data?.filter((n) => !n.isRead).length || 0
    })
}

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (notificationId: number) => notificationService.markNotificationAsRead(notificationId),
        onSuccess: () => {
            // Invalidate and refetch all notifications queries
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
        }
    })
}
