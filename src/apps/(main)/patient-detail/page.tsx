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
    IconId,
    IconBarcode,
    IconPhone,
    IconMapPin,
    IconUsers,
    IconHeart,
    IconGenderBigender,
    IconWorld,
    IconBriefcase,
    IconMedicalCross
} from '@tabler/icons-react'
import { usePatientLabSessions } from '@/services/hook/staff-patient-session.hook'

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

    const handleClinicInfo = () => {
        navigate(`/pharmacy-patient-info/${id}`)
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
                    <Grid.Col span={sessions.length > 0 ? 7 : 12}>
                        <Card shadow='sm' padding='xl' withBorder>
                            <Stack gap='lg'>
                                {/* Header */}
                                <Group justify='space-between' align='center' mb='md'>
                                    <Group>
                                        <Box
                                            p='md'
                                            bg='linear-gradient(135deg, #4c6ef5 0%, #364fc7 100%)'
                                            style={{ borderRadius: '12px' }}
                                        >
                                            <IconUser size={24} color='white' />
                                        </Box>
                                        <div>
                                            <Text fw={700} size='xl' c='dark'>
                                                Thông tin bệnh nhân
                                            </Text>
                                            <Text size='sm' c='dimmed'>
                                                Chi tiết hồ sơ cá nhân
                                            </Text>
                                        </div>
                                    </Group>
                                    <Button
                                        variant='light'
                                        color='blue'
                                        leftSection={<IconMedicalCross size={16} />}
                                        onClick={handleClinicInfo}
                                    >
                                        Thông tin y tế
                                    </Button>
                                </Group>

                                <Box>
                                    <Grid>
                                        {/* Basic Information Section */}
                                        <Grid.Col span={12}>
                                            <Text
                                                size='sm'
                                                fw={600}
                                                c='blue'
                                                mb='md'
                                                tt='uppercase'
                                                style={{ letterSpacing: 0.5 }}
                                            >
                                                Thông tin cơ bản
                                            </Text>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Group gap='md' align='flex-start'>
                                                <Box p='xs' bg='gray.0' style={{ borderRadius: '8px' }}>
                                                    <IconBarcode size={18} color='#495057' />
                                                </Box>
                                                <Box flex={1}>
                                                    <Text size='sm' fw={500} c='dimmed' mb={2}>
                                                        Mã barcode
                                                    </Text>
                                                    <Text size='md' fw={600} c='dark'>
                                                        {patientData?.barcode || 'Chưa có thông tin'}
                                                    </Text>
                                                </Box>
                                            </Group>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Group gap='md' align='flex-start'>
                                                <Box p='xs' bg='gray.0' style={{ borderRadius: '8px' }}>
                                                    <IconUser size={18} color='#495057' />
                                                </Box>
                                                <Box flex={1}>
                                                    <Text size='sm' fw={500} c='dimmed' mb={2}>
                                                        Họ và tên
                                                    </Text>
                                                    <Text size='md' fw={600} c='dark'>
                                                        {patientData?.fullName || 'Chưa có thông tin'}
                                                    </Text>
                                                </Box>
                                            </Group>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Group gap='md' align='flex-start'>
                                                <Box p='xs' bg='gray.0' style={{ borderRadius: '8px' }}>
                                                    <IconId size={18} color='#495057' />
                                                </Box>
                                                <Box flex={1}>
                                                    <Text size='sm' fw={500} c='dimmed' mb={2}>
                                                        Số CCCD
                                                    </Text>
                                                    <Text size='md' fw={600} c='dark'>
                                                        {patientData?.citizenId || 'Chưa có thông tin'}
                                                    </Text>
                                                </Box>
                                            </Group>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Group gap='md' align='flex-start'>
                                                <Box p='xs' bg='gray.0' style={{ borderRadius: '8px' }}>
                                                    <IconCalendarEvent size={18} color='#495057' />
                                                </Box>
                                                <Box flex={1}>
                                                    <Text size='sm' fw={500} c='dimmed' mb={2}>
                                                        Ngày sinh
                                                    </Text>
                                                    <Text size='md' fw={600} c='dark'>
                                                        {patientData?.dateOfBirth
                                                            ? new Date(patientData.dateOfBirth).toLocaleDateString(
                                                                  'vi-VN'
                                                              )
                                                            : 'Chưa có thông tin'}
                                                    </Text>
                                                </Box>
                                            </Group>
                                        </Grid.Col>

                                        {/* Personal Details Section */}
                                        <Grid.Col span={12} mt='lg'>
                                            <Text
                                                size='sm'
                                                fw={600}
                                                c='green'
                                                mb='md'
                                                tt='uppercase'
                                                style={{ letterSpacing: 0.5 }}
                                            >
                                                Thông tin cá nhân
                                            </Text>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Group gap='md' align='flex-start'>
                                                <Box p='xs' bg='gray.0' style={{ borderRadius: '8px' }}>
                                                    <IconGenderBigender size={18} color='#495057' />
                                                </Box>
                                                <Box flex={1}>
                                                    <Text size='sm' fw={500} c='dimmed' mb={2}>
                                                        Giới tính
                                                    </Text>
                                                    <Text size='md' fw={600} c='dark'>
                                                        {patientData?.gender || 'Chưa có thông tin'}
                                                    </Text>
                                                </Box>
                                            </Group>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Group gap='md' align='flex-start'>
                                                <Box p='xs' bg='gray.0' style={{ borderRadius: '8px' }}>
                                                    <IconUsers size={18} color='#495057' />
                                                </Box>
                                                <Box flex={1}>
                                                    <Text size='sm' fw={500} c='dimmed' mb={2}>
                                                        Dân tộc
                                                    </Text>
                                                    <Text size='md' fw={600} c='dark'>
                                                        {patientData?.ethnicity || 'Chưa có thông tin'}
                                                    </Text>
                                                </Box>
                                            </Group>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Group gap='md' align='flex-start'>
                                                <Box p='xs' bg='gray.0' style={{ borderRadius: '8px' }}>
                                                    <IconHeart size={18} color='#495057' />
                                                </Box>
                                                <Box flex={1}>
                                                    <Text size='sm' fw={500} c='dimmed' mb={2}>
                                                        Tình trạng hôn nhân
                                                    </Text>
                                                    <Text size='md' fw={600} c='dark'>
                                                        {patientData?.maritalStatus || 'Chưa có thông tin'}
                                                    </Text>
                                                </Box>
                                            </Group>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Group gap='md' align='flex-start'>
                                                <Box p='xs' bg='gray.0' style={{ borderRadius: '8px' }}>
                                                    <IconWorld size={18} color='#495057' />
                                                </Box>
                                                <Box flex={1}>
                                                    <Text size='sm' fw={500} c='dimmed' mb={2}>
                                                        Quốc gia
                                                    </Text>
                                                    <Text size='md' fw={600} c='dark'>
                                                        {patientData?.nation || 'Chưa có thông tin'}
                                                    </Text>
                                                </Box>
                                            </Group>
                                        </Grid.Col>

                                        {/* Contact Information Section */}
                                        <Grid.Col span={12} mt='lg'>
                                            <Text
                                                size='sm'
                                                fw={600}
                                                c='orange'
                                                mb='md'
                                                tt='uppercase'
                                                style={{ letterSpacing: 0.5 }}
                                            >
                                                Thông tin liên hệ
                                            </Text>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Group gap='md' align='flex-start'>
                                                <Box p='xs' bg='gray.0' style={{ borderRadius: '8px' }}>
                                                    <IconPhone size={18} color='#495057' />
                                                </Box>
                                                <Box flex={1}>
                                                    <Text size='sm' fw={500} c='dimmed' mb={2}>
                                                        Số điện thoại
                                                    </Text>
                                                    <Text size='md' fw={600} c='dark'>
                                                        {patientData?.phone || 'Chưa có thông tin'}
                                                    </Text>
                                                </Box>
                                            </Group>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Group gap='md' align='flex-start'>
                                                <Box p='xs' bg='gray.0' style={{ borderRadius: '8px' }}>
                                                    <IconMapPin size={18} color='#495057' />
                                                </Box>
                                                <Box flex={1}>
                                                    <Text size='sm' fw={500} c='dimmed' mb={2}>
                                                        Địa chỉ chính
                                                    </Text>
                                                    <Text size='md' fw={600} c='dark' style={{ lineHeight: 1.4 }}>
                                                        {patientData?.address1 || 'Chưa có thông tin'}
                                                    </Text>
                                                </Box>
                                            </Group>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Group gap='md' align='flex-start'>
                                                <Box p='xs' bg='gray.0' style={{ borderRadius: '8px' }}>
                                                    <IconMapPin size={18} color='#495057' />
                                                </Box>
                                                <Box flex={1}>
                                                    <Text size='sm' fw={500} c='dimmed' mb={2}>
                                                        Địa chỉ phụ
                                                    </Text>
                                                    <Text size='md' fw={600} c='dark' style={{ lineHeight: 1.4 }}>
                                                        {patientData?.address2 || 'Chưa có thông tin'}
                                                    </Text>
                                                </Box>
                                            </Group>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Group gap='md' align='flex-start'>
                                                <Box p='xs' bg='gray.0' style={{ borderRadius: '8px' }}>
                                                    <IconBriefcase size={18} color='#495057' />
                                                </Box>
                                                <Box flex={1}>
                                                    <Text size='sm' fw={500} c='dimmed' mb={2}>
                                                        Địa chỉ làm việc
                                                    </Text>
                                                    <Text size='md' fw={600} c='dark' style={{ lineHeight: 1.4 }}>
                                                        {patientData?.workAddress || 'Chưa có thông tin'}
                                                    </Text>
                                                </Box>
                                            </Group>
                                        </Grid.Col>
                                    </Grid>
                                </Box>
                            </Stack>
                        </Card>
                    </Grid.Col>

                    {/* Sessions List */}
                    {sessions.length > 0 && (
                        <Grid.Col span={5}>
                            <Card shadow='sm' padding='lg' withBorder h={715}>
                                <Stack gap='md' h='100%'>
                                    <Group justify='space-between' align='center'>
                                        <Text fw={600} size='lg'>
                                            Danh sách lần khám
                                        </Text>
                                        <Badge variant='light' color='blue'>
                                            {sessions.length} lần khám
                                        </Badge>
                                    </Group>

                                    <ScrollArea
                                        h='100%'
                                        scrollbarSize={8}
                                        scrollHideDelay={1000}
                                        type='scroll'
                                        offsetScrollbars
                                    >
                                        <Stack gap='md' pr='md'>
                                            {sessions.map((session: any, index: number) => (
                                                <Card
                                                    key={session.id}
                                                    shadow='sm'
                                                    padding='lg'
                                                    withBorder
                                                    style={{
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                                        }
                                                    }}
                                                    onClick={() => handleSessionClick(session.id)}
                                                >
                                                    <Group justify='space-between' align='flex-start'>
                                                        <Group align='flex-start'>
                                                            <Box
                                                                p='sm'
                                                                bg={
                                                                    session.typeLabSession === 'test'
                                                                        ? 'blue.0'
                                                                        : 'green.0'
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

                                                                <Group gap='md'>
                                                                    <Flex align='center' gap='xs'>
                                                                        <IconCalendarEvent size={14} />
                                                                        <Text size='sm' c='dimmed'>
                                                                            {new Date(
                                                                                session.createdAt
                                                                            ).toLocaleDateString('vi-VN')}
                                                                        </Text>
                                                                    </Flex>
                                                                    <Flex align='center' gap='xs'>
                                                                        <IconUser size={14} />
                                                                        <Text size='sm' c='dimmed'>
                                                                            {session.assignment?.doctor?.name ||
                                                                                'Chưa có bác sĩ'}
                                                                        </Text>
                                                                    </Flex>
                                                                    <Text size='sm' c='dimmed'>
                                                                        {session.patientFiles?.length || 0} file
                                                                    </Text>
                                                                </Group>
                                                            </div>
                                                        </Group>
                                                    </Group>
                                                </Card>
                                            ))}
                                        </Stack>
                                    </ScrollArea>
                                </Stack>
                            </Card>
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
