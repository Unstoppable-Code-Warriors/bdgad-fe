// Feature flags for the application
export const FEATURE_FLAGS = {
    // SSE notifications
    SSE_NOTIFICATIONS: true,

    // Fallback to HTTP polling if SSE fails
    SSE_FALLBACK_TO_POLLING: true,

    // Show SSE connection status to users
    SHOW_SSE_STATUS: true,

    // Development mode settings
    SSE_DEBUG_LOGS: import.meta.env.DEV
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS
