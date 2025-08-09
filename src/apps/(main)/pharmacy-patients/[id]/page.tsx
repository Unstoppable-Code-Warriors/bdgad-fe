import { useParams, useNavigate } from 'react-router'
import {
    Container,
    Stack,
    Group,
    Text,
    Grid,
    Card,
    Badge,
    Paper,
    Box,
    Title,
    ActionIcon,
    Tooltip,
    Center,
    Loader
} from '@mantine/core'
import {
    IconArrowLeft,
    IconUser,
    IconPhone,
    IconStethoscope,
    IconPill,
    IconFileText,
    IconTestPipe,
    IconDownload,
    IconMedicalCross
} from '@tabler/icons-react'
import { usePharmacyPatientById } from '@/services/hook/pharmacy.hook'
import { notifications } from '@mantine/notifications'

const PharmacyPatientDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    // Get specific patient by ID
    const { data, isLoading } = usePharmacyPatientById(id || '')
    console.log('patientResponse pharmacy', data)

    const patient = data

    const handleGoBack = () => {
        navigate('/pharmacy-patients')
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

    if (!patient) {
        return (
            <Container size='xl' py='xl'>
                <Paper p='xl' ta='center'>
                    <Title order={4} c='dimmed'>
                        Không tìm thấy thông tin bệnh nhân
                    </Title>
                </Paper>
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
                                    {patient.patientFullname}
                                </Title>
                                <Text c='dimmed' size='sm' mt={4}>
                                    Mã định danh: {patient.citizenId}
                                </Text>
                                <Badge color='blue' variant='light' mt={8}>
                                    Bệnh nhân phòng khám
                                </Badge>
                            </Box>
                        </Group>
                    </Group>
                </Paper>

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
                                        {patient.patient.fullname}
                                    </Text>
                                </Group>
                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Giới tính:
                                    </Text>
                                    <Badge size='sm' variant='light' color='cyan'>
                                        {patient.patient.gender || 'Không xác định'}
                                    </Badge>
                                </Group>
                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Ngày sinh:
                                    </Text>
                                    <Text size='sm' fw={500}>
                                        {patient.patient.date_of_birth
                                            ? new Date(patient.patient.date_of_birth).toLocaleDateString('vi-VN')
                                            : 'Không có thông tin'}
                                    </Text>
                                </Group>
                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Dân tộc:
                                    </Text>
                                    <Text size='sm' fw={500}>
                                        {patient.patient.ethnicity || 'Không có thông tin'}
                                    </Text>
                                </Group>
                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Quốc tịch:
                                    </Text>
                                    <Text size='sm' fw={500}>
                                        {patient.patient.nation || 'Không có thông tin'}
                                    </Text>
                                </Group>
                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Tình trạng hôn nhân:
                                    </Text>
                                    <Text size='sm' fw={500}>
                                        {patient.patient.marital_status || 'Không có thông tin'}
                                    </Text>
                                </Group>
                                {patient.patient.phone && (
                                    <Group justify='space-between'>
                                        <Text size='sm' c='dimmed'>
                                            Số điện thoại:
                                        </Text>
                                        <Group gap='xs'>
                                            <IconPhone size={16} />
                                            <Text size='sm' fw={500}>
                                                {patient.patient.phone}
                                            </Text>
                                        </Group>
                                    </Group>
                                )}
                                {(patient.patient.address1 || patient.patient.address2) && (
                                    <Group justify='space-between' align='flex-start'>
                                        <Text size='sm' c='dimmed'>
                                            Địa chỉ:
                                        </Text>
                                        <Box style={{ textAlign: 'right', maxWidth: '200px' }}>
                                            <Text size='sm' fw={500}>
                                                {patient.patient.address1}
                                            </Text>
                                            {patient.patient.address2 && (
                                                <Text size='sm' fw={500}>
                                                    {patient.patient.address2}
                                                </Text>
                                            )}
                                        </Box>
                                    </Group>
                                )}
                                {patient.patient.work_address && (
                                    <Group justify='space-between' align='flex-start'>
                                        <Text size='sm' c='dimmed'>
                                            Nơi làm việc:
                                        </Text>
                                        <Text size='sm' fw={500} style={{ textAlign: 'right', maxWidth: '200px' }}>
                                            {patient.patient.work_address}
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
                                {patient.patient.allergies && (
                                    <Box>
                                        <Text size='sm' c='dimmed' fw={500}>
                                            Dị ứng:
                                        </Text>
                                        <Text size='sm' mt={4}>
                                            {patient.patient.allergies}
                                        </Text>
                                    </Box>
                                )}
                                {patient.patient.personal_history && (
                                    <Box>
                                        <Text size='sm' c='dimmed' fw={500}>
                                            Tiền sử cá nhân:
                                        </Text>
                                        <Text size='sm' mt={4}>
                                            {patient.patient.personal_history}
                                        </Text>
                                    </Box>
                                )}
                                {patient.patient.family_history && (
                                    <Box>
                                        <Text size='sm' c='dimmed' fw={500}>
                                            Tiền sử gia đình:
                                        </Text>
                                        <Text size='sm' mt={4}>
                                            {patient.patient.family_history}
                                        </Text>
                                    </Box>
                                )}
                                {!patient.patient.allergies &&
                                    !patient.patient.personal_history &&
                                    !patient.patient.family_history && (
                                        <Text size='sm' c='dimmed' ta='center' py='md'>
                                            Không có thông tin tiền sử bệnh
                                        </Text>
                                    )}
                            </Stack>
                        </Card>
                    </Grid.Col>

                    {/* Appointment Information */}
                    {/* <Grid.Col span={{ base: 12 }}>
                        <Card shadow='sm' padding='lg' radius='md' withBorder>
                            <Group mb='md'>
                                <IconCalendar size={24} color='var(--mantine-color-green-6)' />
                                <Text fw={600} size='lg'>
                                    Thông tin cuộc hẹn
                                </Text>
                            </Group>
                            <Group>
                                <Text size='sm' c='dimmed'>
                                    Ngày giờ hẹn:
                                </Text>
                                <Badge size='lg' variant='light' color='green'>
                                    {formatDate(patient.appointment.date)}
                                </Badge>
                                <Text size='sm' c='dimmed'>
                                    ID cuộc hẹn:
                                </Text>
                                <Text size='sm' fw={500} style={{ fontFamily: 'monospace' }}>
                                    {patient.appointment.id}
                                </Text>
                            </Group>
                        </Card>
                    </Grid.Col> */}

                    {/* Medical Record */}
                    <Grid.Col span={{ base: 12 }}>
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
                                        <Text size='sm' c='dimmed' w={120}>
                                            Thời gian bắt đầu:
                                        </Text>
                                        <Text size='sm' fw={500}>
                                            {formatDate(patient.medicalRecord.start_at)}
                                        </Text>
                                    </Group>
                                )}
                                {patient.medicalRecord.reason && (
                                    <Group align='flex-start'>
                                        <Text size='sm' c='dimmed' w={120}>
                                            Lý do khám:
                                        </Text>
                                        <Text size='sm' fw={500}>
                                            {patient.medicalRecord.reason}
                                        </Text>
                                    </Group>
                                )}
                                {patient.medicalRecord.diagnoses && (
                                    <Group align='flex-start'>
                                        <Text size='sm' c='dimmed' w={120}>
                                            Chẩn đoán:
                                        </Text>
                                        <Text size='sm' fw={500}>
                                            {patient.medicalRecord.diagnoses}
                                        </Text>
                                    </Group>
                                )}
                                {patient.medicalRecord.treatment && (
                                    <Group align='flex-start'>
                                        <Text size='sm' c='dimmed' w={120}>
                                            Điều trị:
                                        </Text>
                                        <Text size='sm' fw={500}>
                                            {patient.medicalRecord.treatment}
                                        </Text>
                                    </Group>
                                )}
                                {patient.medicalRecord.current_status && (
                                    <Group align='flex-start'>
                                        <Text size='sm' c='dimmed' w={120}>
                                            Tình trạng hiện tại:
                                        </Text>
                                        <Badge variant='light' color='blue'>
                                            {patient.medicalRecord.current_status}
                                        </Badge>
                                    </Group>
                                )}
                                {patient.medicalRecord.doctor && (
                                    <Box>
                                        <Text size='sm' c='dimmed' fw={500} mb={8}>
                                            Bác sĩ điều trị:
                                        </Text>
                                        <Paper p='sm' bg='gray.0' radius='md'>
                                            <Group>
                                                <IconStethoscope size={20} color='var(--mantine-color-blue-6)' />
                                                <Box>
                                                    <Text size='sm' fw={600}>
                                                        {patient.medicalRecord.doctor.name}
                                                    </Text>
                                                    <Text size='xs' c='dimmed'>
                                                        {patient.medicalRecord.doctor.email}
                                                    </Text>
                                                    {patient.medicalRecord.doctor.phone && (
                                                        <Text size='xs' c='dimmed'>
                                                            SĐT: {patient.medicalRecord.doctor.phone}
                                                        </Text>
                                                    )}
                                                </Box>
                                            </Group>
                                        </Paper>
                                    </Box>
                                )}
                            </Stack>
                        </Card>
                    </Grid.Col>

                    {/* Lab Tests */}
                    {patient.medicalRecord.lab_test && patient.medicalRecord.lab_test.length > 0 && (
                        <Grid.Col span={{ base: 12 }}>
                            <Card shadow='sm' padding='lg' radius='md' withBorder>
                                <Group mb='md'>
                                    <IconTestPipe size={24} color='var(--mantine-color-orange-6)' />
                                    <Text fw={600} size='lg'>
                                        Kết quả xét nghiệm
                                    </Text>
                                </Group>
                                <Stack gap='md'>
                                    {patient.medicalRecord.lab_test.map((test, index) => (
                                        <Paper key={index} p='md' bg='gray.0' radius='md' withBorder>
                                            <Stack gap='sm'>
                                                <Group justify='space-between'>
                                                    <Text fw={600} size='sm'>
                                                        {test.test_name}
                                                    </Text>
                                                    {test.test_type && (
                                                        <Badge size='sm' variant='light' color='orange'>
                                                            {test.test_type}
                                                        </Badge>
                                                    )}
                                                </Group>
                                                {test.machine && (
                                                    <Text size='xs' c='dimmed'>
                                                        Máy: {test.machine}
                                                    </Text>
                                                )}
                                                {test.taken_by && (
                                                    <Text size='xs' c='dimmed'>
                                                        Thực hiện bởi: {test.taken_by.name}
                                                    </Text>
                                                )}
                                                {test.conclusion && (
                                                    <Box>
                                                        <Text size='sm' fw={500} c='dark'>
                                                            Kết luận:
                                                        </Text>
                                                        <Text size='sm' mt={4}>
                                                            {test.conclusion}
                                                        </Text>
                                                    </Box>
                                                )}
                                                {test.notes && (
                                                    <Box>
                                                        <Text size='sm' fw={500} c='dark'>
                                                            Ghi chú:
                                                        </Text>
                                                        <Text size='sm' mt={4}>
                                                            {test.notes}
                                                        </Text>
                                                    </Box>
                                                )}
                                                {test.file_attachments && test.file_attachments.length > 0 && (
                                                    <Box>
                                                        <Text size='sm' fw={500} c='dark' mb={8}>
                                                            Tệp đính kèm:
                                                        </Text>
                                                        <Stack gap='xs'>
                                                            {test.file_attachments.map((file, fileIndex) => (
                                                                <Paper
                                                                    key={fileIndex}
                                                                    p='xs'
                                                                    bg='white'
                                                                    radius='sm'
                                                                    withBorder
                                                                >
                                                                    <Group justify='space-between'>
                                                                        <Box>
                                                                            <Text size='xs' fw={500}>
                                                                                {file.filename}
                                                                            </Text>
                                                                            <Text size='xs' c='dimmed'>
                                                                                {file.file_type} •{' '}
                                                                                {formatFileSize(file.file_size)}
                                                                            </Text>
                                                                        </Box>
                                                                        <ActionIcon
                                                                            size='sm'
                                                                            variant='light'
                                                                            color='blue'
                                                                            onClick={() =>
                                                                                handleDownloadFile(
                                                                                    file.url,
                                                                                    file.filename
                                                                                )
                                                                            }
                                                                        >
                                                                            <IconDownload size={14} />
                                                                        </ActionIcon>
                                                                    </Group>
                                                                </Paper>
                                                            ))}
                                                        </Stack>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Card>
                        </Grid.Col>
                    )}

                    {/* Prescription */}
                    {patient.medicalRecord.prescription && (
                        <Grid.Col span={{ base: 12 }}>
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
                                            <Text size='sm' fw={500}>
                                                {formatDate(patient.medicalRecord.prescription.issuedDate)}
                                            </Text>
                                        </Group>
                                    )}

                                    {patient.medicalRecord.prescription.medications &&
                                        patient.medicalRecord.prescription.medications.length > 0 && (
                                            <Box>
                                                <Text size='sm' fw={500} c='dark' mb={8}>
                                                    Danh sách thuốc:
                                                </Text>
                                                <Stack gap='sm'>
                                                    {patient.medicalRecord.prescription.medications.map(
                                                        (medication, index) => (
                                                            <Paper
                                                                key={index}
                                                                p='sm'
                                                                bg='teal.0'
                                                                radius='sm'
                                                                withBorder
                                                            >
                                                                <Grid>
                                                                    <Grid.Col span={6}>
                                                                        <Text size='sm' fw={600}>
                                                                            {medication.name}
                                                                        </Text>
                                                                        <Text size='xs' c='dimmed'>
                                                                            {medication.dosage} • {medication.route}
                                                                        </Text>
                                                                    </Grid.Col>
                                                                    <Grid.Col span={6}>
                                                                        <Text size='xs' c='dimmed'>
                                                                            <strong>Tần suất:</strong>{' '}
                                                                            {medication.frequency}
                                                                        </Text>
                                                                        <Text size='xs' c='dimmed'>
                                                                            <strong>Thời gian:</strong>{' '}
                                                                            {medication.duration}
                                                                        </Text>
                                                                        <Text size='xs' c='dimmed'>
                                                                            <strong>Số lượng:</strong>{' '}
                                                                            {medication.quantity}
                                                                        </Text>
                                                                    </Grid.Col>
                                                                    {medication.instruction && (
                                                                        <Grid.Col span={12}>
                                                                            <Text size='xs' c='dark' mt={4}>
                                                                                <strong>Hướng dẫn:</strong>{' '}
                                                                                {medication.instruction}
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
                                            <Text size='sm' fw={500} c='dark'>
                                                Ghi chú từ bác sĩ:
                                            </Text>
                                            <Paper p='sm' bg='yellow.0' radius='sm' mt={4}>
                                                <Text size='sm'>{patient.medicalRecord.prescription.notes}</Text>
                                            </Paper>
                                        </Box>
                                    )}
                                </Stack>
                            </Card>
                        </Grid.Col>
                    )}
                </Grid>
            </Stack>
        </Container>
    )
}

export default PharmacyPatientDetailPage
