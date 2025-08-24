export interface SseConnectionStatus {
    connected: boolean
    connecting: boolean
    error: string | null
}

export type SseNotificationEvent = {
    type: 'notification_created' | 'notification_updated' | 'system_notification'
    data: unknown
    timestamp?: string
}

class SseService {
    private source: EventSource | null = null
    private url: string
    private connectionCallbacks: Array<(status: SseConnectionStatus) => void> = []
    private notificationCallbacks: Array<(event: SseNotificationEvent) => void> = []

    constructor(url: string) {
        this.url = url
    }

    connect(userId: number): void {
        if (this.source) {
            this.disconnect()
        }

        console.log(
            '🔗 SSE Service: Connecting to:',
            `${this.url}/api/v1/notification/stream?userId=${encodeURIComponent(String(userId))}`
        )
        this.notifyConnection({ connected: false, connecting: true, error: null })

        const streamUrl = `${this.url}/api/v1/notification/stream?userId=${encodeURIComponent(String(userId))}`
        this.source = new EventSource(streamUrl, { withCredentials: false })

        this.source.onopen = () => {
            console.log('✅ SSE Service: Connection opened')
            this.notifyConnection({ connected: true, connecting: false, error: null })
        }

        this.source.onerror = () => {
            console.error('❌ SSE Service: Connection error')
            this.notifyConnection({ connected: false, connecting: false, error: 'SSE connection error' })
        }

        // Handle generic SSE messages (since backend sends data without event names)
        this.source.onmessage = (evt) => {
            console.log('📨 SSE Service: Generic message received:', evt)
            const data = this.parseEvent(evt)
            console.log('📨 SSE Service: Parsed message data:', data)

            // Check if it's a ping event (has 't' timestamp property)
            if (data && typeof data === 'object' && 't' in data && Object.keys(data).length === 1) {
                console.log('💓 SSE Service: Detected ping event')
                // This is a ping event, don't notify notification callbacks
                return
            }

            // Check if it's a notification event (has notification properties)
            if (data && typeof data === 'object' && 'id' in data && 'title' in data && 'message' in data) {
                console.log('🔔 SSE Service: Detected notification event')
                this.notifyEvent({ type: 'notification_created', data, timestamp: new Date().toISOString() })
                return
            }

            // Unknown event type
            console.warn('⚠️ SSE Service: Unknown event type:', data)
        }

        // Keep these for backward compatibility, but they might not be used
        this.source.addEventListener('notification_created', (evt) => {
            console.log('🔔 SSE Service: notification_created event received:', evt)
            const data = this.parseEvent(evt)
            console.log('🔔 SSE Service: Parsed notification_created data:', data)
            this.notifyEvent({ type: 'notification_created', data, timestamp: new Date().toISOString() })
        })

        this.source.addEventListener('notification_updated', (evt) => {
            console.log('🔄 SSE Service: notification_updated event received:', evt)
            const data = this.parseEvent(evt)
            console.log('🔄 SSE Service: Parsed notification_updated data:', data)
            this.notifyEvent({ type: 'notification_updated', data, timestamp: new Date().toISOString() })
        })

        this.source.addEventListener('system_notification', (evt) => {
            console.log('📢 SSE Service: system_notification event received:', evt)
            const data = this.parseEvent(evt)
            console.log('📢 SSE Service: Parsed system_notification data:', data)
            this.notifyEvent({ type: 'system_notification', data, timestamp: new Date().toISOString() })
        })

        // Keep ping listener for named ping events
        this.source.addEventListener('ping', (evt) => {
            console.log('💓 SSE Service: ping event received:', evt)
        })
    }

    disconnect(): void {
        if (this.source) {
            this.source.close()
            this.source = null
            this.notifyConnection({ connected: false, connecting: false, error: null })
        }
    }

    onConnectionChange(cb: (status: SseConnectionStatus) => void): () => void {
        console.log(
            '🔗 SSE Service: Registering connection callback, total callbacks:',
            this.connectionCallbacks.length
        )
        this.connectionCallbacks.push(cb)
        return () => {
            const idx = this.connectionCallbacks.indexOf(cb)
            if (idx > -1) this.connectionCallbacks.splice(idx, 1)
            console.log('🔗 SSE Service: Unregistered connection callback, remaining:', this.connectionCallbacks.length)
        }
    }

    onNotification(cb: (event: SseNotificationEvent) => void): () => void {
        console.log(
            '🔔 SSE Service: Registering notification callback, total callbacks:',
            this.notificationCallbacks.length
        )
        this.notificationCallbacks.push(cb)
        return () => {
            const idx = this.notificationCallbacks.indexOf(cb)
            if (idx > -1) this.notificationCallbacks.splice(idx, 1)
            console.log(
                '🔔 SSE Service: Unregistered notification callback, remaining:',
                this.notificationCallbacks.length
            )
        }
    }

    private notifyConnection(status: SseConnectionStatus) {
        console.log('🔗 SSE Service: Notifying connection callbacks:', this.connectionCallbacks.length, status)
        this.connectionCallbacks.forEach((cb, index) => {
            try {
                console.log(`🔗 SSE Service: Calling connection callback ${index}`)
                cb(status)
            } catch (error) {
                console.error(`❌ SSE Service: Error in connection callback ${index}:`, error)
            }
        })
    }

    private notifyEvent(event: SseNotificationEvent) {
        console.log('🔔 SSE Service: Notifying event callbacks:', this.notificationCallbacks.length, event.type)
        this.notificationCallbacks.forEach((cb, index) => {
            try {
                console.log(`🔔 SSE Service: Calling notification callback ${index} for event:`, event.type)
                cb(event)
            } catch (error) {
                console.error(`❌ SSE Service: Error in notification callback ${index}:`, error)
            }
        })
    }

    private parseEvent(evt: MessageEvent): unknown {
        console.log('🔍 SSE Service: Parsing event:', {
            type: evt.type,
            data: evt.data,
            lastEventId: evt.lastEventId,
            origin: evt.origin
        })

        try {
            const parsed = JSON.parse(evt.data)
            console.log('✅ SSE Service: Successfully parsed event data:', parsed)
            return parsed
        } catch (error) {
            console.warn('⚠️ SSE Service: Failed to parse event data, using raw data:', error)
            return evt.data
        }
    }
}

const sseService = new SseService(import.meta.env.VITE_BACKEND_API_URL || 'https://be.bdgad.bio')
export default sseService
