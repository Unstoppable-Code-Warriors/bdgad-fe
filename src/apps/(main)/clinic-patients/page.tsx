import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
    Container,
    Title,
    TextInput,
    Group,
    Grid,
    Card,
    Text,
    Stack,
    Paper,
    Box,
    Pagination,
    Select,
    Badge,
    Flex
} from '@mantine/core'
import { IconSearch, IconUser, IconStethoscope, IconCalendarEvent } from '@tabler/icons-react'
import { usePharmacyPatients } from '@/services/hook/pharmacy.hook'

const ClinicPatientsPage = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(16)

    // Use hooks
    const { data: patientsResponse, isLoading } = usePharmacyPatients({
        search: searchTerm,
        page: page,
        limit: limit
    })

    const patients = patientsResponse?.data || []
    const totalPages = patientsResponse?.meta?.totalPages || 1
    const totalCount = patientsResponse?.meta?.total || 0

    const clearFilters = useCallback(() => {
        setSearchTerm('')
        setPage(1)
    }, [])

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage)
    }, [])

    const handleLimitChange = useCallback((newLimit: string | null) => {
        if (newLimit) {
            setLimit(parseInt(newLimit))
            setPage(1)
        }
    }, [])

    useEffect(() => {
        setPage(1)
    }, [searchTerm])

    const handlePatientClick = useCallback(
        (patientId: number) => {
            navigate(`/clinic-patients/${patientId}`)
        },
        [navigate]
    )

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    return (
        <Container size='xl'>
            <Stack gap='lg'>
                {/* Header */}
                <Group justify='space-between'>
                    <Group>
                        <IconStethoscope size={28} color='var(--mantine-color-blue-6)' />
                        <Title order={2}>Danh sách bệnh nhân phòng khám</Title>
                    </Group>
                </Group>

                {/* Search and Filters */}
                <Paper p='md' withBorder>
                    <Stack gap='md'>
                        <Group grow>
                            <TextInput
                                placeholder='Tìm kiếm theo tên bệnh nhân hoặc mã định danh...'
                                leftSection={<IconSearch size={16} />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                            />

                            <Group justify='flex-end'>
                                <Select
                                    placeholder='Số lượng hiển thị'
                                    value={limit.toString()}
                                    onChange={handleLimitChange}
                                    data={[
                                        { value: '8', label: '8' },
                                        { value: '16', label: '16' },
                                        { value: '24', label: '24' }
                                    ]}
                                    style={{ minWidth: 120 }}
                                />
                            </Group>
                        </Group>

                        <Group justify='space-between' align='center'>
                            <Text size='sm' c='dimmed'>
                                Tổng số: {totalCount} bệnh nhân
                            </Text>
                            {searchTerm && (
                                <Text size='sm' c='blue' style={{ cursor: 'pointer' }} onClick={clearFilters}>
                                    Xóa bộ lọc
                                </Text>
                            )}
                        </Group>
                    </Stack>
                </Paper>

                {/* Patient Cards Grid */}
                <Grid>
                    {patients.map((patient) => (
                        <Grid.Col key={patient.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                            <Card
                                shadow='sm'
                                padding='lg'
                                withBorder
                                onClick={() => handlePatientClick(patient.id)}
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                    borderLeft: '4px solid var(--mantine-color-blue-5)'
                                }}
                                className='hover:transform hover:-translate-y-1 hover:shadow-lg'
                            >
                                <Stack gap='xs'>
                                    <Stack gap={4}>
                                        <Box>
                                            <Text size='sm' fw={600} c='dark'>
                                                {patient.patientFullname}
                                            </Text>
                                            <Text size='xs' fw={500} c='blue' mt='xs'>
                                                CCCD: {patient.citizenId}
                                            </Text>
                                        </Box>

                                        {/* Additional patient info */}
                                        <Stack gap={4} mt='xs'>
                                            {patient.patient.gender && (
                                                <Flex align='center' gap='xs'>
                                                    <Text size='xs' c='dimmed' fw={500}>
                                                        Giới tính:
                                                    </Text>
                                                    <Badge size='xs' variant='light' color='cyan'>
                                                        {patient.patient.gender}
                                                    </Badge>
                                                </Flex>
                                            )}

                                            {patient.patient.date_of_birth && (
                                                <Flex align='center' gap='xs'>
                                                    <Text size='xs' c='dimmed' fw={500}>
                                                        Ngày sinh:
                                                    </Text>
                                                    <Text size='xs' c='dimmed'>
                                                        {formatDate(patient.patient.date_of_birth)}
                                                    </Text>
                                                </Flex>
                                            )}

                                            <Flex align='center' gap='xs' mt='xs'>
                                                <IconCalendarEvent size={14} color='var(--mantine-color-green-6)' />
                                                <Text size='xs' c='dimmed'>
                                                    Cuộc hẹn: {formatDate(patient.appointment.date)}
                                                </Text>
                                            </Flex>

                                            {patient.medicalRecord.diagnoses && (
                                                <Box mt='xs'>
                                                    <Text size='xs' c='dimmed' fw={500}>
                                                        Chẩn đoán:
                                                    </Text>
                                                    <Text size='xs' c='dark' lineClamp={2}>
                                                        {patient.medicalRecord.diagnoses}
                                                    </Text>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    ))}
                </Grid>

                {/* Loading State */}
                {isLoading && (
                    <Paper p='xl' ta='center'>
                        <Text c='dimmed'>Đang tải dữ liệu...</Text>
                    </Paper>
                )}

                {/* Empty State */}
                {!isLoading && patients.length === 0 && (
                    <Paper p='xl' ta='center'>
                        <IconUser size={48} color='gray' />
                        <Title order={4} mt='md' c='dimmed'>
                            Không tìm thấy bệnh nhân
                        </Title>
                        <Text c='dimmed' mt='xs'>
                            Thử điều chỉnh từ khóa tìm kiếm
                        </Text>
                    </Paper>
                )}

                {/* Pagination */}
                {!isLoading && patients.length > 0 && totalPages > 1 && (
                    <Paper p='md' withBorder style={{ marginTop: '2rem' }}>
                        <Group justify='center'>
                            <Pagination
                                value={page}
                                onChange={handlePageChange}
                                total={totalPages}
                                size='sm'
                                withEdges
                            />
                        </Group>
                    </Paper>
                )}
            </Stack>
        </Container>
    )
}

export default ClinicPatientsPage
