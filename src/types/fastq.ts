import type { User } from './user'

export interface FastQ {
    id: number
    filePath: string
    createdAt: string
    status: string
    redoReason: string | null
    creator: Omit<User, 'metadata'>
    rejector?: Omit<User, 'metadata'>
}
