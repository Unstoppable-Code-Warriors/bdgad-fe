export enum ChatRole {
    USER = 'user',
    ASSISTANT = 'assistant',
    SYSTEM = 'system'
}

export interface Message {
    role: ChatRole
    content: string
}
