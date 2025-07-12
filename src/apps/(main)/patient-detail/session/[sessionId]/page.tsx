import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
    Container,
    Title,
    Card,
    Text,
    Stack,
    Button,
    Group,
    ActionIcon,
    Badge,
    Flex,
    Box,
    Grid,
    Paper
} from '@mantine/core'
import {
    IconArrowLeft,
    IconDownload,
    IconEye,
    IconFileText,
    IconPhoto,
    IconFileWord,
    IconCalendarEvent,
    IconMicroscope,
    IconClipboardCheck,
    IconUser,
    IconFileZip,
    IconFile,
    IconSend,
    IconCheck
} from '@tabler/icons-react'
import { usePatientLabSessionDetail } from '@/services/hook/staff-patient-session.hook'
import SendFilesModal from '../components/SendFilesModal'


const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
        case 'pdf':
            return <IconFileText size={20} color='#e03131' />
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return <IconPhoto size={20} color='#1971c2' />
        case 'doc':
        case 'docx':
            return <IconFileWord size={20} color='#2f9e44' />
        case 'xlsx':
        case 'xls':
            return <IconFileText size={20} color='#2f9e44' />
        case 'zip':
        case 'rar':
            return <IconFileZip size={20} color='#f59f00' />
        default:
            return <IconFile size={20} />
    }
}

const getStatusBadge = (typeLabSession: string) => {
    if (typeLabSession === 'test') {
        return (
            <Badge color='blue' variant='light' size='sm'>
                Xét nghiệm
            </Badge>
        )
    } else if (typeLabSession === 'validation') {
        return (
            <Badge color='green' variant='light' size='sm'>
                Thẩm định
            </Badge>
        )
    }
    return (
        <Badge color='gray' variant='light' size='sm'>
            {typeLabSession}
        </Badge>
    )
}

const getSessionTypeIcon = (typeLabSession: string) => {
    if (typeLabSession === 'test') {
        return <IconMicroscope size={24} color='#1971c2' />
    } else {
        return <IconClipboardCheck size={24} color='#2f9e44' />
    }
}

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const SessionDetailPage = () => {
    const { id: patientId, sessionId } = useParams<{ id: string; sessionId: string }>()
    const navigate = useNavigate()
    const [isSendModalOpen, setIsSendModalOpen] = useState(false)

    const { data: sessionData, isLoading, error } = usePatientLabSessionDetail(sessionId!)

    const handleBack = () => {
        navigate(`/patient-detail/${patientId}`)
    }

    const handleViewFile = (filePath: string) => {
        window.open(filePath, '_blank')
    }

    const handleDownloadFile = (filePath: string, fileName: string) => {
        const link = document.createElement('a')
        link.href = filePath
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleSendFiles = () => {
        setIsSendModalOpen(true)
    }

    const handleCloseSendModal = () => {
        setIsSendModalOpen(false)
    }

    if (isLoading) {
        return (
            <Container size='xl' py='xl'>
                <Text>Đang tải...</Text>
            </Container>
        )
    }

    if (error) {
        return (
            <Container size='xl' py='xl'>
                <Paper p='xl' ta='center' withBorder>
                    <Text color='red'>Có lỗi xảy ra khi tải dữ liệu</Text>
                    <Button mt='md' onClick={handleBack}>
                        Quay lại
                    </Button>
                </Paper>
            </Container>
        )
    }

    if (!sessionData) {
        return (
            <Container size='xl' py='xl'>
                <Paper p='xl' ta='center' withBorder>
                    <Text>Không tìm thấy lần khám</Text>
                    <Button mt='md' onClick={handleBack}>
                        Quay lại
                    </Button>
                </Paper>
            </Container>
        )
    }

    return (
        <Container size='xl' py='xl'>
            <Stack gap='lg'>
                {/* Header */}
                <Group justify='space-between'>
                    <Group>
                        <ActionIcon variant='light' size='lg' onClick={handleBack}>
                            <IconArrowLeft size={20} />
                        </ActionIcon>
                        <div>
                            <Title order={2}>Lần khám </Title>
                        </div>
                    </Group>

                    {/* Send Files Button */}
                    {sessionData?.patientFiles && sessionData.patientFiles.length > 0 && (() => {
                        const hasDoctor = sessionData?.doctor?.id
                        const hasLabTech = sessionData?.labTestingTechnician?.id || sessionData?.labTesting?.id
                        const isAlreadyAssigned = sessionData.typeLabSession === 'test' 
                            ? hasDoctor && hasLabTech 
                            : hasDoctor

                        return (
                            <Button 
                                leftSection={isAlreadyAssigned ? <IconCheck size={16} /> : <IconSend size={16} />} 
                                onClick={handleSendFiles}
                                color={sessionData.typeLabSession === 'test' ? 'blue' : 'green'}
                                variant={isAlreadyAssigned ? 'light' : 'filled'}
                            >
                                {isAlreadyAssigned ? 'Thông tin người nhận' : 'Gửi file đi'}
                            </Button>
                        )
                    })()}
                </Group>

                {/* Session Info */}
                <Card shadow='sm' padding='lg' withBorder>
                    <Group justify='space-between' align='flex-start'>
                        <Group align='flex-start'>
                            <Box
                                p='md'
                                bg={sessionData.typeLabSession === 'test' ? 'blue.0' : 'green.0'}
                                style={{ borderRadius: '12px' }}
                            >
                                {getSessionTypeIcon(sessionData.typeLabSession)}
                            </Box>

                            <div>
                                <Group gap='sm' mb='xs'>
                                    {getStatusBadge(sessionData.typeLabSession)}
                                </Group>

                                <Text fw={500} size='lg' mb='sm'>
                                     Barcode: {sessionData.barcode}
                                </Text>

                                <Group gap='lg'>
                                    <Flex align='center' gap='xs'>
                                        <IconCalendarEvent size={16} />
                                        <Text size='sm' c='dimmed'>
                                            {new Date(sessionData.requestDate).toLocaleDateString('vi-VN')}
                                        </Text>
                                    </Flex>
                                    <Flex align='center' gap='xs'>
                                        <IconUser size={16} />
                                        <Text size='sm' c='dimmed'>
                                            {sessionData.doctor?.name || 'Chưa có bác sĩ'}
                                        </Text>
                                    </Flex>
                                    <Text size='sm' c='dimmed'>
                                        Tổng cộng: {sessionData.patientFiles?.length || 0} file
                                    </Text>
                                </Group>
                            </div>
                        </Group>
                    </Group>
                </Card>

                {/* Files Grid */}
                <div>
                    <Group mb='lg'>
                        <Title order={3} c={sessionData.typeLabSession === 'test' ? 'blue' : 'green'}>
                            File {sessionData.typeLabSession === 'test' ? 'xét nghiệm' : 'thẩm định'}
                        </Title>
                        <Badge variant='light' color={sessionData.typeLabSession === 'test' ? 'blue' : 'green'}>
                            {sessionData.patientFiles?.length || 0} file
                        </Badge>
                    </Group>

                    {sessionData.patientFiles && sessionData.patientFiles.length > 0 ? (
                        <>
                            <Grid>
                                {sessionData.patientFiles.map((file: any) => (
                                    <Grid.Col key={file.id} span={{ base: 12, md: 6, lg: 4 }}>
                                        <Card shadow='sm' padding='md' withBorder h='100%'>
                                            <Stack gap='sm'>
                                                {/* File Header */}
                                                <Group>
                                                    {getFileIcon(file.fileType)}
                                                    <Badge size='xs' variant='light' color='gray'>
                                                        {file.fileType.toUpperCase()}
                                                    </Badge>
                                                </Group>

                                                {/* File Info */}
                                                <div>
                                                    <Text fw={600} size='sm' mb='xs' lineClamp={2}>
                                                        {file.fileName}
                                                    </Text>
                                                    <Text size='xs' c='dimmed' mb='sm'>
                                                        {formatFileSize(file.fileSize)} •{' '}
                                                        {new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
                                                    </Text>

                                                    {/* Uploader Info */}
                                                    {file.uploader && (
                                                        <Group gap='xs' mb='sm'>
                                                            <IconUser size={12} />
                                                            <Text size='xs' c='dimmed'>
                                                                {file.uploader.name}
                                                            </Text>
                                                        </Group>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <Group gap='xs' mt='auto'>
                                                    <ActionIcon
                                                        variant='light'
                                                        color='blue'
                                                        size='sm'
                                                        onClick={() => handleViewFile(file.filePath)}
                                                        flex={1}
                                                        title='Xem file'
                                                    >
                                                        <IconEye size={14} />
                                                    </ActionIcon>
                                                    <ActionIcon
                                                        variant='light'
                                                        color='green'
                                                        size='sm'
                                                        onClick={() => handleDownloadFile(file.filePath, file.fileName)}
                                                        flex={1}
                                                        title='Tải xuống'
                                                    >
                                                        <IconDownload size={14} />
                                                    </ActionIcon>
                                                </Group>
                                            </Stack>
                                        </Card>
                                    </Grid.Col>
                                ))}
                            </Grid>

                        </>
                    ) : (
                        <Paper p='xl' ta='center' withBorder>
                            <IconFile size={48} color='gray' />
                            <Title order={4} mt='md' c='dimmed'>
                                Chưa có file nào
                            </Title>
                            <Text c='dimmed' mt='xs'>
                                Phiên khám này chưa có file đính kèm
                            </Text>
                        </Paper>
                    )}
                </div>

                {/* Send Files Modal */}
                <SendFilesModal
                    opened={isSendModalOpen}
                    onClose={handleCloseSendModal}
                    sessionType={sessionData?.typeLabSession || 'test'}
                    sessionId={sessionId!}
                    patientId={patientId!}
                    sessionData={sessionData}
                />
            </Stack>
        </Container>
    )
}

export default SessionDetailPage
