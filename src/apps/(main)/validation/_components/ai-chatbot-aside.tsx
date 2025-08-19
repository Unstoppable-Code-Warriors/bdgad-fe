import { ScrollArea, Stack } from '@mantine/core'
import MessageBlock from './ai/message'
import PromptInput from './ai/prompt-input'
import AIHeader from './ai/ai-header'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router'
import { db } from '@/utils/db'

const AIChatbotAside = () => {
    const { id } = useParams()
    const conversation = useLiveQuery(() => db.conversations.get(id))
    return (
        <Stack className='h-full'>
            <AIHeader validationId={id ?? ''} />
            <ScrollArea className='grow px-4'>
                <Stack>
                    {conversation?.messages.map((message, index) => (
                        <MessageBlock key={index} message={message} />
                    ))}
                </Stack>
            </ScrollArea>
            <PromptInput />
        </Stack>
    )
}

export default AIChatbotAside
