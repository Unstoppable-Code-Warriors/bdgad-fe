import { type Message } from './message'

export interface ChatReq {
    messages: Message[]
    temperature?: number
    maxTokens?: number
}
