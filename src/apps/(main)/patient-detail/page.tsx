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
    ScrollArea,
    Tabs
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
    IconUsers,
    IconHeart,
    IconGenderBigender,
    IconWorld,
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
                Xét nghiệm gen
            </Badge>
        )
    } else {
        return (
            <Badge color='green' variant='light' size='sm'>
                Kết quả xét nghiệm
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

    // Filter sessions by type
    const testSessions = sessions.filter((session: any) => session.typeLabSession === 'test')
    const resultTestSessions = sessions.filter((session: any) => session.typeLabSession === 'result_test')

    const handleBack = () => {
        navigate('/patient-folder')
    }

    const handleImport = () => {
        navigate('/import-file/input', {
            state: { patientId: id }
        })
    }

    const handleUploadTestResults = () => {
        navigate('/import-file/input', {
            state: {
                patientId: id,
                typeLabSession: 'result_test',
                skipOCR: true,
                bypassPrescriptionCheck: true
            }
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
                    <Group>
                        <Button leftSection={<IconPlus size={16} />} onClick={handleUploadTestResults}>
                            Tải lên kết quả xét nghiệm
                        </Button>

                        <Button leftSection={<IconPlus size={16} />} onClick={handleImport}>
                            Tạo lần khám mới
                        </Button>
                    </Group>
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
                                        Xét nghiệm gen
                                    </Text>
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <Group gap='xs' justify='center' mb='xs'>
                                        <IconClipboardCheck size={20} color='#2f9e44' />
                                        <Text fw={700} size='lg' c='green'>
                                            {
                                                sessions.filter(
                                                    (session: any) => session.typeLabSession === 'result_test'
                                                ).length
                                            }
                                        </Text>
                                    </Group>
                                    <Text size='sm' c='dimmed' fw={500}>
                                        Kết quả xét nghiệm
                                    </Text>
                                </div>
                            </Group>
                        </Group>
                    </Card>
                )}

                <Grid>
                    {/* Patient Information */}
                    <Grid.Col span={sessions.length > 0 ? 6 : 6}>
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
                                    </Grid>
                                </Box>
                            </Stack>
                        </Card>
                    </Grid.Col>

                    {/* Empty State for No Sessions - positioned alongside patient info */}
                    {sessions.length === 0 && (
                        <Grid.Col span={6}>
                            <Card
                                shadow='sm'
                                padding='xl'
                                withBorder
                                h='100%'
                                style={{
                                    background: 'linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%)',
                                    borderColor: '#e1e5e9'
                                }}
                            >
                                <Stack justify='center' align='center' h='100%' gap='lg'>
                                    <Box
                                        p='xl'
                                        style={{
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #4c6ef5 0%, #364fc7 100%)',
                                            boxShadow: '0 8px 25px rgba(76, 110, 245, 0.3)'
                                        }}
                                    >
                                        <IconStethoscope size={48} color='white' />
                                    </Box>

                                    <Stack align='center' gap='md'>
                                        <Text size='xl' fw={700} c='dark' ta='center'>
                                            Chưa có lần khám nào
                                        </Text>
                                        <Text
                                            size='md'
                                            c='dimmed'
                                            ta='center'
                                            style={{ maxWidth: '380px', lineHeight: 1.6 }}
                                        >
                                            Bệnh nhân chưa có lịch sử khám bệnh hoặc kết quả xét nghiệm.
                                        </Text>
                                    </Stack>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    )}

                    {/* Sessions List with Tabs */}
                    {sessions.length > 0 && (
                        <Grid.Col span={6}>
                            <Card shadow='sm' padding='lg' withBorder h='519'>
                                <Tabs
                                    defaultValue={testSessions.length > 0 ? 'test' : 'result_test'}
                                    orientation='horizontal'
                                >
                                    <Tabs.List>
                                        {testSessions.length > 0 && (
                                            <Tabs.Tab
                                                value='test'
                                                leftSection={<IconMicroscope size={16} />}
                                                rightSection={
                                                    <Badge variant='light' color='blue' size='sm'>
                                                        {testSessions.length}
                                                    </Badge>
                                                }
                                            >
                                                Lần khám
                                            </Tabs.Tab>
                                        )}
                                        {resultTestSessions.length > 0 && (
                                            <Tabs.Tab
                                                value='result_test'
                                                leftSection={<IconClipboardCheck size={16} />}
                                                rightSection={
                                                    <Badge variant='light' color='green' size='sm'>
                                                        {resultTestSessions.length}
                                                    </Badge>
                                                }
                                            >
                                                Kết quả xét nghiệm
                                            </Tabs.Tab>
                                        )}
                                    </Tabs.List>

                                    {/* Test Sessions Panel */}
                                    {testSessions.length > 0 && (
                                        <Tabs.Panel value='test' pt='md'>
                                            <ScrollArea
                                                h={450}
                                                scrollbarSize={8}
                                                scrollHideDelay={1000}
                                                type='scroll'
                                                offsetScrollbars
                                            >
                                                <Stack gap='md' pr='md'>
                                                    {testSessions.map((session: any, index: number) => (
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
                                                                        bg='blue.0'
                                                                        style={{ borderRadius: '8px' }}
                                                                    >
                                                                        {getSessionTypeIcon(session.typeLabSession)}
                                                                    </Box>

                                                                    <div>
                                                                        <Group gap='sm' mb='xs'>
                                                                            <Text fw={600} size='lg'>
                                                                                Lần {index + 1}
                                                                            </Text>
                                                                            {getSessionTypeBadge(
                                                                                session.typeLabSession
                                                                            )}
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
                                                                                    {session.labcodes[0]?.assignment
                                                                                        ?.doctor?.name ||
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
                                        </Tabs.Panel>
                                    )}

                                    {/* Result Test Sessions Panel */}
                                    {resultTestSessions.length > 0 && (
                                        <Tabs.Panel value='result_test' pt='md'>
                                            <ScrollArea
                                                h={400}
                                                scrollbarSize={8}
                                                scrollHideDelay={1000}
                                                type='scroll'
                                                offsetScrollbars
                                            >
                                                <Stack gap='md' pr='md'>
                                                    {resultTestSessions.map((session: any, index: number) => (
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
                                                                        bg='green.0'
                                                                        style={{ borderRadius: '8px' }}
                                                                    >
                                                                        {getSessionTypeIcon(session.typeLabSession)}
                                                                    </Box>

                                                                    <div>
                                                                        <Group gap='sm' mb='xs'>
                                                                            <Text fw={600} size='lg'>
                                                                                Kết quả {index + 1}
                                                                            </Text>
                                                                            {getSessionTypeBadge(
                                                                                session.typeLabSession
                                                                            )}
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
                                                                                    {session.labcodes[0]?.assignment
                                                                                        ?.doctor?.name ||
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
                                        </Tabs.Panel>
                                    )}
                                </Tabs>
                            </Card>
                        </Grid.Col>
                    )}
                </Grid>
            </Stack>
        </Container>
    )
}

export default PatientDetailPage
