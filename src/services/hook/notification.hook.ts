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

export const useNotifications = (params?: NotificationParams, options: UseNotificationsOptions = {}) => {
    const { enableSse = FEATURE_FLAGS.SSE_NOTIFICATIONS, fallbackToPolling = FEATURE_FLAGS.SSE_FALLBACK_TO_POLLING } =
        options
    const [usePolling, setUsePolling] = useState(!enableSse)
    const [sseStatus, setSseStatus] = useState<SseConnectionStatus>({
        connected: false,
        connecting: false,
        error: null
    })
    const [isLoadingInitial, setIsLoadingInitial] = useState(false)

    const { data: user } = useUser()
    const userProfile = user?.data?.user
    const userId = userProfile?.id
    const queryClient = useQueryClient()

    // Ref to track if initial notifications have been fetched
    const initialNotificationsFetched = useRef(false)

    // Stabilize params object to prevent infinite loop
    const stableParams = useMemo(
        () => params,
        [params?.receiverId, params?.sortOrder, params?.isRead, params?.taskType]
    )

    // Stable query key for cache operations
    const stableQueryKey = useMemo(() => ['notifications', stableParams], [stableParams])

    // SSE connection management - separate from params dependency
    useEffect(() => {
        if (!enableSse || !userId) return

        let retryTimeout: NodeJS.Timeout

        const handleConnectionChange = (status: SseConnectionStatus) => {
            setSseStatus(status)

            // Fallback to polling if SSE fails and fallback is enabled
            if (!status.connected && status.error && fallbackToPolling) {
                console.warn('SSE failed, falling back to polling:', status.error)
                setUsePolling(true)

                // Retry SSE connection after 5 seconds
                retryTimeout = setTimeout(() => {
                    if (enableSse && userId) {
                        console.log('Retrying SSE connection...')
                        notificationService.connectSse(userId)
                    }
                }, 5000)
            } else if (status.connected) {
                // Switch off polling when SSE connects
                setUsePolling(false)
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
                                console.log('📥 Cache key being used:', stableQueryKey)

                                // Merge with existing data and deduplicate by ID
                                queryClient.setQueryData(stableQueryKey, (oldData: Notification[] | undefined) => {
                                    console.log('📥 Merging with existing data:', {
                                        initial: initialData.length,
                                        existing: oldData?.length || 0
                                    })

                                    if (!oldData) return initialData

                                    // Merge and deduplicate by ID
                                    const merged = [...initialData, ...oldData]
                                    const unique = merged.filter(
                                        (item, index, self) => index === self.findIndex((t) => t.id === item.id)
                                    )

                                    console.log('📥 Final merged result:', {
                                        initial: initialData.length,
                                        existing: oldData.length,
                                        total: unique.length,
                                        unique: unique.length
                                    })

                                    return unique
                                })

                                // Invalidate unread count to refresh
                                queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
                            }
                        })
                        .catch((error) => {
                            console.error('Failed to fetch initial notifications:', error)
                        })
                        .finally(() => {
                            setIsLoadingInitial(false)
                        })
                }
            }
        }

        const handleNotification = (event: SseNotificationEvent) => {
            const notification = event.data as Notification
            console.log('🔔 SSE notification received:', event.type, notification)

            switch (event.type) {
                case 'notification_created':
                    queryClient.setQueryData(stableQueryKey, (oldData: Notification[] | undefined) => {
                        if (!oldData) return [notification]
                        return [notification, ...oldData]
                    })
                    queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
                    break
                case 'notification_updated':
                    queryClient.setQueryData(stableQueryKey, (oldData: Notification[] | undefined) => {
                        if (!oldData) return []
                        return oldData.map((n) => (n.id === notification.id ? notification : n))
                    })
                    queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
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
    }, [enableSse, userId, fallbackToPolling, queryClient, stableQueryKey]) // Remove params dependency

    // HTTP polling query (used as fallback or when SSE is disabled)
    const httpQuery = useQuery({
        queryKey: stableQueryKey,
        queryFn: () => notificationService.getAllNotificationByQuery(stableParams),
        refetchInterval: usePolling ? 30000 : false, // Only poll when needed
        staleTime: usePolling ? 10000 : Infinity, // Cache longer when using SSE
        enabled: usePolling || !enableSse
    })

    // Determine which data to return
    return {
        ...httpQuery,
        // Add SSE connection info and initial loading state
        sse: {
            connected: sseStatus.connected,
            error: sseStatus.error,
            usingPolling: usePolling
        },
        isLoadingInitial
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
