import io from 'socket.io-client'
import { getAccessToken } from '@/stores/auth.store'

export interface WebSocketConfig {
    url: string
    namespace?: string
    autoConnect?: boolean
}

export interface NotificationEvent {
    type: 'notification_created' | 'notification_updated' | 'system_notification'
    data: any
    timestamp: string
}

export interface ConnectionStatus {
    connected: boolean
    connecting: boolean
    error: string | null
}

class WebSocketService {
    private socket: any = null
    private config: WebSocketConfig
    private connectionCallbacks: Array<(status: ConnectionStatus) => void> = []
    private notificationCallbacks: Array<(event: NotificationEvent) => void> = []
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectDelay = 1000

    constructor(config: WebSocketConfig) {
        this.config = {
            autoConnect: true,
            namespace: '/notifications',
            ...config
        }
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.socket?.connected) {
                resolve()
                return
            }

            const token = getAccessToken()
            if (!token) {
                const error = 'No authentication token available'
                this.notifyConnectionCallbacks({ connected: false, connecting: false, error })
                reject(new Error(error))
                return
            }

            this.notifyConnectionCallbacks({ connected: false, connecting: true, error: null })

            const socketUrl = `${this.config.url}${this.config.namespace}`

            this.socket = io(socketUrl, {
                auth: {
                    token
                },
                autoConnect: this.config.autoConnect,
                transports: ['websocket', 'polling'],
                timeout: 20000,
                forceNew: true
            })

            this.setupEventListeners()

            this.socket.on('connect', () => {
                console.log('WebSocket connected successfully')
                this.reconnectAttempts = 0
                this.notifyConnectionCallbacks({ connected: true, connecting: false, error: null })
                resolve()
            })

            this.socket.on('connect_error', (error: any) => {
                console.error('WebSocket connection error:', error)
                this.handleConnectionError(error.message)
                reject(error)
            })

            this.socket.on('auth_error', (data: any) => {
                console.error('WebSocket authentication error:', data)
                this.notifyConnectionCallbacks({
                    connected: false,
                    connecting: false,
                    error: data.message || 'Authentication failed'
                })
                reject(new Error(data.message || 'Authentication failed'))
            })
        })
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
            this.notifyConnectionCallbacks({ connected: false, connecting: false, error: null })
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false
    }

    // Event listeners management
    onConnectionChange(callback: (status: ConnectionStatus) => void): () => void {
        this.connectionCallbacks.push(callback)

        // Return unsubscribe function
        return () => {
            const index = this.connectionCallbacks.indexOf(callback)
            if (index > -1) {
                this.connectionCallbacks.splice(index, 1)
            }
        }
    }

    onNotification(callback: (event: NotificationEvent) => void): () => void {
        this.notificationCallbacks.push(callback)

        // Return unsubscribe function
        return () => {
            const index = this.notificationCallbacks.indexOf(callback)
            if (index > -1) {
                this.notificationCallbacks.splice(index, 1)
            }
        }
    }

    // Join user's notification room
    joinNotificationRoom(userId: number): void {
        if (this.socket?.connected) {
            this.socket.emit('join_notification_room', { userId })
        }
    }

    // Leave user's notification room
    leaveNotificationRoom(userId: number): void {
        if (this.socket?.connected) {
            this.socket.emit('leave_notification_room', { userId })
        }
    }

    private setupEventListeners(): void {
        if (!this.socket) return

        // Handle disconnection
        this.socket.on('disconnect', (reason: string) => {
            console.log('WebSocket disconnected:', reason)
            this.notifyConnectionCallbacks({ connected: false, connecting: false, error: reason })

            // Auto-reconnect if disconnection was not intentional
            if (reason === 'io server disconnect') {
                // Server disconnected the client, need to reconnect manually
                this.attemptReconnect()
            }
        })

        // Handle notification events
        this.socket.on('notification_created', (data: NotificationEvent) => {
            console.log('New notification received:', data)
            this.notifyNotificationCallbacks(data)
        })

        this.socket.on('notification_updated', (data: NotificationEvent) => {
            console.log('Notification updated:', data)
            this.notifyNotificationCallbacks(data)
        })

        this.socket.on('system_notification', (data: NotificationEvent) => {
            console.log('System notification received:', data)
            this.notifyNotificationCallbacks(data)
        })

        // Handle connection confirmation
        this.socket.on('connection_confirmed', (data: any) => {
            console.log('WebSocket connection confirmed:', data)
        })

        // Handle room events
        this.socket.on('room_joined', (data: any) => {
            console.log('Joined notification room:', data.room)
        })

        this.socket.on('room_left', (data: any) => {
            console.log('Left notification room:', data.room)
        })

        // Handle errors
        this.socket.on('error', (data: any) => {
            console.error('WebSocket error:', data)
            this.notifyConnectionCallbacks({
                connected: false,
                connecting: false,
                error: data.message || 'WebSocket error'
            })
        })
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached')
            this.notifyConnectionCallbacks({
                connected: false,
                connecting: false,
                error: 'Max reconnection attempts reached'
            })
            return
        }

        this.reconnectAttempts++
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) // Exponential backoff

        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

        setTimeout(() => {
            this.connect().catch((error) => {
                console.error('Reconnection failed:', error)
            })
        }, delay)
    }

    private handleConnectionError(error: string): void {
        this.notifyConnectionCallbacks({
            connected: false,
            connecting: false,
            error
        })
    }

    private notifyConnectionCallbacks(status: ConnectionStatus): void {
        this.connectionCallbacks.forEach((callback) => {
            try {
                callback(status)
            } catch (error) {
                console.error('Error in connection callback:', error)
            }
        })
    }

    private notifyNotificationCallbacks(event: NotificationEvent): void {
        this.notificationCallbacks.forEach((callback) => {
            try {
                callback(event)
            } catch (error) {
                console.error('Error in notification callback:', error)
            }
        })
    }
}

// Create singleton instance
const webSocketService = new WebSocketService({
    url: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
})

export default webSocketService
