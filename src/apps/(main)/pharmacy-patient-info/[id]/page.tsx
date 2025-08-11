import { useParams, useNavigate } from 'react-router'
import {
    Container,
    Title,
    Card,
    Text,
    Stack,
    Group,
    Paper,
    ActionIcon,
    Badge,
    Flex,
    Box,
    Grid,
    Tooltip,
    Center,
    Loader,
    Tabs
} from '@mantine/core'
import { IconArrowLeft, IconUser, IconMedicalCross, IconFileText, IconTestPipe, IconPill } from '@tabler/icons-react'
import { usePatientById } from '@/services/hook/staff-patient-folder.hook'
import { notifications } from '@mantine/notifications'

const PharmacyPatientInfoPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const { data: patient, isLoading, error } = usePatientById(id!)

    const handleGoBack = () => {
        navigate('/patient-detail/' + id)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatFileSize = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        if (bytes === 0) return '0 Bytes'
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
    }

    const handleDownloadFile = (_url: string, filename: string) => {
        // This would be replaced with actual download logic
        notifications.show({
            title: 'Tải xuống',
            message: `Đang tải xuống ${filename}`,
            color: 'blue'
        })
    }

    if (isLoading) {
        return (
            <Container size='xl' py='xl'>
                <Center p='xl'>
                    <Loader size='lg' />
                </Center>
            </Container>
        )
    }

    if (error || !patient) {
        return (
            <Container size='xl' py='xl'>
                <Paper p='xl' ta='center'>
                    <Title order={4} c='dimmed'>
                        Không tìm thấy thông tin bệnh nhân phòng khám
                    </Title>
                </Paper>
            </Container>
        )
    }

    // Check if clinic information exists
    const hasClinicInfo = patient.allergiesInfo || patient.medicalRecord || patient.appointment

    if (!hasClinicInfo) {
        return (
            <Container size='xl' py='xl'>
                <Stack gap='lg'>
                    {/* Header */}
                    <Paper p='lg' radius='lg' bg='gradient-to-r from-blue-50 to-indigo-50' withBorder>
                        <Group justify='space-between'>
                            <Group>
                                <Tooltip label='Quay lại'>
                                    <ActionIcon
                                        variant='gradient'
                                        gradient={{ from: 'blue', to: 'cyan' }}
                                        size='xl'
                                        radius='lg'
                                        onClick={handleGoBack}
                                    >
                                        <IconArrowLeft size={20} />
                                    </ActionIcon>
                                </Tooltip>
                                <Box>
                                    <Title order={2} c='dark'>
                                        {patient.fullName}
                                    </Title>
                                    <Text c='dimmed' size='sm' mt={4}>
                                        CCCD: {patient.citizenId}
                                    </Text>
                                    <Badge color='blue' variant='light' mt={8}>
                                        Bệnh nhân phòng khám
                                    </Badge>
                                </Box>
                            </Group>
                        </Group>
                    </Paper>

                    <Paper p='xl' ta='center' withBorder>
                        <Text size='lg' fw={600} mt='md'>
                            Hiện tại chưa có thông tin phòng khám
                        </Text>
                        <Text size='sm' c='dimmed' mt='xs'>
                            Bệnh nhân chưa có dữ liệu từ hệ thống phòng khám
                        </Text>
                    </Paper>
                </Stack>
            </Container>
        )
    }

    return (
        <Container size='xl' py='xl'>
            <Stack gap='lg'>
                {/* Header */}
                <Paper p='lg' radius='lg' bg='gradient-to-r from-blue-50 to-indigo-50' withBorder>
                    <Group justify='space-between'>
                        <Group>
                            <Tooltip label='Quay lại'>
                                <ActionIcon
                                    variant='gradient'
                                    gradient={{ from: 'blue', to: 'cyan' }}
                                    size='xl'
                                    radius='lg'
                                    onClick={handleGoBack}
                                >
                                    <IconArrowLeft size={20} />
                                </ActionIcon>
                            </Tooltip>
                            <Box>
                                <Title order={2} c='dark'>
                                    {patient.fullName}
                                </Title>
                                <Text c='dimmed' size='sm' mt={4}>
                                    CCCD: {patient.citizenId}
                                </Text>
                                <Badge color='blue' variant='light' mt={8}>
                                    Bệnh nhân phòng khám
                                </Badge>
                            </Box>
                        </Group>
                    </Group>
                </Paper>

                <Tabs defaultValue="patient-info" variant="pills" radius="md">
                    <Tabs.List grow>
                        <Tabs.Tab value="patient-info" leftSection={<IconUser size={16} />}>
                            Thông tin cá nhân
                        </Tabs.Tab>
                        {patient.medicalRecord && (
                            <Tabs.Tab value="medical-record" leftSection={<IconFileText size={16} />}>
                                Hồ sơ khám bệnh
                            </Tabs.Tab>
                        )}
                        {patient.medicalRecord?.lab_test && patient.medicalRecord.lab_test.length > 0 && (
                            <Tabs.Tab value="lab-tests" leftSection={<IconTestPipe size={16} />}>
                                Kết quả xét nghiệm
                            </Tabs.Tab>
                        )}
                        {patient.medicalRecord?.prescription && (
                            <Tabs.Tab value="prescription" leftSection={<IconPill size={16} />}>
                                Đơn thuốc
                            </Tabs.Tab>
                        )}
                    </Tabs.List>

                    <Tabs.Panel value="patient-info" pt="lg">
                        <Grid>
                            {/* Patient Information */}
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Card shadow='sm' padding='lg' radius='md' withBorder>
                                    <Group mb='md'>
                                        <IconUser size={24} color='var(--mantine-color-blue-6)' />
                                        <Text fw={600} size='lg'>
                                            Thông tin bệnh nhân
                                        </Text>
                                    </Group>
                                    <Stack gap='sm'>
                                        <Group justify='space-between'>
                                            <Text size='sm' c='dimmed'>
                                                Họ và tên:
                                            </Text>
                                            <Text size='sm' fw={500}>
                                                {patient.fullName}
                                            </Text>
                                        </Group>
                                        <Group justify='space-between'>
                                            <Text size='sm' c='dimmed'>
                                                Giới tính:
                                            </Text>
                                            <Badge size='sm' variant='light' color='cyan'>
                                                {patient.gender || 'Không xác định'}
                                            </Badge>
                                        </Group>
                                        <Group justify='space-between'>
                                            <Text size='sm' c='dimmed'>
                                                Ngày sinh:
                                            </Text>
                                            <Text size='sm' fw={500}>
                                                {patient.dateOfBirth
                                                    ? new Date(patient.dateOfBirth).toLocaleDateString('vi-VN')
                                                    : 'Chưa có thông tin'}
                                            </Text>
                                        </Group>
                                        <Group justify='space-between'>
                                            <Text size='sm' c='dimmed'>
                                                Dân tộc:
                                            </Text>
                                            <Text size='sm' fw={500}>
                                                {patient.ethnicity || 'Chưa có thông tin'}
                                            </Text>
                                        </Group>
                                        <Group justify='space-between'>
                                            <Text size='sm' c='dimmed'>
                                                Quốc tịch:
                                            </Text>
                                            <Text size='sm' fw={500}>
                                                {patient.nation || 'Chưa có thông tin'}
                                            </Text>
                                        </Group>
                                        <Group justify='space-between'>
                                            <Text size='sm' c='dimmed'>
                                                Tình trạng hôn nhân:
                                            </Text>
                                            <Text size='sm' fw={500}>
                                                {patient.maritalStatus || 'Chưa có thông tin'}
                                            </Text>
                                        </Group>
                                        {patient.phone && (
                                            <Group justify='space-between'>
                                                <Text size='sm' c='dimmed'>
                                                    Điện thoại:
                                                </Text>
                                                <Text size='sm' fw={500}>
                                                    {patient.phone}
                                                </Text>
                                            </Group>
                                        )}
                                        {(patient.address1 || patient.address2) && (
                                            <Group justify='space-between' align='flex-start'>
                                                <Text size='sm' c='dimmed'>
                                                    Địa chỉ:
                                                </Text>
                                                <Text size='sm' fw={500} ta='right' style={{ maxWidth: '60%' }}>
                                                    {[patient.address1, patient.address2].filter(Boolean).join(', ')}
                                                </Text>
                                            </Group>
                                        )}
                                        {patient.workAddress && (
                                            <Group justify='space-between' align='flex-start'>
                                                <Text size='sm' c='dimmed'>
                                                    Địa chỉ làm việc:
                                                </Text>
                                                <Text size='sm' fw={500} ta='right' style={{ maxWidth: '60%' }}>
                                                    {patient.workAddress}
                                                </Text>
                                            </Group>
                                        )}
                                    </Stack>
                                </Card>
                            </Grid.Col>

                            {/* Medical History */}
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Card shadow='sm' padding='lg' radius='md' withBorder>
                                    <Group mb='md'>
                                        <IconMedicalCross size={24} color='var(--mantine-color-red-6)' />
                                        <Text fw={600} size='lg'>
                                            Tiền sử bệnh
                                        </Text>
                                    </Group>
                                    <Stack gap='sm'>
                                        {patient.allergiesInfo?.allergies && (
                                            <Box>
                                                <Text size='sm' c='dimmed' mb={4}>
                                                    Dị ứng:
                                                </Text>
                                                <Text size='sm' fw={500}>
                                                    {patient.allergiesInfo.allergies}
                                                </Text>
                                            </Box>
                                        )}
                                        {patient.allergiesInfo?.personal_history && (
                                            <Box>
                                                <Text size='sm' c='dimmed' mb={4}>
                                                    Tiền sử cá nhân:
                                                </Text>
                                                <Text size='sm' fw={500}>
                                                    {patient.allergiesInfo.personal_history}
                                                </Text>
                                            </Box>
                                        )}
                                        {patient.allergiesInfo?.family_history && (
                                            <Box>
                                                <Text size='sm' c='dimmed' mb={4}>
                                                    Tiền sử gia đình:
                                                </Text>
                                                <Text size='sm' fw={500}>
                                                    {patient.allergiesInfo.family_history}
                                                </Text>
                                            </Box>
                                        )}
                                        {!patient.allergiesInfo && (
                                            <Text size='sm' c='dimmed' ta='center' py='md'>
                                                Không có thông tin tiền sử bệnh
                                            </Text>
                                        )}
                                    </Stack>
                                </Card>
                            </Grid.Col>
                        </Grid>
                    </Tabs.Panel>

                    {patient.medicalRecord && (
                        <Tabs.Panel value="medical-record" pt="lg">
                            <Card shadow='sm' padding='lg' radius='md' withBorder>
                                <Group mb='md'>
                                    <IconFileText size={24} />
                                    <Text fw={600} size='lg'>
                                        Hồ sơ khám bệnh
                                    </Text>
                                </Group>
                                <Stack gap='md'>
                                    {patient.medicalRecord.start_at && (
                                        <Group>
                                            <Text size='sm' c='dimmed'>
                                                Bắt đầu khám:
                                            </Text>
                                            <Badge variant='light' color='blue'>
                                                {formatDate(patient.medicalRecord.start_at)}
                                            </Badge>
                                        </Group>
                                    )}
                                    {patient.medicalRecord.reason && (
                                        <Group align='flex-start'>
                                            <Text size='sm' c='dimmed' style={{ minWidth: '100px' }}>
                                                Lý do khám:
                                            </Text>
                                            <Text size='sm' fw={500}>
                                                {patient.medicalRecord.reason}
                                            </Text>
                                        </Group>
                                    )}
                                    {patient.medicalRecord.diagnoses && (
                                        <Group align='flex-start'>
                                            <Text size='sm' c='dimmed' style={{ minWidth: '100px' }}>
                                                Chẩn đoán:
                                            </Text>
                                            <Text size='sm' fw={500}>
                                                {patient.medicalRecord.diagnoses}
                                            </Text>
                                        </Group>
                                    )}
                                    {patient.medicalRecord.treatment && (
                                        <Group align='flex-start'>
                                            <Text size='sm' c='dimmed' style={{ minWidth: '100px' }}>
                                                Điều trị:
                                            </Text>
                                            <Text size='sm' fw={500}>
                                                {patient.medicalRecord.treatment}
                                            </Text>
                                        </Group>
                                    )}
                                    {patient.medicalRecord.current_status && (
                                        <Group align='flex-start'>
                                            <Text size='sm' c='dimmed' style={{ minWidth: '100px' }}>
                                                Tình trạng hiện tại:
                                            </Text>
                                            <Badge variant='light' color='orange'>
                                                {patient.medicalRecord.current_status}
                                            </Badge>
                                        </Group>
                                    )}
                                    {patient.medicalRecord.doctor && (
                                        <Box>
                                            <Text size='sm' c='dimmed' mb={4}>
                                                Bác sĩ phụ trách:
                                            </Text>
                                            <Paper p='sm' bg='gray.0' radius='md'>
                                                <Text size='sm' fw={600}>
                                                    {patient.medicalRecord.doctor.name}
                                                </Text>
                                                <Text size='xs' c='dimmed'>
                                                    {patient.medicalRecord.doctor.email} •{' '}
                                                    {patient.medicalRecord.doctor.phone}
                                                </Text>
                                                {patient.medicalRecord.doctor.address && (
                                                    <Text size='xs' c='dimmed'>
                                                        {patient.medicalRecord.doctor.address}
                                                    </Text>
                                                )}
                                            </Paper>
                                        </Box>
                                    )}
                                </Stack>
                            </Card>
                        </Tabs.Panel>
                    )}

                    {patient.medicalRecord?.lab_test && patient.medicalRecord.lab_test.length > 0 && (
                        <Tabs.Panel value="lab-tests" pt="lg">
                            <Card shadow='sm' padding='lg' radius='md' withBorder>
                                <Group mb='md'>
                                    <IconTestPipe size={24} color='var(--mantine-color-orange-6)' />
                                    <Text fw={600} size='lg'>
                                        Kết quả xét nghiệm
                                    </Text>
                                </Group>
                                <Stack gap='md'>
                                    {patient.medicalRecord.lab_test.map((test: any, index: number) => (
                                        <Paper key={index} p='md' withBorder radius='md'>
                                            <Stack gap='sm'>
                                                <Group justify='space-between'>
                                                    <Text fw={600} size='md'>
                                                        {test.test_name}
                                                    </Text>
                                                    <Badge variant='light' color='orange'>
                                                        {test.test_type}
                                                    </Badge>
                                                </Group>
                                                {test.machine && (
                                                    <Text size='sm' c='dimmed'>
                                                        Máy: {test.machine}
                                                    </Text>
                                                )}
                                                {test.taken_by && (
                                                    <Text size='sm' c='dimmed'>
                                                        Thực hiện bởi: {test.taken_by.name}
                                                    </Text>
                                                )}
                                                {test.conclusion && (
                                                    <Text size='sm'>
                                                        <strong>Kết luận:</strong> {test.conclusion}
                                                    </Text>
                                                )}
                                                {test.notes && (
                                                    <Text size='sm' c='dimmed'>
                                                        Ghi chú: {test.notes}
                                                    </Text>
                                                )}
                                                {test.file_attachments && test.file_attachments.length > 0 && (
                                                    <Box>
                                                        <Text size='sm' fw={500} mb='xs'>
                                                            File đính kèm:
                                                        </Text>
                                                        <Stack gap='xs'>
                                                            {test.file_attachments.map(
                                                                (file: any, fileIndex: number) => (
                                                                    <Paper
                                                                        key={fileIndex}
                                                                        p='xs'
                                                                        bg='gray.0'
                                                                        radius='sm'
                                                                        style={{ cursor: 'pointer' }}
                                                                        onClick={() =>
                                                                            handleDownloadFile(file.url, file.filename)
                                                                        }
                                                                    >
                                                                        <Flex justify='space-between' align='center'>
                                                                            <Text size='xs'>{file.filename}</Text>
                                                                            <Text size='xs' c='dimmed'>
                                                                                {formatFileSize(file.file_size)}
                                                                            </Text>
                                                                        </Flex>
                                                                    </Paper>
                                                                )
                                                            )}
                                                        </Stack>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Card>
                        </Tabs.Panel>
                    )}

                    {patient.medicalRecord?.prescription && (
                        <Tabs.Panel value="prescription" pt="lg">
                            <Card shadow='sm' padding='lg' radius='md' withBorder>
                                <Group mb='md'>
                                    <IconPill size={24} color='var(--mantine-color-teal-6)' />
                                    <Text fw={600} size='lg'>
                                        Đơn thuốc
                                    </Text>
                                </Group>
                                <Stack gap='md'>
                                    {patient.medicalRecord.prescription.issuedDate && (
                                        <Group>
                                            <Text size='sm' c='dimmed'>
                                                Ngày kê đơn:
                                            </Text>
                                            <Badge variant='light' color='teal'>
                                                {formatDate(patient.medicalRecord.prescription.issuedDate)}
                                            </Badge>
                                        </Group>
                                    )}

                                    {patient.medicalRecord.prescription.medications &&
                                        patient.medicalRecord.prescription.medications.length > 0 && (
                                            <Box>
                                                <Text size='sm' fw={500} mb='sm'>
                                                    Danh sách thuốc:
                                                </Text>
                                                <Stack gap='sm'>
                                                    {patient.medicalRecord.prescription.medications.map(
                                                        (med: any, index: number) => (
                                                            <Paper key={index} p='sm' withBorder radius='md'>
                                                                <Grid>
                                                                    <Grid.Col span={6}>
                                                                        <Text fw={600} size='sm'>
                                                                            {med.name}
                                                                        </Text>
                                                                        <Text size='xs' c='dimmed'>
                                                                            {med.route} • {med.dosage}
                                                                        </Text>
                                                                    </Grid.Col>
                                                                    <Grid.Col span={3}>
                                                                        <Text size='xs' c='dimmed'>
                                                                            Tần suất: {med.frequency}
                                                                        </Text>
                                                                        <Text size='xs' c='dimmed'>
                                                                            Thời gian: {med.duration}
                                                                        </Text>
                                                                    </Grid.Col>
                                                                    <Grid.Col span={3}>
                                                                        <Text size='xs' c='dimmed'>
                                                                            Số lượng: {med.quantity}
                                                                        </Text>
                                                                    </Grid.Col>
                                                                    {med.instruction && (
                                                                        <Grid.Col span={12}>
                                                                            <Text size='xs' c='blue'>
                                                                                Hướng dẫn: {med.instruction}
                                                                            </Text>
                                                                        </Grid.Col>
                                                                    )}
                                                                </Grid>
                                                            </Paper>
                                                        )
                                                    )}
                                                </Stack>
                                            </Box>
                                        )}

                                    {patient.medicalRecord.prescription.notes && (
                                        <Box>
                                            <Text size='sm' fw={500} mb={4}>
                                                Ghi chú:
                                            </Text>
                                            <Paper p='sm' bg='yellow.0' radius='md'>
                                                <Text size='sm'>{patient.medicalRecord.prescription.notes}</Text>
                                            </Paper>
                                        </Box>
                                    )}
                                </Stack>
                            </Card>
                        </Tabs.Panel>
                    )}
                </Tabs>
            </Stack>
        </Container>
    )
}

export default PharmacyPatientInfoPage
