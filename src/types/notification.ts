export interface NotificationUser {
    id: number
    email: string
    name: string
}

export interface Notification {
    id: number
    title: string
    message: string
    taskType: 'system' | 'lab_task' | 'analysis_task' | 'validation_task'
    subType?: 'reject' | 'accept'
    sender: NotificationUser
    receiver: NotificationUser
    isRead: boolean
    createdAt: string
    labcode?: string[]
    barcode?: string
}

export type NotificationApiResponse = Notification[]
