import { Paper } from '@mantine/core'
import { ChatRole, type Message } from '../../_types/message'
import { Response } from './response'

interface MessageBlockProps {
    message: Message
}

const MessageBlock = ({ message }: MessageBlockProps) => {
    if (message.role === ChatRole.USER) {
        return (
            <div className='flex justify-end'>
                <Paper shadow='sm' withBorder p='sm' radius='lg'>
                    {message.content}
                </Paper>
            </div>
        )
    }

    return (
        <div className='flex justify-start'>
            <Response>{message.content}</Response>
        </div>
    )
}

export default MessageBlock
