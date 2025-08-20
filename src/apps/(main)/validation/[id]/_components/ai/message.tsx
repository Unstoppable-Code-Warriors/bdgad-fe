import { Accordion, Alert, Avatar, Badge, Code, Group, Paper, ScrollArea, Skeleton, Text } from '@mantine/core'
import { ChatRole } from '../../_types/message'
import { Response } from './response'
import type { UIMessage } from '@ai-sdk/react'
import { IconAlertCircle, IconDna2, IconZoomScan } from '@tabler/icons-react'
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
        <div className='flex flex-col gap-2 items-start'>
            {message.parts?.map((part, i) => {
                switch (part.type) {
                    case 'text':
                        return (
                            <Group wrap='nowrap' align='flex-start' key={`${message.id}-${i}`}>
                                <Avatar variant='filled' color='blue'>
                                    <IconDna2 />
                                </Avatar>
                                <Response key={`${message.id}-${i}`}>{part.text}</Response>
                            </Group>
                        )
                    case 'dynamic-tool':
                        return (
                            <Accordion variant='filled' key={`${message.id}-${i}`} radius='lg' className='w-full'>
                                <Accordion.Item value='tool'>
                                    <Accordion.Control icon={<IconZoomScan size={14} />}>
                                        <Group wrap='nowrap'>
                                            <Text size='sm' c='dimmed'>
                                                Phân tích tổng quan
                                            </Text>
                                            {part.state === 'input-available' ? (
                                                <Badge color='blue' variant='light' size='sm'>
                                                    Đang phân tích
                                                </Badge>
                                            ) : null}
                                            {part.state === 'output-available' ? (
                                                <Badge color='green' variant='light' size='sm'>
                                                    Đã phân tích xong
                                                </Badge>
                                            ) : null}
                                            {part.state === 'output-error' ? (
                                                <Badge color='red' variant='light' size='sm'>
                                                    Lỗi phân tích
                                                </Badge>
                                            ) : null}
                                        </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <ScrollArea.Autosize mah={400}>
                                            {part.state === 'input-available' ? (
                                                <Skeleton height={100} />
                                            ) : part.state === 'output-available' ? (
                                                <Code
                                                    block
                                                    style={{
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                        overflowWrap: 'break-word',
                                                        maxWidth: '100%',
                                                        overflow: 'auto'
                                                    }}
                                                >
                                                    {JSON.stringify(part?.output, null, 2)}
                                                </Code>
                                            ) : part.state === 'output-error' ? (
                                                <Alert
                                                    title='Có lỗi xảy ra'
                                                    color='red'
                                                    icon={<IconAlertCircle />}
                                                    variant='light'
                                                >
                                                    {part.errorText}
                                                </Alert>
                                            ) : null}
                                        </ScrollArea.Autosize>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            </Accordion>
                        )

                    default:
                        return null
                }
            })}
        </div>
    )
}

export default MessageBlock
