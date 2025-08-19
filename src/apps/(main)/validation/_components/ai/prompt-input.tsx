import { chatHistoryService } from '@/utils/db'
import { ActionIcon, Group, Paper, Stack, Textarea } from '@mantine/core'
import { IconSend, IconSquare } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { ChatRole } from '../../_types/message'
import { v4 as uuidv4 } from 'uuid'
import type { ChatStatus } from 'ai'

interface PromptInputProps {
    onSendMessage: (message: string) => void
    onStop: () => void
    status: ChatStatus
}

const PromptInput = ({ onSendMessage, onStop, status }: PromptInputProps) => {
    const { id } = useParams()
    const [message, setMessage] = useState('')
    const isDisabled = useMemo(() => {
        return ['submitted', 'streaming'].includes(status)
    }, [status])

    const handleSendMessage = async () => {
        if (!id) return
        if (!message.trim()) return
        setMessage('')
        await chatHistoryService.addMessage(id, {
            id: uuidv4(),
            role: ChatRole.USER,
            parts: [{ type: 'text', text: message.trim() }]
        })
        onSendMessage(message.trim())
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const renderActionButton = (status: ChatStatus) => {
        // submitted: The message has been sent to the API and we're awaiting the start of the response stream.
        // streaming: The response is actively streaming in from the API, receiving chunks of data.
        // ready: The full response has been received and processed; a new user message can be submitted.
        // error: An error occurred during the API request, preventing successful completion.
        switch (status) {
            case 'submitted':
                return (
                    <ActionIcon size='lg' radius='xl' onClick={onStop}>
                        <IconSquare size={16} />
                    </ActionIcon>
                )
            case 'streaming':
                return (
                    <ActionIcon size='lg' radius='xl' onClick={onStop}>
                        <IconSquare size={16} />
                    </ActionIcon>
                )
            case 'ready':
                return (
                    <ActionIcon size='lg' radius='xl' onClick={handleSendMessage}>
                        <IconSend size={16} />
                    </ActionIcon>
                )
            case 'error':
                return (
                    <ActionIcon size='lg' radius='xl' onClick={onStop}>
                        <IconSend size={16} />
                    </ActionIcon>
                )
        }
    }

    return (
        <div className='p-4'>
            <Paper
                shadow='sm'
                withBorder
                p='md'
                radius='lg'
                bg={isDisabled ? 'gray.2' : 'white'}
                className={`${isDisabled ? 'cursor-not-allowed' : ''}`}
            >
                <Stack gap={0}>
                    <Textarea
                        placeholder='Nhập câu hỏi...'
                        autosize
                        minRows={1}
                        maxRows={10}
                        maxLength={2000}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        styles={{
                            input: {
                                padding: 0,
                                border: 'none'
                            }
                        }}
                        disabled={isDisabled}
                    />
                    <Group justify='flex-end'>{renderActionButton(status)}</Group>
                </Stack>
            </Paper>
        </div>
    )
}

export default PromptInput
