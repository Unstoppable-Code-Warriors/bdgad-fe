import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '../function/notification'
import { useWebSocketNotifications } from './websocket-notifications.hook'
import { useState } from 'react'
import { FEATURE_FLAGS } from '@/utils/feature-flags'

export interface NotificationParams {
    sortOrder?: 'ASC' | 'DESC'
    isRead?: boolean
    type?: 'system' | 'lab_task' | 'analysis_task' | 'validation_task'
    receiverId?: string
}

export interface UseNotificationsOptions {
    enableWebSocket?: boolean
    fallbackToPolling?: boolean
}

export const useNotifications = (params?: NotificationParams, options: UseNotificationsOptions = {}) => {
    const {
        enableWebSocket = FEATURE_FLAGS.WEBSOCKET_NOTIFICATIONS,
        fallbackToPolling = FEATURE_FLAGS.WEBSOCKET_FALLBACK_TO_POLLING
    } = options
    const [usePolling, setUsePolling] = useState(!enableWebSocket)

    // WebSocket connection
    const { connected: wsConnected, error: wsError } = useWebSocketNotifications({
        enabled: enableWebSocket,
        onConnectionChange: (status) => {
            // Fallback to polling if WebSocket fails and fallback is enabled
            if (!status.connected && status.error && fallbackToPolling) {
                console.warn('WebSocket failed, falling back to polling:', status.error)
                setUsePolling(true)
            } else if (status.connected) {
                // Switch off polling when WebSocket connects
                setUsePolling(false)
            }
        }
    })

    // HTTP polling query (used as fallback or when WebSocket is disabled)
    const httpQuery = useQuery({
        queryKey: ['notifications', params],
        queryFn: () => notificationService.getAllNotificationByQuery(params),
        refetchInterval: usePolling ? 30000 : false, // Only poll when needed
        staleTime: usePolling ? 10000 : Infinity, // Cache longer when using WebSocket
        enabled: usePolling || !enableWebSocket
    })

    // Determine which data to return
    return {
        ...httpQuery,
        // Add WebSocket connection info
        webSocket: {
            connected: wsConnected,
            error: wsError,
            usingPolling: usePolling
        }
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
            // Invalidate and refetch notifications after marking as read
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
        }
    })
}
