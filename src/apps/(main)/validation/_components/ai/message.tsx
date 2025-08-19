import { Avatar, Group, Paper } from '@mantine/core'
import { ChatRole } from '../../_types/message'
import { Response } from './response'
import type { UIMessage } from '@ai-sdk/react'
import { IconDna2 } from '@tabler/icons-react'
import React from 'react'

interface MessageBlockProps {
    message: UIMessage
}

const MessageBlock = ({ message }: MessageBlockProps) => {
    if (message.role === ChatRole.USER) {
        return (
            <div className='flex justify-end'>
                <Paper shadow='sm' withBorder p='sm' radius='lg'>
                    {message.parts?.map((part, i) => {
                        switch (part.type) {
                            case 'text':
                                return <React.Fragment key={`${message.id}-${i}`}>{part.text}</React.Fragment>
                            default:
                                return null
                        }
                    })}
                </Paper>
            </div>
        )
    }

    return (
        <div className='flex justify-start'>
            {message.parts?.map((part, i) => {
                switch (part.type) {
                    case 'text':
                        return (
                            <Group wrap='nowrap' align='flex-start'>
                                <Avatar variant='filled' color='blue'>
                                    <IconDna2 />
                                </Avatar>
                                <Response key={`${message.id}-${i}`}>{part.text}</Response>
                            </Group>
                        )
                    default:
                        return null
                }
            })}
        </div>
    )
}

export default MessageBlock
