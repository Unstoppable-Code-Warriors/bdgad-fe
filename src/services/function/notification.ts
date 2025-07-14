
import { backendApi } from '@/utils/api'
import type { NotificationApiResponse } from '@/types/notification'

const PREFIX = 'api/v1'

export const notificationService = {
    getAllNotificationByQuery: async (params?: {
        sortOrder?: 'ASC' | 'DESC'
        isRead?: boolean
        type?: 'system' | 'lab_task' | 'analysis_task' | 'validation_task'
        receiverId?: string
    }): Promise<NotificationApiResponse> => {
        const searchParams = new URLSearchParams()
        
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder)
        if (params?.isRead !== undefined) searchParams.append('isRead', params.isRead.toString())
        if (params?.type) searchParams.append('type', params.type)
        if (params?.receiverId) searchParams.append('receiverId', params.receiverId)
        
        const queryString = searchParams.toString()
        return backendApi.get(`${PREFIX}/notification${queryString ? `?${queryString}` : ''}`).json()
    },
    markNotificationAsRead: async (notificationId: number): Promise<void> => {
        return backendApi.put(`${PREFIX}/notification/${notificationId}`).json()
    },
}
