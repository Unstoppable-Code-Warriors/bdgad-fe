import { useEffect, useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Notification } from '@/types/notification'
import { useUser } from './auth.hook'
import sseService, { type SseConnectionStatus, type SseNotificationEvent } from '@/services/sse.service'

export interface UseWebSocketNotificationsOptions {
    enabled?: boolean
    onConnectionChange?: (status: SseConnectionStatus) => void
    onNotificationReceived?: (notification: Notification) => void
}

export interface WebSocketNotificationState {
    connected: boolean
    connecting: boolean
    error: string | null
    connect: () => Promise<void>
    disconnect: () => void
}

export const useWebSocketNotifications = (
    options: UseWebSocketNotificationsOptions = {}
): WebSocketNotificationState => {
    const { enabled = true, onConnectionChange, onNotificationReceived } = options

    const [connectionStatus, setConnectionStatus] = useState<SseConnectionStatus>({
        connected: false,
        connecting: false,
        error: null
    })

    const queryClient = useQueryClient()
    const { data: user } = useUser()
    const userProfile = user?.data?.user
    const userId = userProfile?.id

    const connectionUnsubRef = useRef<(() => void) | null>(null)
    const notificationUnsubRef = useRef<(() => void) | null>(null)

    const onConnectionChangeRef = useRef<((status: SseConnectionStatus) => void) | undefined>(onConnectionChange)
    const onNotificationReceivedRef = useRef<((notification: Notification) => void) | undefined>(onNotificationReceived)

    // Keep latest external callbacks without changing effect deps
    useEffect(() => {
        onConnectionChangeRef.current = onConnectionChange
    }, [onConnectionChange])

    useEffect(() => {
        onNotificationReceivedRef.current = onNotificationReceived
    }, [onNotificationReceived])

    useEffect(() => {
        if (!enabled || !userId) return

        // Cleanup existing subscriptions first
        connectionUnsubRef.current?.()
        notificationUnsubRef.current?.()

        const handleConn = (status: SseConnectionStatus) => {
            setConnectionStatus(status)
            onConnectionChangeRef.current?.(status)
        }

        const handleNotif = (event: SseNotificationEvent) => {
            const notification = event.data as Notification
            onNotificationReceivedRef.current?.(notification)

            switch (event.type) {
                case 'notification_created':
                    queryClient.setQueryData(['notifications'], (oldData: Notification[] | undefined) => {
                        if (!oldData) return [notification]
                        return [notification, ...oldData]
                    })
                    queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
                    break
                case 'notification_updated':
                    queryClient.setQueryData(['notifications'], (oldData: Notification[] | undefined) => {
                        if (!oldData) return []
                        return oldData.map((n) => (n.id === notification.id ? notification : n))
                    })
                    queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
                    break
                case 'system_notification':
                    break
            }
        }

        connectionUnsubRef.current = sseService.onConnectionChange(handleConn)
        notificationUnsubRef.current = sseService.onNotification(handleNotif)

        // Connect once for this user
        sseService.connect(userId)

        return () => {
            connectionUnsubRef.current?.()
            notificationUnsubRef.current?.()
        }
    }, [enabled, userId, queryClient])

    return {
        connected: connectionStatus.connected,
        connecting: connectionStatus.connecting,
        error: connectionStatus.error,
        connect: () => Promise.resolve(sseService.connect(userId as number)),
        disconnect: () => sseService.disconnect()
    }
}

export const useWebSocketConnection = () => {
    const [connectionStatus, setConnectionStatus] = useState<SseConnectionStatus>({
        connected: false,
        connecting: false,
        error: null
    })

    useEffect(() => {
        const unsub = sseService.onConnectionChange(setConnectionStatus)
        return unsub
    }, [])

    return connectionStatus
}
