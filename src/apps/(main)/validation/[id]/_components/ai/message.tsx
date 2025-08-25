import { Accordion, Alert, Avatar, Badge, Code, Group, Loader, Paper, ScrollArea, Skeleton, Text } from '@mantine/core'
import { ChatRole } from '../../_types/message'
import { Response } from './response'
import type { UIMessage } from '@ai-sdk/react'
import {
    IconAlertCircle,
    IconCheck,
    IconDatabaseSearch,
    IconDna,
    IconDna2,
    IconWorld,
    IconReportAnalytics,
    IconWorldSearch,
    IconZoomScan
} from '@tabler/icons-react'

interface MessageBlockProps {
    message: UIMessage
}

const MessageBlock = ({ message }: MessageBlockProps) => {
    if (message.role === ChatRole.USER) {
        return (
            <div className='flex justify-end'>
                <Paper shadow='sm' withBorder p='sm' radius='lg' maw={'70%'} bg='blue'>
                    {message.parts?.map((part, i) => {
                        switch (part.type) {
                            case 'text':
                                return (
                                    <div key={`${message.id}-${i}`} className='text-white'>
                                        {part.text}
                                    </div>
                                )
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
                    case 'tool-web_search_preview':
                        return (
                            <Accordion variant='filled' key={`${message.id}-${i}`} radius='lg' className='w-full'>
                                <Accordion.Item value='web_search_preview'>
                                    <Accordion.Control
                                        icon={
                                            part.state === 'input-available' ? (
                                                <Loader size='xs' />
                                            ) : part.state === 'output-available' ? (
                                                <IconCheck size={14} color='green' />
                                            ) : (
                                                <IconWorld size={14} />
                                            )
                                        }
                                    >
                                        <Group wrap='nowrap'>
                                            <Text size='sm' c='dimmed'>
                                                Tìm kiếm web
                                            </Text>
                                            {part.state === 'input-available' ? (
                                                <Badge color='blue' variant='light' size='sm'>
                                                    Đang tìm kiếm
                                                </Badge>
                                            ) : null}
                                            {part.state === 'output-available' ? (
                                                <Badge color='green' variant='light' size='sm'>
                                                    Đã tìm kiếm xong
                                                </Badge>
                                            ) : null}
                                            {part.state === 'output-error' ? (
                                                <Badge color='red' variant='light' size='sm'>
                                                    Lỗi tìm kiếm
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
                    case 'tool-exploreFileStructure':
                        return (
                            <Accordion variant='filled' key={`${message.id}-${i}`} radius='lg' className='w-full'>
                                <Accordion.Item value='tool'>
                                    <Accordion.Control
                                        icon={
                                            part.state === 'input-available' ? (
                                                <Loader size='xs' />
                                            ) : part.state === 'output-available' ? (
                                                <IconCheck size={14} color='green' />
                                            ) : (
                                                <IconZoomScan size={14} />
                                            )
                                        }
                                    >
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
                                            {part.state === 'output-available' ? (
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
                    case 'tool-createGeneAnalysisStrategy':
                        return (
                            <Accordion variant='filled' key={`${message.id}-${i}`} radius='lg' className='w-full'>
                                <Accordion.Item value='tool'>
                                    <Accordion.Control
                                        icon={
                                            part.state === 'input-available' ? (
                                                <Loader size='xs' />
                                            ) : part.state === 'output-available' ? (
                                                <IconCheck size={14} color='green' />
                                            ) : (
                                                <IconDna size={14} />
                                            )
                                        }
                                    >
                                        <Group wrap='nowrap'>
                                            <Text size='sm' c='dimmed'>
                                                Phân tích biến thể
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
                                            {part.state === 'output-available' ? (
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
                    case 'tool-executeGenomicsAnalysis':
                        return (
                            <Accordion variant='filled' key={`${message.id}-${i}`} radius='lg' className='w-full'>
                                <Accordion.Item value='tool'>
                                    <Accordion.Control
                                        icon={
                                            part.state === 'input-available' ? (
                                                <Loader size='xs' />
                                            ) : part.state === 'output-available' ? (
                                                <IconCheck size={14} color='green' />
                                            ) : (
                                                <IconReportAnalytics size={14} />
                                            )
                                        }
                                    >
                                        <Group wrap='nowrap'>
                                            <Text size='sm' c='dimmed'>
                                                Thống kê kết quả
                                            </Text>
                                            {part.state === 'input-available' ? (
                                                <Badge color='blue' variant='light' size='sm'>
                                                    Đang thống kê
                                                </Badge>
                                            ) : null}
                                            {part.state === 'output-available' ? (
                                                <Badge color='green' variant='light' size='sm'>
                                                    Đã thống kê xong
                                                </Badge>
                                            ) : null}
                                            {part.state === 'output-error' ? (
                                                <Badge color='red' variant='light' size='sm'>
                                                    Lỗi thống kê
                                                </Badge>
                                            ) : null}
                                        </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <ScrollArea.Autosize mah={400}>
                                            {part.state === 'output-available' ? (
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
                    case 'tool-prepareVariantSearch':
                        return (
                            <Accordion variant='filled' key={`${message.id}-${i}`} radius='lg' className='w-full'>
                                <Accordion.Item value='tool'>
                                    <Accordion.Control
                                        icon={
                                            part.state === 'input-available' ? (
                                                <Loader size='xs' />
                                            ) : part.state === 'output-available' ? (
                                                <IconCheck size={14} color='green' />
                                            ) : (
                                                <IconWorldSearch size={14} />
                                            )
                                        }
                                    >
                                        <Group wrap='nowrap'>
                                            <Text size='sm' c='dimmed'>
                                                Lấy thông tin phân tích biến thể
                                            </Text>
                                            {part.state === 'input-available' ? (
                                                <Badge color='blue' variant='light' size='sm'>
                                                    Đang chuẩn bị
                                                </Badge>
                                            ) : null}
                                            {part.state === 'output-available' ? (
                                                <Badge color='green' variant='light' size='sm'>
                                                    Đã có thông tin
                                                </Badge>
                                            ) : null}
                                            {part.state === 'output-error' ? (
                                                <Badge color='red' variant='light' size='sm'>
                                                    Lỗi lấy thông tin
                                                </Badge>
                                            ) : null}
                                        </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <ScrollArea.Autosize mah={400}>
                                            {part.state === 'output-available' ? (
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
                    case 'tool-lookupClinicalDatabase':
                        return (
                            <Accordion variant='filled' key={`${message.id}-${i}`} radius='lg' className='w-full'>
                                <Accordion.Item value='tool'>
                                    <Accordion.Control
                                        icon={
                                            part.state === 'input-available' ? (
                                                <Loader size='xs' />
                                            ) : part.state === 'output-available' ? (
                                                <IconCheck size={14} color='green' />
                                            ) : (
                                                <IconDatabaseSearch size={14} />
                                            )
                                        }
                                    >
                                        <Group wrap='nowrap'>
                                            <Text size='sm' c='dimmed'>
                                                Tra cứu cơ sở dữ liệu y sinh
                                            </Text>
                                            {part.state === 'input-available' ? (
                                                <Badge color='blue' variant='light' size='sm'>
                                                    Đang tra cứu
                                                </Badge>
                                            ) : null}
                                            {part.state === 'output-available' ? (
                                                <Badge color='green' variant='light' size='sm'>
                                                    Đã tra cứu
                                                </Badge>
                                            ) : null}
                                            {part.state === 'output-error' ? (
                                                <Badge color='red' variant='light' size='sm'>
                                                    Lỗi tra cứu
                                                </Badge>
                                            ) : null}
                                        </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <ScrollArea.Autosize mah={400}>
                                            {part.state === 'output-available' ? (
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
