import { useState, useCallback } from 'react'
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
    Button,
    Paper,
    Flex,
    Box
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconSearch, IconCalendar, IconUser, IconCalendarEvent, IconPlus } from '@tabler/icons-react'
import { usePatientFolders } from '@/services/hook/staff-patient-folder.hook' 
import AddPatientModal from './components/AddPatientModal'

const PatientFolderPage = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // Use hooks
    const {
        data: patientsResponse,
        isLoading,
        refetch
    } = usePatientFolders({
        search: searchTerm
    })

    const patients = patientsResponse?.data || patientsResponse || []

    const filteredPatients = patients.filter((patient: any) => {
        const matchesSearch =
            patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.healthInsuranceCode?.toLowerCase().includes(searchTerm.toLowerCase())

        const patientDate = new Date(patient.createdAt)
        const [dateFrom, dateTo] = dateRange
        const matchesDateRange = (!dateFrom || patientDate >= dateFrom) && (!dateTo || patientDate <= dateTo)

        return matchesSearch && matchesDateRange
    })

    const clearFilters = useCallback(() => {
        setSearchTerm('')
        setDateRange([null, null])
    }, [])

    const handleAddPatient = useCallback(() => {
        setIsAddModalOpen(true)
    }, [])

    const handleCloseAddModal = useCallback(() => {
        setIsAddModalOpen(false)
    }, [])

    const handlePatientClick = useCallback(
        (patientId: string) => {
            navigate(`/patient-detail/${patientId}`)
        },
        [navigate]
    )

    const handleRefresh = useCallback(() => {
        refetch()
    }, [refetch])

    return (
        <Container size='xl' py='xl'>
            <Stack gap='lg'>
                {/* Header */}
                <Group justify='space-between'>
                    <Title order={2}>Thông tin bệnh nhân</Title>
                    <Group>
                        <Button variant='light' onClick={handleRefresh} loading={isLoading}>
                            Làm mới
                        </Button>
                        <Button leftSection={<IconPlus size={16} />} onClick={handleAddPatient}>
                            Thêm bệnh nhân
                        </Button>
                    </Group>
                </Group>

                {/* Search and Filters */}
                <Paper p='md' withBorder>
                    <Group grow>
                        <TextInput
                            placeholder='Tìm kiếm theo tên, số BHYT...'
                            leftSection={<IconSearch size={16} />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.currentTarget.value)}
                        />

                        <DatePickerInput
                            type='range'
                            placeholder='Chọn khoảng thời gian'
                            leftSection={<IconCalendar size={16} />}
                            value={dateRange}
                            onChange={(value) => {
                                setDateRange([
                                    value[0] ? new Date(value[0]) : null,
                                    value[1] ? new Date(value[1]) : null
                                ])
                            }}
                            clearable
                        />
                        <Button variant='light' onClick={clearFilters}>
                            Xóa bộ lọc
                        </Button>
                    </Group>
                </Paper>

                {/* Patient Cards Grid */}
                <Grid>
                    {filteredPatients.map((patient: any) => (
                        <Grid.Col key={patient.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                            <Card
                                shadow='sm'
                                padding='lg'
                                withBorder
                                onClick={() => handlePatientClick(patient.id)}
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                className='hover:transform hover:-translate-y-1 hover:shadow-lg'
                            >
                                <Stack gap='xs' mt='sm'>
                                    <Stack gap={4}>
                                        <Box>
                                            <Text size='sm' fw={600} c='dark'>
                                                {patient.fullName}
                                            </Text>
                                            <Text size='xs' fw={500} c='blue' mt='xs'>
                                                BHYT: {patient.healthInsuranceCode}
                                            </Text>
                                        </Box>

                                        <Flex align='center' gap='xs' mt='xs'>
                                            <IconCalendarEvent size={14} />
                                            <Text size='xs' c='dimmed'>
                                                {new Date(patient.createdAt).toLocaleDateString('vi-VN')}
                                            </Text>
                                        </Flex>
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
                {!isLoading && filteredPatients.length === 0 && (
                    <Paper p='xl' ta='center'>
                        <IconUser size={48} color='gray' />
                        <Title order={4} mt='md' c='dimmed'>
                            Không tìm thấy bệnh nhân
                        </Title>
                        <Text c='dimmed' mt='xs'>
                            Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                        </Text>
                    </Paper>
                )}

                {/* Add Patient Modal */}
                <AddPatientModal
                    opened={isAddModalOpen}
                    onClose={handleCloseAddModal}
                />
            </Stack>
        </Container>
    )
}

export default PatientFolderPage
