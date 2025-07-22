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
    Box,
    Grid,
    ScrollArea
} from '@mantine/core'
import {
    IconArrowLeft,
    IconCalendarEvent,
    IconMicroscope,
    IconClipboardCheck,
    IconStethoscope,
    IconUser,
    IconPlus,
    IconPhone,
    IconId,
    IconMapPin
} from '@tabler/icons-react'
import { usePatientLabSessions } from '@/services/hook/staff-patient-session.hook'

const getStatusBadge = (status: string) => {
    const statusColors = {
        completed: 'green',
        processing: 'yellow',
        pending: 'blue',
        test: 'blue',
        validation: 'green'
    }

    const statusLabels = {
        completed: 'Hoàn thành',
        processing: 'Đang xử lý',
        pending: 'Chờ thẩm định',
        test: 'Xét nghiệm',
        validation: 'Thẩm định'
    }

    return (
        <Badge color={statusColors[status as keyof typeof statusColors] || 'gray'} variant='light' size='sm'>
            {statusLabels[status as keyof typeof statusLabels] || status}
        </Badge>
    )
}

const getSessionTypeIcon = (type: string) => {
    if (type === 'test') {
        return <IconMicroscope size={20} color='#1971c2' />
    } else {
        return <IconClipboardCheck size={20} color='#2f9e44' />
    }
}

const getSessionTypeBadge = (type: string) => {
    if (type === 'test') {
        return (
            <Badge color='blue' variant='light' size='sm'>
                Xét nghiệm
            </Badge>
        )
    } else {
        return (
            <Badge color='green' variant='light' size='sm'>
                Thẩm định
            </Badge>
        )
    }
}

const PatientDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const { data: sessionsResponse, isLoading, error } = usePatientLabSessions(id!)

    const sessions = sessionsResponse?.labSessionData || []
    const patientData = sessionsResponse?.patientData || null

    const handleBack = () => {
        navigate('/patient-folder')
    }

    const handleImport = () => {
        navigate('/import-file/input', {
            state: { patientId: id }
        })
    }

    const handleSessionClick = (sessionId: string) => {
        navigate(`/patient-detail/${id}/session/${sessionId}`)
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
                        <Title order={2}>Hồ sơ bệnh nhân #{id}</Title>
                    </Group>

                    <Button leftSection={<IconPlus size={16} />} onClick={handleImport}>
                        Tạo lần khám mới
                    </Button>
                </Group>

                {sessions.length > 0 && (
                    <Card shadow='md' padding='xl' withBorder radius='lg'>
                        <Group justify='space-between' align='center'>
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
                                        {sessions.length} lần khám
                                    </Text>
                                </div>
                            </Group>

                            {/* Right Side - Quick Stats */}
                            <Group gap='xl'>
                                <div style={{ textAlign: 'center' }}>
                                    <Group gap='xs' justify='center' mb='xs'>
                                        <IconMicroscope size={20} color='#1971c2' />
                                        <Text fw={700} size='lg' c='blue'>
                                            {
                                                sessions.filter((session: any) => session.typeLabSession === 'test')
                                                    .length
                                            }
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
                                            {
                                                sessions.filter(
                                                    (session: any) => session.typeLabSession === 'validation'
                                                ).length
                                            }
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

                <Grid>
                    {/* Patient Information */}
                    <Grid.Col span={sessions.length > 0 ? 4 : 12}>
                        <Card h={sessions.length > 0 ? 350 : '100%'} shadow='sm' padding='lg' withBorder>
                            <Stack gap='md'>
                                <Group align='center' mb='sm'>
                                    <Box p='sm' bg='blue.0' style={{ borderRadius: '8px' }}>
                                        <IconUser size={20} color='#1971c2' />
                                    </Box>
                                    <div>
                                        <Text fw={600} size='lg'>
                                            Thông tin bệnh nhân
                                        </Text>
                                    </div>
                                </Group>

                                <Grid>
                                    <Grid.Col span={{ base: 12, sm: sessions.length > 0 ? 12 : 6 }}>
                                        <Stack gap='xs'>
                                            <Group gap='xs'>
                                                <IconUser size={16} color='#495057' />
                                                <Text size='sm' fw={500} c='dimmed'>
                                                    Họ và tên:
                                                </Text>
                                                <Text size='md' fw={600}>
                                                    {patientData?.fullName || 'Không có thông tin'}
                                                </Text>
                                            </Group>
                                        </Stack>
                                    </Grid.Col>

                                    <Grid.Col span={{ base: 12, sm: sessions.length > 0 ? 12 : 6 }}>
                                        <Stack gap='xs'>
                                            <Group gap='xs'>
                                                <IconCalendarEvent size={16} color='#495057' />
                                                <Text size='sm' fw={500} c='dimmed'>
                                                    Ngày sinh:
                                                </Text>
                                                <Text size='md' fw={600}>
                                                    {patientData?.dateOfBirth
                                                        ? new Date(patientData.dateOfBirth).toLocaleDateString('vi-VN')
                                                        : 'Không có thông tin'}
                                                </Text>
                                            </Group>
                                        </Stack>
                                    </Grid.Col>

                                    <Grid.Col span={{ base: 12, sm: sessions.length > 0 ? 12 : 6 }}>
                                        <Stack gap='xs'>
                                            <Group gap='xs'>
                                                <IconPhone size={16} color='#495057' />
                                                <Text size='sm' fw={500} c='dimmed'>
                                                    Số điện thoại:
                                                </Text>
                                                <Text size='md' fw={600}>
                                                    {patientData?.phone || 'Không có thông tin'}
                                                </Text>
                                            </Group>
                                        </Stack>
                                    </Grid.Col>

                                    <Grid.Col span={{ base: 12, sm: sessions.length > 0 ? 12 : 6 }}>
                                        <Stack gap='xs'>
                                            <Group gap='xs'>
                                                <IconId size={16} color='#495057' />
                                                <Text size='sm' fw={500} c='dimmed'>
                                                    CCCD:
                                                </Text>
                                                <Text size='md' fw={600}>
                                                    {patientData?.citizenId || 'Không có thông tin'}
                                                </Text>
                                            </Group>
                                        </Stack>
                                    </Grid.Col>

                                    {sessions.length > 0 && (
                                        <Grid.Col span={12}>
                                            <Stack gap='xs'>
                                                <Group gap='xs'>
                                                    <IconMapPin size={16} color='#495057' />
                                                    <Text size='sm' fw={500} c='dimmed'>
                                                        Địa chỉ:
                                                    </Text>
                                                    <Text size='md' fw={600}>
                                                        {patientData?.address || 'Không có thông tin'}
                                                    </Text>
                                                </Group>
                                            </Stack>
                                        </Grid.Col>
                                    )}

                                    {sessions.length === 0 && (
                                        <>
                                            <Grid.Col span={12}>
                                                <Stack gap='xs'>
                                                    <Group gap='xs'>
                                                        <IconMapPin size={16} color='#495057' />
                                                        <Text size='sm' fw={500} c='dimmed'>
                                                            Địa chỉ
                                                        </Text>
                                                    </Group>
                                                    <Text size='md' fw={600} pl='xl'>
                                                        {'Không có thông tin'}
                                                    </Text>
                                                </Stack>
                                            </Grid.Col>
                                        </>
                                    )}
                                </Grid>
                            </Stack>
                        </Card>
                    </Grid.Col>

                    {/* Sessions List */}
                    {sessions.length > 0 && (
                        <Grid.Col span={8}>
                            <Stack gap='md' h='100%'>
                                <Text fw={600} size='lg'>
                                    Danh sách lần khám
                                </Text>
                                <ScrollArea h={500} scrollbarSize={6} scrollHideDelay={500}>
                                    <Stack gap='md'>
                                        {sessions.map((session: any, index: number) => (
                                            <Card
                                                key={session.id}
                                                shadow='sm'
                                                padding='lg'
                                                withBorder
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleSessionClick(session.id)}
                                            >
                                                <Group justify='space-between' align='flex-start'>
                                                    <Group align='flex-start'>
                                                        <Box
                                                            p='sm'
                                                            bg={
                                                                session.typeLabSession === 'test' ? 'blue.0' : 'green.0'
                                                            }
                                                            style={{ borderRadius: '8px' }}
                                                        >
                                                            {getSessionTypeIcon(session.typeLabSession)}
                                                        </Box>

                                                        <div>
                                                            <Group gap='sm' mb='xs'>
                                                                <Text fw={600} size='lg'>
                                                                    Lần {index + 1}
                                                                </Text>
                                                                {getSessionTypeBadge(session.typeLabSession)}
                                                            </Group>

                                                            <Text fw={500} mb='xs'>
                                                                Barcode: {session.barcode}
                                                            </Text>

                                                            <Group gap='md'>
                                                                <Flex align='center' gap='xs'>
                                                                    <IconCalendarEvent size={14} />
                                                                    <Text size='sm' c='dimmed'>
                                                                        {new Date(
                                                                            session.requestDate
                                                                        ).toLocaleDateString('vi-VN')}
                                                                    </Text>
                                                                </Flex>
                                                                <Flex align='center' gap='xs'>
                                                                    <IconUser size={14} />
                                                                    <Text size='sm' c='dimmed'>
                                                                        {session.doctor?.name || 'Chưa có bác sĩ'}
                                                                    </Text>
                                                                </Flex>
                                                                <Text size='sm' c='dimmed'>
                                                                    {session.patientFiles?.length || 0} file
                                                                </Text>
                                                            </Group>
                                                        </div>
                                                    </Group>

                                                    {getStatusBadge(session.typeLabSession)}
                                                </Group>
                                            </Card>
                                        ))}
                                    </Stack>
                                </ScrollArea>
                            </Stack>
                        </Grid.Col>
                    )}
                </Grid>

                {/* Empty State for No Sessions */}
                {sessions.length === 0 && (
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
