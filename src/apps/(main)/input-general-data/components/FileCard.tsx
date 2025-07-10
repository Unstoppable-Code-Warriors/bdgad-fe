import { Card, Text, Stack, Group, ActionIcon, Flex, Box, Badge, Tooltip, Paper } from '@mantine/core'
import {
    IconDownload,
    IconFileText,
    IconFileSpreadsheet,
    IconCalendarEvent,
    IconTrash,
    IconUser,
    IconFile3d,
    IconFileZip,
    IconPhoto,
    IconFileMusic
} from '@tabler/icons-react'
import { useState } from 'react'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'

interface FileCardProps {
    file: {
        id: string
        fileName: string
        filePath: string
        fileType: string
        fileSize: string
        uploadedAt: string
        uploader: any
    }
    onDownload: (fileId: string) => void
    onDelete: (fileId: string) => void
}

const getFileIcon = (type: string) => {
    const iconProps = { size: 24, stroke: 1.5 }
    
    switch (type) {
        case 'pdf':
            return <IconFileText {...iconProps} color='#e03131' />
        case 'excel':
            return <IconFileSpreadsheet {...iconProps} color='#2f9e44' />
        case 'csv':
            return <IconFileSpreadsheet {...iconProps} color='#1971c2' />
        case 'text':
            return <IconFileText {...iconProps} color='#868e96' />
        case 'zip':
        case 'rar':
            return <IconFileZip {...iconProps} color='#f59f00' />
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return <IconPhoto {...iconProps} color='#7c2d12' />
        case 'mp3':
        case 'wav':
            return <IconFileMusic {...iconProps} color='#be4bdb' />
        case 'mp4':
        default:
            return <IconFile3d {...iconProps} color='#495057' />
    }
}

const getFileTypeColor = (type: string) => {
    switch (type) {
        case 'pdf':
            return 'red'
        case 'excel':
            return 'green'
        case 'csv':
            return 'blue'
        case 'text':
            return 'gray'
        case 'zip':
        case 'rar':
            return 'yellow'
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return 'orange'
        case 'mp3':
        case 'wav':
            return 'violet'
        case 'mp4':
        case 'avi':
            return 'orange'
        default:
            return 'gray'
    }
}

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const FileCard = ({ file, onDownload, onDelete }: FileCardProps) => {
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
        setLoading(true)
        try {
            await onDownload(file.id)
        } catch (error) {
            console.error('Error downloading file:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = () => {
        modals.openConfirmModal({
            title: 'Xóa tệp tin',
            children: (
                <Text size="sm">
                    Bạn có chắc chắn muốn xóa tệp tin "{file.fileName}" không? 
                    Hành động này không thể hoàn tác.
                </Text>
            ),
            labels: { confirm: 'Xóa', cancel: 'Hủy' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                setLoading(true)
                try {
                    await onDelete(file.id)
                } catch (error) {
                    console.error('Error deleting file:', error)
                    notifications.show({
                        title: 'Lỗi',
                        message: 'Không thể xóa tệp tin',
                        color: 'red'
                    })
                } finally {
                    setLoading(false)
                }
            }
        })
    }

    return (
        <Card
            shadow='md'
            padding='lg'
            radius='lg'
            withBorder
            style={{
                height: '100%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: loading ? 0.6 : 1,
                pointerEvents: loading ? 'none' : 'auto',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                borderColor: '#e9ecef',
                overflow: 'hidden'
            }}
            styles={{
                root: {
                    '&:hover': {
                        transform: 'translateY(-4px) scale(1.02)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        borderColor: '#228be6'
                    }
                }
            }}
        >
            <Stack gap='md' h='100%'>
                {/* File Icon & Type Badge */}
                <Group justify='space-between' align='flex-start'>
                    <Paper
                        radius='lg'
                        p='sm'
                        bg='rgba(34, 139, 230, 0.1)'
                        style={{
                            border: '1px solid rgba(34, 139, 230, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {getFileIcon(file.fileType)}
                    </Paper>
                    <Badge
                        variant='light'
                        color={getFileTypeColor(file.fileType)}
                        size='sm'
                        radius='md'
                        style={{ textTransform: 'uppercase', fontWeight: 600 }}
                    >
                        {file.fileType}
                    </Badge>
                </Group>

                {/* File Name */}
                <Box style={{ flexGrow: 1 }}>
                    <Tooltip label={file.fileName} position="top" withArrow>
                        <Text 
                            fw={600} 
                            size='sm' 
                            lineClamp={2} 
                            ta='center'
                            style={{ 
                                color: '#212529',
                                lineHeight: 1.4,
                                fontSize: '14px'
                            }}
                        >
                            {file.fileName}
                        </Text>
                    </Tooltip>
                </Box>

                {/* File Info */}
                <Stack gap='xs'>
                    {/* File Size */}

                        <Text size='xs' c='green.7' ta='center' fw={500}>
                           Kích thước: {formatFileSize(Number(file.fileSize))}
                        </Text>
                  

                    {/* Upload Date */}
                    <Flex align='center' gap='xs' justify='center'>
                        <IconCalendarEvent size={14} color='#868e96' />
                        <Text size='xs' c='dimmed' fw={500}>
                            {new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
                        </Text>
                    </Flex>
                    
                    {/* Uploaded By */}
                    <Flex align='center' gap='xs' justify='center'>
                        <IconUser size={14} color='#868e96' />
                        <Text size='xs' c='dimmed' fw={500} lineClamp={1}>
                           {file.uploader?.name || 'Không rõ'}
                        </Text>
                    </Flex>
                </Stack>

                {/* Action Buttons */}
                <Group justify='center' mt='auto' gap='sm'>
                    <Tooltip label="Tải xuống" position="bottom" withArrow>
                        <ActionIcon 
                            variant='gradient' 
                            gradient={{ from: 'blue', to: 'cyan' }}
                            onClick={handleDownload}
                            loading={loading}
                            disabled={loading}
                            size='lg'
                            radius='md'
                            style={{
                                boxShadow: '0 2px 8px rgba(34, 139, 230, 0.3)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <IconDownload size={18} />
                        </ActionIcon>
                    </Tooltip>
                    
                    <Tooltip label="Xóa tệp tin" position="bottom" withArrow>
                        <ActionIcon 
                            variant='gradient' 
                            gradient={{ from: 'red', to: 'pink' }}
                            onClick={handleDelete}
                            loading={loading}
                            disabled={loading}
                            size='lg'
                            radius='md'
                            style={{
                                boxShadow: '0 2px 8px rgba(224, 49, 49, 0.3)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <IconTrash size={18} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Stack>
        </Card>
    )
}

export default FileCard