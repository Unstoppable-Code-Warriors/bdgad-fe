import { Alert, Button, Group, ScrollArea, Stack } from '@mantine/core'
import MessageBlock from './ai/message'
import PromptInput from './ai/prompt-input'
import AIHeader from './ai/ai-header'
import WelcomeScreen from './ai/welcome-screen'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router'
import { chatHistoryService, db } from '@/utils/db'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { getAccessToken } from '@/stores/auth.store'
import { useCallback, useEffect, useRef, useState } from 'react'
import ScrollToBottom from './ai/scroll-to-bottom'
import LoadingMessage from './ai/loading-message'
import { IconAlertCircle } from '@tabler/icons-react'

const AI_API = 'https://ai.bdgad.bio'

const AIChatbotAside = ({ excelFilePath }: { excelFilePath: string }) => {
    const { id } = useParams()
    const viewport = useRef<HTMLDivElement>(null)
    const conversation = useLiveQuery(() => db.conversations.get(id ?? ''))
    const [isAtBottom, setIsAtBottom] = useState(true)

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        viewport.current!.scrollTo({ top: viewport.current!.scrollHeight, behavior })
    }, [])
    useEffect(() => {
        if (!conversation) return
        setMessages(conversation.messages)
        setTimeout(() => {
            scrollToBottom('auto')
        }, 100)
    }, [conversation])

    const { sendMessage, messages, setMessages, stop, status, error, regenerate } = useChat({
        id,
        transport: new DefaultChatTransport({
            api: `${AI_API}/completion`,
            headers: {
                Authorization: `Bearer ${getAccessToken()}`
            }
        }),
        onFinish: ({ message }) => {
            if (!id) return
            chatHistoryService.addMessage(id, message)
        }
    })

    const handleClearConversation = useCallback(() => {
        if (!id) return
        chatHistoryService.deleteConversation(id)
        setMessages([])
        setIsAtBottom(true)
    }, [id, setMessages])

    const handleSendMessage = useCallback(
        (message: string) => {
            sendMessage(
                { text: message },
                {
                    body: {
                        validationId: id,
                        excelFilePath
                    }
                }
            )
        },
        [sendMessage, id, excelFilePath]
    )

    const handleStop = useCallback(() => {
        stop()
    }, [stop])

    return (
        <Stack className='h-full relative'>
            <AIHeader isClearable={!!conversation} onClearConversation={handleClearConversation} />
            <ScrollArea.Autosize
                className='grow px-4 relative'
                viewportRef={viewport}
                offsetScrollbars
                onScrollPositionChange={({ y }) => {
                    const el = viewport.current
                    if (!el) return
                    const tolerance = 5
                    const bottomY = el.scrollHeight - el.clientHeight

                    if (y < bottomY - tolerance) setIsAtBottom(false)
                    else setIsAtBottom(true)
                }}
            >
                {messages.length === 0 ? (
                    <WelcomeScreen />
                ) : (
                    <Stack gap='xl' my='xl'>
                        {messages.map((message, index) => (
                            <MessageBlock key={message?.id || index} message={message} />
                        ))}
                        {status === 'submitted' ? <LoadingMessage /> : null}
                        {error ? (
                            <Alert
                                title='Có lỗi xảy ra'
                                color='red'
                                icon={<IconAlertCircle />}
                                variant='light'
                                className='w-full'
                                radius='lg'
                            >
                                <Group justify='space-between' align='flex-start'>
                                    <div style={{ flex: 1 }}>{error.message}</div>
                                    <Button
                                        size='xs'
                                        variant='outline'
                                        color='red'
                                        onClick={() => regenerate()}
                                        ml='md'
                                        radius='md'
                                    >
                                        Thử lại
                                    </Button>
                                </Group>
                            </Alert>
                        ) : null}
                    </Stack>
                )}
                <ScrollToBottom isAtBottom={isAtBottom} scrollToBottom={scrollToBottom} />
            </ScrollArea.Autosize>
            <PromptInput onSendMessage={handleSendMessage} onStop={handleStop} status={status} />
        </Stack>
    )
}

export default AIChatbotAside
