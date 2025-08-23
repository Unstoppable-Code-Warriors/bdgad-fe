export interface NotificationUser {
    id: number
    email: string
    name: string
}

export interface Notification {
    id: number
    title: string
    message: string
    type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
    subType?: 'reject' | 'accept'
    taskType: 'system' | 'lab_task' | 'analysis_task' | 'validation_task'
    sender: NotificationUser
    receiver: NotificationUser
    isRead: boolean
    createdAt: string
    labcode?: string[]
    barcode?: string
}

export type NotificationApiResponse = Notification[]

// New type for initial notifications response from BE
export interface InitialNotificationsResponse {
    notifications: Notification[]
    totalCount: number
    userId: number
    limit: number
}
