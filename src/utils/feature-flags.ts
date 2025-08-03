// Feature flags for the application
export const FEATURE_FLAGS = {
    // WebSocket notifications
    WEBSOCKET_NOTIFICATIONS: true,

    // Fallback to HTTP polling if WebSocket fails
    WEBSOCKET_FALLBACK_TO_POLLING: true,

    // Show WebSocket connection status to users
    SHOW_WEBSOCKET_STATUS: true,

    // Development mode settings
    WEBSOCKET_DEBUG_LOGS: import.meta.env.DEV
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS
