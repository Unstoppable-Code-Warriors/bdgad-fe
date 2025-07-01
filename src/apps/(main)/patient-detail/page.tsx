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
    Paper,
    ActionIcon,
    Badge,
    Flex,
    Box
} from '@mantine/core'
import {
    IconArrowLeft,
    IconCalendarEvent,
    IconMicroscope,
    IconClipboardCheck,
    IconUpload,
    IconStethoscope,
    IconUser
} from '@tabler/icons-react'

const mockPatientVisits = {
    '1': [
        {
            id: 'visit1',
            visitDate: '2024-01-15',
            visitNumber: 1,
            doctor: 'BS. Trần Minh',
            diagnosis: 'Khám tổng quát định kỳ',
            type: 'test',
            status: 'Hoàn thành',
            fileCount: 5
        },
        {
            id: 'visit2',
            visitDate: '2024-01-20',
            visitNumber: 2,
            doctor: 'BS. Lê Hòa',
            diagnosis: 'Thẩm định kết quả xét nghiệm',
            type: 'assessment',
            status: 'Hoàn thành',
            fileCount: 3
        },
        {
            id: 'visit3',
            visitDate: '2024-02-01',
            visitNumber: 3,
            doctor: 'BS. Nguyễn Nam',
            diagnosis: 'Siêu âm bụng',
            type: 'test',
            status: 'Hoàn thành',
            fileCount: 7
        }
    ],
    '2': [
        {
            id: 'visit4',
            visitDate: '2024-01-20',
            visitNumber: 1,
            doctor: 'BS. Lê Văn C',
            diagnosis: 'Khám chuyên khoa tim mạch',
            type: 'test',
            status: 'Hoàn thành',
            fileCount: 4
        }
    ]
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
        return <IconMicroscope size={20} color='#1971c2' />
    } else {
        return <IconClipboardCheck size={20} color='#2f9e44' />
    }
}

const getVisitTypeBadge = (type: string) => {
    if (type === 'test') {
        return <Badge color='blue' variant='light' size='sm'>Xét nghiệm</Badge>
    } else {
        return <Badge color='green' variant='light' size='sm'>Thẩm định</Badge>
    }
}

const PatientDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [visits, setVisits] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id && mockPatientVisits[id as keyof typeof mockPatientVisits]) {
            setVisits(mockPatientVisits[id as keyof typeof mockPatientVisits])
        } else {
            setVisits([])
        }
        setLoading(false)
    }, [id])

    const handleBack = () => {
        navigate('/patient-info')
    }

    const handleImport = () => {
        navigate('/import-file/input', {
            state: { patientId: id }
        })
    }

    const handleVisitClick = (visitId: string) => {
        navigate(`/patient-detail/${id}/visit/${visitId}`)
    }

    if (loading) {
        return (
            <Container size='xl' py='xl'>
                <Text>Đang tải...</Text>
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
                        <Title order={2}>Hồ sơ bệnh nhân #{id}</Title>
                    </Group>

                    <Button leftSection={<IconUpload size={16} />} onClick={handleImport}>
                        Tải lên file mới
                    </Button>
                </Group>

                {/* Overall Statistics */}
                {visits.length > 0 && (
                    <Card shadow='md' padding='xl' withBorder radius='lg'>
                        <Group justify='space-between' align='center'>
                            {/* Left Side - Overview */}
                            <Group>
                                <Box 
                                    p='lg' 
                                    bg='linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                                    style={{ borderRadius: '16px' }}
                                >
                                    <IconStethoscope size={32} color='white' />
                                </Box>
                                <div>
                                    <Text fw={700} size='xl' c='dark'>
                                        Tổng quan hồ sơ
                                    </Text>
                                    <Text size='md' c='dimmed'>
                                        {visits.length} lần khám
                                    </Text>
                                </div>
                            </Group>

                            {/* Right Side - Quick Stats */}
                            <Group gap='xl'>
                                <div style={{ textAlign: 'center' }}>
                                    <Group gap='xs' justify='center' mb='xs'>
                                        <IconMicroscope size={20} color='#1971c2' />
                                        <Text fw={700} size='lg' c='blue'>
                                            {visits.filter(visit => visit.type === 'test').length}
                                        </Text>
                                    </Group>
                                    <Text size='sm' c='dimmed' fw={500}>
                                        Xét nghiệm
                                    </Text>
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <Group gap='xs' justify='center' mb='xs'>
                                        <IconClipboardCheck size={20} color='#2f9e44' />
                                        <Text fw={700} size='lg' c='green'>
                                            {visits.filter(visit => visit.type === 'assessment').length}
                                        </Text>
                                    </Group>
                                    <Text size='sm' c='dimmed' fw={500}>
                                        Thẩm định
                                    </Text>
                                </div>
                            </Group>
                        </Group>
                    </Card>
                )}

                {/* Visits List */}
                {visits.length > 0 ? (
                    <Stack gap='md'>
                        {visits.map((visit) => (
                            <Card 
                                key={visit.id} 
                                shadow='sm' 
                                padding='lg' 
                                withBorder
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleVisitClick(visit.id)}
                            >
                                <Group justify='space-between' align='flex-start'>
                                    <Group align='flex-start'>
                                        <Box p='sm' bg={visit.type === 'test' ? 'blue.0' : 'green.0'} style={{ borderRadius: '8px' }}>
                                            {getVisitTypeIcon(visit.type)}
                                        </Box>
                                        
                                        <div>
                                            <Group gap='sm' mb='xs'>
                                                <Text fw={600} size='lg'>
                                                    Lần {visit.visitNumber}
                                                </Text>
                                                {getVisitTypeBadge(visit.type)}
                                            </Group>
                                            
                                            <Text fw={500} mb='xs'>
                                                {visit.diagnosis}
                                            </Text>
                                            
                                            <Group gap='md'>
                                                <Flex align='center' gap='xs'>
                                                    <IconCalendarEvent size={14} />
                                                    <Text size='sm' c='dimmed'>
                                                        {new Date(visit.visitDate).toLocaleDateString('vi-VN')}
                                                    </Text>
                                                </Flex>
                                                <Flex align='center' gap='xs'>
                                                    <IconUser size={14} />
                                                    <Text size='sm' c='dimmed'>
                                                        {visit.doctor}
                                                    </Text>
                                                </Flex>
                                                <Text size='sm' c='dimmed'>
                                                    {visit.fileCount} file
                                                </Text>
                                            </Group>
                                        </div>
                                    </Group>

                                    {getStatusBadge(visit.status)}
                                </Group>
                            </Card>
                        ))}
                    </Stack>
                ) : (
                    <Paper p='xl' ta='center' withBorder>
                        <IconStethoscope size={48} color='gray' />
                        <Text size='lg' fw={600} mt='md'>
                            Chưa có lần khám nào
                        </Text>
                        <Text size='sm' c='dimmed' mt='xs'>
                            Bệnh nhân chưa có lịch sử khám bệnh
                        </Text>
                    </Paper>
                )}
            </Stack>
        </Container>
    )
}

export default PatientDetailPage