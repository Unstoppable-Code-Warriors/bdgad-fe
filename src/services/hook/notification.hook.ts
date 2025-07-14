import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '../function/notification'

export interface NotificationParams {
    sortOrder?: 'ASC' | 'DESC'
    isRead?: boolean
    type?: 'system' | 'lab_task' | 'analysis_task' | 'validation_task'
    receiverId?: string
}

export const useNotifications = (params?: NotificationParams) => {
    return useQuery({
        queryKey: ['notifications', params],
        queryFn: () => notificationService.getAllNotificationByQuery(params),
        refetchInterval: 30000, 
        staleTime: 10000,
    })
}

export const useUnreadNotificationsCount = (receiverId?: string) => {
    return useQuery({
        queryKey: ['notifications-unread-count', receiverId],
        queryFn: () => notificationService.getAllNotificationByQuery({
            isRead: false,
            receiverId,
            sortOrder: 'DESC'
        }),
        refetchInterval: 30000,
        staleTime: 10000,
        select: (data) => data?.filter(n => !n.isRead).length || 0
    })
}

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (notificationId: number) => 
            notificationService.markNotificationAsRead(notificationId),
        onSuccess: () => {
            // Invalidate and refetch notifications after marking as read
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
        }
    })
}


