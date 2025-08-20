import Dexie, { type Table } from 'dexie'
import type { UIMessage } from '@ai-sdk/react'

// Interface cho một cuộc hội thoại
export interface ChatConversation {
    id: string // validation ID
    messages: UIMessage[]
    createdAt: Date
    updatedAt: Date
}

// Database class
export class ChatDatabase extends Dexie {
    conversations!: Table<ChatConversation>

    constructor() {
        super('ChatDatabase')

        this.version(1).stores({
            conversations: 'id, createdAt, updatedAt'
        })
    }
}

// Khởi tạo database instance
export const db = new ChatDatabase()

// Service methods để thao tác với database
export class ChatHistoryService {
    // Lấy cuộc hội thoại theo validation ID
    async getConversation(validationId: string): Promise<ChatConversation | undefined> {
        return await db.conversations.get(validationId)
    }

    // Tạo cuộc hội thoại mới
    async createConversation(validationId: string): Promise<void> {
        const now = new Date()
        await db.conversations.add({
            id: validationId,
            messages: [],
            createdAt: now,
            updatedAt: now
        })
    }

    // Thêm message vào cuộc hội thoại
    async addMessage(validationId: string, message: UIMessage): Promise<void> {
        const conversation = await this.getConversation(validationId)

        if (!conversation) {
            // Tạo cuộc hội thoại mới nếu chưa tồn tại
            await this.createConversation(validationId)
            await this.addMessage(validationId, message)
            return
        }

        // Cập nhật cuộc hội thoại với message mới
        await db.conversations.update(validationId, {
            messages: [...conversation.messages, message],
            updatedAt: new Date()
        })
    }

    // Thêm nhiều messages cùng lúc
    async addMessages(validationId: string, messages: UIMessage[]): Promise<void> {
        const conversation = await this.getConversation(validationId)

        if (!conversation) {
            // Tạo cuộc hội thoại mới nếu chưa tồn tại
            await this.createConversation(validationId)
            await this.addMessages(validationId, messages)
            return
        }

        // Cập nhật cuộc hội thoại với các messages mới
        await db.conversations.update(validationId, {
            messages: [...conversation.messages, ...messages],
            updatedAt: new Date()
        })
    }

    // Xóa cuộc hội thoại
    async deleteConversation(validationId: string): Promise<void> {
        await db.conversations.delete(validationId)
    }

    // Lấy tất cả cuộc hội thoại
    async getAllConversations(): Promise<ChatConversation[]> {
        return await db.conversations.toArray()
    }

    // Xóa tất cả dữ liệu
    async clearAll(): Promise<void> {
        await db.conversations.clear()
    }

    // Cập nhật toàn bộ mảng messages (thay thế hoàn toàn)
    async updateMessages(validationId: string, messages: UIMessage[]): Promise<void> {
        await db.conversations.update(validationId, {
            messages,
            updatedAt: new Date()
        })
    }
}

export const chatHistoryService = new ChatHistoryService()
