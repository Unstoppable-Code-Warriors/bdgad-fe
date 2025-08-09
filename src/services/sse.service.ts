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

        this.notifyConnection({ connected: false, connecting: true, error: null })

        const streamUrl = `${this.url}/api/v1/notification/stream?userId=${encodeURIComponent(String(userId))}`
        this.source = new EventSource(streamUrl, { withCredentials: false })

        this.source.onopen = () => {
            this.notifyConnection({ connected: true, connecting: false, error: null })
        }

        this.source.onerror = () => {
            this.notifyConnection({ connected: false, connecting: false, error: 'SSE connection error' })
        }

        this.source.addEventListener('notification_created', (evt) => {
            const data = this.parseEvent(evt)
            this.notifyEvent({ type: 'notification_created', data, timestamp: new Date().toISOString() })
        })

        this.source.addEventListener('notification_updated', (evt) => {
            const data = this.parseEvent(evt)
            this.notifyEvent({ type: 'notification_updated', data, timestamp: new Date().toISOString() })
        })

        this.source.addEventListener('system_notification', (evt) => {
            const data = this.parseEvent(evt)
            this.notifyEvent({ type: 'system_notification', data, timestamp: new Date().toISOString() })
        })

        // optional heartbeat
        this.source.addEventListener('ping', () => {})
    }

    disconnect(): void {
        if (this.source) {
            this.source.close()
            this.source = null
            this.notifyConnection({ connected: false, connecting: false, error: null })
        }
    }

    onConnectionChange(cb: (status: SseConnectionStatus) => void): () => void {
        this.connectionCallbacks.push(cb)
        return () => {
            const idx = this.connectionCallbacks.indexOf(cb)
            if (idx > -1) this.connectionCallbacks.splice(idx, 1)
        }
    }

    onNotification(cb: (event: SseNotificationEvent) => void): () => void {
        this.notificationCallbacks.push(cb)
        return () => {
            const idx = this.notificationCallbacks.indexOf(cb)
            if (idx > -1) this.notificationCallbacks.splice(idx, 1)
        }
    }

    private notifyConnection(status: SseConnectionStatus) {
        this.connectionCallbacks.forEach((cb) => {
            try {
                cb(status)
            } catch {
                // ignore
            }
        })
    }

    private notifyEvent(event: SseNotificationEvent) {
        this.notificationCallbacks.forEach((cb) => {
            try {
                cb(event)
            } catch {
                // ignore
            }
        })
    }

    private parseEvent(evt: MessageEvent): unknown {
        try {
            return JSON.parse(evt.data)
        } catch {
            return evt.data
        }
    }
}

const sseService = new SseService(import.meta.env.VITE_BACKEND_API_URL || 'https://be.bdgad.bio')
export default sseService
