import { useEffect, useState, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import webSocketService, { type NotificationEvent, type ConnectionStatus } from '@/services/websocket.service'
import { useUser } from './auth.hook'
import type { Notification } from '@/types/notification'

export interface UseWebSocketNotificationsOptions {
    enabled?: boolean
    onConnectionChange?: (status: ConnectionStatus) => void
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

    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
        connected: false,
        connecting: false,
        error: null
    })

    const queryClient = useQueryClient()
    const { data: user } = useUser()
    const userProfile = user?.data?.user
    const userId = userProfile?.id

    const connectionCallbackRef = useRef<(() => void) | null>(null)
    const notificationCallbackRef = useRef<(() => void) | null>(null)

    const handleConnectionChange = useCallback(
        (status: ConnectionStatus) => {
            setConnectionStatus(status)
            onConnectionChange?.(status)

            // Auto-join notification room when connected
            if (status.connected && userId) {
                webSocketService.joinNotificationRoom(userId)
            }
        },
        [onConnectionChange, userId]
    )

    const handleNotificationEvent = useCallback(
        (event: NotificationEvent) => {
            const notification = event.data as Notification

            // Call external callback if provided
            onNotificationReceived?.(notification)

            switch (event.type) {
                case 'notification_created':
                    // Add new notification to the cache
                    queryClient.setQueryData(['notifications'], (oldData: Notification[] | undefined) => {
                        if (!oldData) return [notification]
                        return [notification, ...oldData]
                    })

                    // Update unread count cache
                    queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
                    break

                case 'notification_updated':
                    // Update existing notification in the cache
                    queryClient.setQueryData(['notifications'], (oldData: Notification[] | undefined) => {
                        if (!oldData) return []
                        return oldData.map((n) => (n.id === notification.id ? notification : n))
                    })

                    // Update unread count cache
                    queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
                    break

                case 'system_notification':
                    // Handle system notifications (could be shown as toast)
                    console.log('System notification received:', notification)
                    break
            }
        },
        [onNotificationReceived, queryClient]
    )

    const connect = useCallback(async (): Promise<void> => {
        if (!enabled || !userId) {
            return
        }

        try {
            await webSocketService.connect()
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error)
            throw error
        }
    }, [enabled, userId])

    const disconnect = useCallback((): void => {
        if (userId) {
            webSocketService.leaveNotificationRoom(userId)
        }
        webSocketService.disconnect()
    }, [userId])

    // Set up WebSocket connection and event listeners
    useEffect(() => {
        if (!enabled || !userId) {
            return
        }

        // Clean up previous callbacks
        if (connectionCallbackRef.current) {
            connectionCallbackRef.current()
        }
        if (notificationCallbackRef.current) {
            notificationCallbackRef.current()
        }

        // Set up new callbacks
        connectionCallbackRef.current = webSocketService.onConnectionChange(handleConnectionChange)
        notificationCallbackRef.current = webSocketService.onNotification(handleNotificationEvent)

        // Auto-connect if not already connected
        if (!webSocketService.isConnected()) {
            connect().catch((error) => {
                console.error('Auto-connect failed:', error)
            })
        } else {
            // If already connected, just join the room
            webSocketService.joinNotificationRoom(userId)
            setConnectionStatus({
                connected: true,
                connecting: false,
                error: null
            })
        }

        // Cleanup function
        return () => {
            if (connectionCallbackRef.current) {
                connectionCallbackRef.current()
                connectionCallbackRef.current = null
            }
            if (notificationCallbackRef.current) {
                notificationCallbackRef.current()
                notificationCallbackRef.current = null
            }
        }
    }, [enabled, userId, handleConnectionChange, handleNotificationEvent, connect])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (connectionCallbackRef.current) {
                connectionCallbackRef.current()
            }
            if (notificationCallbackRef.current) {
                notificationCallbackRef.current()
            }
        }
    }, [])

    return {
        connected: connectionStatus.connected,
        connecting: connectionStatus.connecting,
        error: connectionStatus.error,
        connect,
        disconnect
    }
}

// Hook for just connection status (lighter weight)
export const useWebSocketConnection = () => {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
        connected: webSocketService.isConnected(),
        connecting: false,
        error: null
    })

    useEffect(() => {
        const unsubscribe = webSocketService.onConnectionChange(setConnectionStatus)

        return unsubscribe
    }, [])

    return connectionStatus
}
