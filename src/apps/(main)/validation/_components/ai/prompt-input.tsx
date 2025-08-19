import { chatHistoryService } from '@/utils/db'
import { ActionIcon, Group, Paper, Stack, Textarea } from '@mantine/core'
import { IconSend } from '@tabler/icons-react'
import { useState } from 'react'
import { useParams } from 'react-router'
import { ChatRole } from '../../_types/message'

const PromptInput = () => {
    const { id } = useParams()
    const [message, setMessage] = useState('')
    const handleSendMessage = async () => {
        if (!id) return
        await chatHistoryService.addMessage(id, {
            role: ChatRole.USER,
            content: message
        })
    }
    return (
        <div className='p-4'>
            <Paper shadow='sm' withBorder p='md' radius='lg'>
                <Stack gap={0}>
                    <Textarea
                        placeholder='Nhập câu hỏi...'
                        autosize
                        minRows={1}
                        maxRows={10}
                        maxLength={2000}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        styles={{
                            input: {
                                padding: 0,
                                border: 'none'
                            }
                        }}
                    />
                    <Group justify='flex-end'>
                        <ActionIcon size='lg' radius='xl' onClick={handleSendMessage}>
                            <IconSend size={16} />
                        </ActionIcon>
                    </Group>
                </Stack>
            </Paper>
        </div>
    )
}

export default PromptInput
