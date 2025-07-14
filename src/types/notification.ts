export interface NotificationUser {
    id: number
    email: string
    name: string
}

export interface Notification {
    id: number
    title: string
    message: string
    type: 'system' | 'lab_task' | 'analysis_task' | 'validation_task'
    sender: NotificationUser
    receiver: NotificationUser
    isRead: boolean
    createdAt: string
}

export type NotificationApiResponse = Notification[]
