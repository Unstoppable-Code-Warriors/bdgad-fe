import { backendApi } from '@/utils/api'
import type { NotificationApiResponse } from '@/types/notification'
import sseService, { type SseConnectionStatus, type SseNotificationEvent } from '@/services/sse.service'

const PREFIX = 'api/v1'

export const notificationService = {
    getAllNotificationByQuery: async (params?: {
        sortOrder?: 'ASC' | 'DESC'
        isRead?: boolean
        taskType?: 'system' | 'lab_task' | 'analysis_task' | 'validation_task'
        receiverId?: string
    }): Promise<NotificationApiResponse> => {
        const searchParams = new URLSearchParams()

        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder)
        if (params?.isRead !== undefined) searchParams.append('isRead', params.isRead.toString())
        if (params?.taskType) searchParams.append('taskType', params.taskType)
        if (params?.receiverId) searchParams.append('receiverId', params.receiverId)

        const queryString = searchParams.toString()
        return backendApi.get(`${PREFIX}/notification${queryString ? `?${queryString}` : ''}`).json()
    },

    markNotificationAsRead: async (notificationId: number): Promise<void> => {
        return backendApi.put(`${PREFIX}/notification/${notificationId}`).json()
    },

    // SSE methods
    connectSse: (userId: number) => {
        sseService.connect(userId)
    },

    disconnectSse: () => {
        sseService.disconnect()
    },

    onSseConnectionChange: (callback: (status: SseConnectionStatus) => void) => {
        return sseService.onConnectionChange(callback)
    },

    onSseNotification: (callback: (event: SseNotificationEvent) => void) => {
        return sseService.onNotification(callback)
    }
}
