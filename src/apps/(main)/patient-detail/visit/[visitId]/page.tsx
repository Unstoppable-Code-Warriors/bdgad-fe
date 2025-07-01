import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
    Container,
    Title,
    Card,
    Text,
    Stack,
    Button,
    Group,
    //Paper,
    ActionIcon,
    Badge,
    Flex,
    Box,
    Grid,
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
    IconUpload,
    IconUser,
    IconFileZip,
    IconFile
} from '@tabler/icons-react'

const mockVisitFiles = {
    'visit1': {
        id: 'visit1',
        visitDate: '2024-01-15',
        visitNumber: 1,
        doctor: 'BS. Trần Minh',
        diagnosis: 'Khám tổng quát định kỳ',
        type: 'test',
        status: 'Hoàn thành',
        files: [
            {
                id: 'file1',
                name: 'Xét nghiệm máu tổng quát',
                type: 'pdf',
                size: '2.5 MB',
                uploadedAt: '2024-01-15',
                result: 'Bình thường',
                category: 'Xét nghiệm máu'
            },
            {
                id: 'file2',
                name: 'Xét nghiệm nước tiểu',
                type: 'pdf',
                size: '1.8 MB',
                uploadedAt: '2024-01-15',
                result: 'Có protein nhẹ',
                category: 'Xét nghiệm nước tiểu'
            },
            {
                id: 'file3',
                name: 'Kết quả siêu âm bụng',
                type: 'image',
                size: '4.2 MB',
                uploadedAt: '2024-01-15',
                result: 'Gan nhiễm mỡ độ 1',
                category: 'Siêu âm'
            },
            {
                id: 'file4',
                name: 'X-quang ngực',
                type: 'image',
                size: '3.1 MB',
                uploadedAt: '2024-01-15',
                result: 'Phổi bình thường',
                category: 'X-quang'
            },
            {
                id: 'file5',
                name: 'Báo cáo tổng hợp',
                type: 'word',
                size: '1.2 MB',
                uploadedAt: '2024-01-15',
                result: 'Sức khỏe tổng quát ổn định',
                category: 'Báo cáo'
            }
        ]
    },
    'visit2': {
        id: 'visit2',
        visitDate: '2024-01-20',
        visitNumber: 2,
        doctor: 'BS. Lê Hòa',
        diagnosis: 'Thẩm định kết quả xét nghiệm',
        type: 'assessment',
        status: 'Hoàn thành',
        files: [
            {
                id: 'file6',
                name: 'Báo cáo thẩm định sức khỏe',
                type: 'word',
                size: '2.1 MB',
                uploadedAt: '2024-01-20',
                status: 'Đã hoàn thành',
                category: 'Thẩm định'
            },
            {
                id: 'file7',
                name: 'Kết luận y khoa',
                type: 'pdf',
                size: '1.5 MB',
                uploadedAt: '2024-01-20',
                status: 'Đã hoàn thành',
                category: 'Kết luận'
            },
            {
                id: 'file8',
                name: 'Hồ sơ bệnh án',
                type: 'zip',
                size: '5.8 MB',
                uploadedAt: '2024-01-20',
                status: 'Đã hoàn thành',
                category: 'Hồ sơ'
            }
        ]
    }
}

const getFileIcon = (type: string) => {
    switch (type) {
        case 'pdf':
            return <IconFileText size={20} color='#e03131' />
        case 'image':
            return <IconPhoto size={20} color='#1971c2' />
        case 'word':
            return <IconFileWord size={20} color='#2f9e44' />
        case 'zip':
            return <IconFileZip size={20} color='#f59f00' />
        default:
            return <IconFile size={20} />
    }
}

const getStatusBadge = (status: string) => {
    const statusColors = {
        'Đã hoàn thành': 'green',
        'Đang xử lý': 'yellow',
        'Chờ thẩm định': 'blue',
        'Hoàn thành': 'green'
    }
    return (
        <Badge color={statusColors[status as keyof typeof statusColors] || 'gray'} variant='light' size='sm'>
            {status}
        </Badge>
    )
}

const getVisitTypeIcon = (type: string) => {
    if (type === 'test') {
        return <IconMicroscope size={24} color='#1971c2' />
    } else {
        return <IconClipboardCheck size={24} color='#2f9e44' />
    }
}

const VisitDetailPage = () => {
    const { id: patientId, visitId } = useParams<{ id: string, visitId: string }>()
    const navigate = useNavigate()
    const [visit, setVisit] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (visitId && mockVisitFiles[visitId as keyof typeof mockVisitFiles]) {
            setVisit(mockVisitFiles[visitId as keyof typeof mockVisitFiles])
        }
        setLoading(false)
    }, [visitId])

    const handleBack = () => {
        navigate(`/patient-detail/${patientId}`)
    }

    const handleViewFile = (fileId: string) => {
        console.log('View file:', fileId)
    }

    const handleDownloadFile = (fileId: string) => {
        console.log('Download file:', fileId)
    }

    const handleUploadNew = () => {
        navigate('/import-file/input', {
            state: { patientId, visitId }
        })
    }

    if (loading) {
        return (
            <Container size='xl' py='xl'>
                <Text>Đang tải...</Text>
            </Container>
        )
    }

    if (!visit) {
        return (
            <Container size='xl' py='xl'>
                <Text>Không tìm thấy lần khám</Text>
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
                            <Title order={2}>Lần khám {visit.visitNumber}</Title>
                            <Text size='sm' c='dimmed'>Bệnh nhân #{patientId}</Text>
                        </div>
                    </Group>

                    <Button leftSection={<IconUpload size={16} />} onClick={handleUploadNew}>
                        Tải lên file mới
                    </Button>
                </Group>

                {/* Visit Info */}
                <Card shadow='sm' padding='lg' withBorder>
                    <Group justify='space-between' align='flex-start'>
                        <Group align='flex-start'>
                            <Box p='md' bg={visit.type === 'test' ? 'blue.0' : 'green.0'} style={{ borderRadius: '12px' }}>
                                {getVisitTypeIcon(visit.type)}
                            </Box>
                            
                            <div>
                                <Group gap='sm' mb='xs'>
                                    <Text fw={600} size='xl'>
                                        Lần {visit.visitNumber}
                                    </Text>
                                    <Badge color={visit.type === 'test' ? 'blue' : 'green'} variant='light'>
                                        {visit.type === 'test' ? 'Xét nghiệm' : 'Thẩm định'}
                                    </Badge>
                                </Group>
                                
                                <Text fw={500} size='lg' mb='sm'>
                                    {visit.diagnosis}
                                </Text>
                                
                                <Group gap='lg'>
                                    <Flex align='center' gap='xs'>
                                        <IconCalendarEvent size={16} />
                                        <Text size='sm' c='dimmed'>
                                            {new Date(visit.visitDate).toLocaleDateString('vi-VN')}
                                        </Text>
                                    </Flex>
                                    <Flex align='center' gap='xs'>
                                        <IconUser size={16} />
                                        <Text size='sm' c='dimmed'>
                                            {visit.doctor}
                                        </Text>
                                    </Flex>
                                    <Text size='sm' c='dimmed'>
                                        Tổng cộng: {visit.files.length} file
                                    </Text>
                                </Group>
                            </div>
                        </Group>

                        {getStatusBadge(visit.status)}
                    </Group>
                </Card>

                {/* Files Grid */}
                <div>
                    <Group mb='lg'>
                        <Title order={3} c={visit.type === 'test' ? 'blue' : 'green'}>
                            File {visit.type === 'test' ? 'xét nghiệm' : 'thẩm định'}
                        </Title>
                        <Badge variant='light' color={visit.type === 'test' ? 'blue' : 'green'}>
                            {visit.files.length} file
                        </Badge>
                    </Group>

                    <Grid>
                        {visit.files.map((file: any) => (
                            <Grid.Col key={file.id} span={{ base: 12, md: 6, lg: 4 }}>
                                <Card shadow='sm' padding='md' withBorder h='100%'>
                                    <Stack gap='sm'>
                                        {/* File Header */}
                                        <Group>
                                            {getFileIcon(file.type)}
                                            <Badge size='xs' variant='light' color='gray'>
                                                {file.category}
                                            </Badge>
                                        </Group>

                                        {/* File Info */}
                                        <div>
                                            <Text fw={600} size='sm' mb='xs'>
                                                {file.name}
                                            </Text>
                                            <Text size='xs' c='dimmed' mb='sm'>
                                                {file.size} • {new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
                                            </Text>
                                            
                                            {/* Result/Status */}
                                            {/* {visit.type === 'test' && file.result && (
                                                <Paper p='xs' bg='blue.0' mb='sm'>
                                                    <Text size='xs' c='blue' fw={500}>
                                                        Kết quả: {file.result}
                                                    </Text>
                                                </Paper>
                                            )} */}
                                            
                                            {/* {visit.type === 'assessment' && file.status && (
                                                <Group mb='sm'>
                                                    <Text size='xs' c='dimmed'>Trạng thái:</Text>
                                                    {getStatusBadge(file.status)}
                                                </Group>
                                            )} */}
                                        </div>

                                        {/* Actions */}
                                        <Group gap='xs' mt='auto'>
                                            <ActionIcon 
                                                variant='light' 
                                                color='blue' 
                                                size='sm' 
                                                onClick={() => handleViewFile(file.id)}
                                                flex={1}
                                            >
                                                <IconEye size={14} />
                                            </ActionIcon>
                                            <ActionIcon 
                                                variant='light' 
                                                color='green' 
                                                size='sm' 
                                                onClick={() => handleDownloadFile(file.id)}
                                                flex={1}
                                            >
                                                <IconDownload size={14} />
                                            </ActionIcon>
                                        </Group>
                                    </Stack>
                                </Card>
                            </Grid.Col>
                        ))}
                    </Grid>
                </div>
            </Stack>
        </Container>
    )
}

export default VisitDetailPage