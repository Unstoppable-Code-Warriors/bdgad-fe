import { ScrollArea, Stack } from '@mantine/core'
import { ChatRole, type Message } from '../_types/message'
import MessageBlock from './ai/message'
import PromptInput from './ai/prompt-input'
import AIHeader from './ai/ai-header'
const mockMessages: Message[] = [
    {
        role: ChatRole.USER,
        content: 'Hello, how are you?'
    },
    {
        role: ChatRole.ASSISTANT,
        // mock content with markdown
        content:
            '**I am good, thank you!**\n\nI am a helpful assistant.\n\n[Link](https://www.google.com)\n\n![Image](https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png)\n\n```\nconst a = 1;\nconsole.log(a);\n```'
    }
]

const AIChatbotAside = () => {
    return (
        <Stack className='h-full'>
            <AIHeader />
            <ScrollArea className='grow px-4'>
                <Stack>
                    {mockMessages.map((message, index) => (
                        <MessageBlock key={index} message={message} />
                    ))}
                </Stack>
            </ScrollArea>
            <PromptInput />
        </Stack>
    )
}

export default AIChatbotAside
