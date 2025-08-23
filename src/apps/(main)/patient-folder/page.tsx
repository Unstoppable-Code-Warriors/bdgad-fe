import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
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
    Box,
    Menu,
    ActionIcon,
    Modal,
    Pagination,
    Select,
    Accordion,
    Tooltip
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import {
    IconSearch,
    IconCalendar,
    IconUser,
    IconCalendarEvent,
    IconDots,
    IconEdit,
    IconTrash,
    IconFolder,
    IconArrowLeft,
    IconPlus,
    IconFilterX
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import {
    usePatientFolders,
    useDeletePatientFolder,
    usePatientFoldersByCreatedDate
} from '@/services/hook/staff-patient-folder.hook'
import AddPatientModal from './components/AddPatientModal'
import EditPatientModal from './components/EditPatientModal'

const PatientFolderPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchTerm, setSearchTerm] = useState('')
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<any>(null)
    const [errorMess, setErrorMess] = useState('')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(16)
    const [sortOrder, setSortOrder] = useState('desc')

    // New state for month/year view
    const [selectedYear, setSelectedYear] = useState<number | null>(null)
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

    // Check if we're navigated here with specific year/month selection
    useEffect(() => {
        const state = location.state as { selectedYear?: number; selectedMonth?: number } | null
        if (state?.selectedYear && state?.selectedMonth) {
            setSelectedYear(state.selectedYear)
            setSelectedMonth(state.selectedMonth)
            setPage(1)
        }
    }, [location.state])

    const isSearchMode =
        searchTerm.trim() !== '' ||
        dateRange[0] !== null ||
        dateRange[1] !== null ||
        selectedYear !== null ||
        selectedMonth !== null

    const {
        data: yearMonthData,
        isLoading: isYearMonthLoading,
        refetch: refetchYearMonth
    } = usePatientFoldersByCreatedDate()

    const {
        data: patientsResponse,
        isLoading,
        refetch: refetchPatients
    } = usePatientFolders({
        search: searchTerm,
        page: page,
        limit: limit,
        sortOrder: sortOrder,
        dateFrom: dateRange[0] ? dateRange[0].toISOString().split('T')[0] : undefined,
        dateTo: dateRange[1] ? dateRange[1].toISOString().split('T')[0] : undefined,
        monthPatientFolder: selectedMonth || undefined,
        yearPatientFolder: selectedYear || undefined
    })

    const deletePatientMutation = useDeletePatientFolder()

    const patients = patientsResponse?.data || patientsResponse || []
    const totalPages = patientsResponse?.meta?.totalPages || 1
    const totalCount = patientsResponse?.meta?.total || 0
    const yearMonthBreakdown = yearMonthData?.data || []

    const monthNames = [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12'
    ]

    const displayedPatients = patients

    const clearFilters = useCallback(() => {
        setSearchTerm('')
        setDateRange([null, null])
        setSortOrder('desc')
        setPage(1)
        setSelectedYear(null)
        setSelectedMonth(null)
    }, [])

    // Handle month folder click
    const handleMonthClick = useCallback((year: number, month: number) => {
        setSelectedYear(year)
        setSelectedMonth(month)
        setPage(1)
    }, [])

    // Handle back to year view
    const handleBackToYearView = useCallback(() => {
        setSelectedYear(null)
        setSelectedMonth(null)
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
    }, [searchTerm, dateRange, sortOrder])

    const handleCloseAddModal = useCallback(() => {
        setIsAddModalOpen(false)
    }, [])

    const handlePatientClick = useCallback(
        (patientId: string) => {
            // Add query params to track where user came from
            let url = `/patient-detail/${patientId}?from=main`
            if (selectedYear && selectedMonth) {
                url += `&year=${selectedYear}&month=${selectedMonth}`
            }
            navigate(url)
        },
        [navigate, selectedYear, selectedMonth]
    )

    // Handle Edit
    const handleEditClick = useCallback((patient: any, event: React.MouseEvent) => {
        event.stopPropagation()
        setSelectedPatient(patient)
        setIsEditModalOpen(true)
    }, [])

    const handleCloseEditModal = useCallback(() => {
        setIsEditModalOpen(false)
        setSelectedPatient(null)
    }, [])

    // Handle Delete
    const handleDeleteClick = useCallback((patient: any, event: React.MouseEvent) => {
        event.stopPropagation()
        setSelectedPatient(patient)
        setIsDeleteModalOpen(true)
    }, [])

    const handleCloseDeleteModal = useCallback(() => {
        setIsDeleteModalOpen(false)
        setSelectedPatient(null)
        setErrorMess('')
    }, [])

    const handleDeletePatient = useCallback(async () => {
        if (selectedPatient) {
            try {
                setErrorMess('')
                const res = await deletePatientMutation.mutateAsync(selectedPatient.id)

                if (res.code && res.code === 'PATIENT_HAS_LAB_SESSION') {
                    setErrorMess('Không thể thư mục xóa bệnh nhân này vì đã có lần khám.')
                    return
                }
                notifications.show({
                    title: 'Thành công',
                    message: 'Xóa thư mục bệnh nhân thành công',
                    color: 'green'
                })

                handleCloseDeleteModal()
            } catch (error) {
                console.error('Error deleting patient:', error)
                notifications.show({
                    title: 'Lỗi',
                    message: 'Không thể thư mục xóa bệnh nhân',
                    color: 'red'
                })
            }
        }
    }, [selectedPatient, deletePatientMutation, handleCloseDeleteModal])

    return (
        <Container size='xl'>
            <Stack gap='lg'>
                {/* Header */}
                <Group justify='space-between'>
                    <Group>
                        {isSearchMode && selectedYear && selectedMonth && (
                            <Button
                                variant='subtle'
                                leftSection={<IconArrowLeft size={28} />}
                                onClick={handleBackToYearView}
                            ></Button>
                        )}
                        <div className='mt-8'>
                            <Title order={2}>
                                {isSearchMode && selectedYear && selectedMonth
                                    ? `${monthNames[selectedMonth - 1]} năm ${selectedYear}`
                                    : 'Thông tin bệnh nhân'}
                            </Title>
                            {isSearchMode && selectedYear && selectedMonth && (
                                <Text size='sm' c='dimmed' mt={2}>
                                    (Ngày tạo hồ sơ bệnh nhân)
                                </Text>
                            )}
                        </div>
                    </Group>
                    {!isSearchMode && (
                        <Button
                            className='mr-3'
                            leftSection={<IconPlus size={16} />}
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            Thêm thư mục bệnh nhân
                        </Button>
                    )}
                </Group>

                {/* Search and Filters */}
                <Paper p='md' withBorder>
                    <Stack gap='md'>
                        <Grid align='end'>
                            <Grid.Col span={{ base: 12, sm: 12, md: 5 }}>
                                <TextInput
                                    label='Tìm kiếm bệnh nhân'
                                    placeholder='Tìm kiếm theo tên, mã định danh...'
                                    leftSection={<IconSearch size={16} />}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.currentTarget.value)}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 12, md: 5 }}>
                                <DatePickerInput
                                    label='Lọc theo ngày xét nghiệm'
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
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 12, md: 2 }}>
                                <Tooltip label='Xóa bộ lọc' withArrow>
                                    <ActionIcon variant='light' onClick={clearFilters} size='lg' color='gray'>
                                        <IconFilterX size={18} />
                                    </ActionIcon>
                                </Tooltip>
                            </Grid.Col>
                        </Grid>

                        {isSearchMode && (
                            <Group justify='space-between' align='center'>
                                <Text size='sm' c='dimmed'>
                                    Tổng số: {totalCount} bệnh nhân
                                </Text>
                            </Group>
                        )}
                    </Stack>
                </Paper>

                {/* Conditional Content */}
                {isSearchMode ? (
                    /* Patient List View */
                    <>
                        {/* Patient Cards Grid */}
                        <Grid>
                            {displayedPatients.map((patient: any) => (
                                <Grid.Col key={patient.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                                    <Card
                                        shadow='sm'
                                        padding='lg'
                                        withBorder
                                        onClick={() => handlePatientClick(patient.id)}
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            position: 'relative'
                                        }}
                                        className='hover:transform hover:-translate-y-1 hover:shadow-lg'
                                    >
                                        <Menu shadow='md' width={200} position='bottom-start'>
                                            <Menu.Target>
                                                <ActionIcon
                                                    variant='subtle'
                                                    color='gray'
                                                    size='sm'
                                                    style={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        zIndex: 10
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <IconDots size={16} />
                                                </ActionIcon>
                                            </Menu.Target>

                                            <Menu.Dropdown>
                                                <Menu.Item
                                                    leftSection={<IconEdit size={14} />}
                                                    onClick={(e) => handleEditClick(patient, e)}
                                                >
                                                    Chỉnh sửa
                                                </Menu.Item>
                                                <Menu.Item
                                                    leftSection={<IconTrash size={14} />}
                                                    color='red'
                                                    onClick={(e) => handleDeleteClick(patient, e)}
                                                >
                                                    Xóa
                                                </Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>

                                        <Stack gap='xs' mt='sm'>
                                            <Stack gap={4}>
                                                <Box>
                                                    <Text size='sm' fw={600} c='dark'>
                                                        {patient.fullName}
                                                    </Text>
                                                    <Text size='xs' fw={500} c='blue' mt='xs'>
                                                        Mã định danh: {patient.citizenId}
                                                    </Text>
                                                </Box>

                                                <Flex align='center' gap='xs' mt='xs'>
                                                    {patient.latestLabSession && <IconCalendarEvent size={14} />}
                                                    <Text size='xs' c='dimmed'>
                                                        {patient.latestLabSession?.createdAt
                                                            ? new Date(
                                                                  patient.latestLabSession.createdAt
                                                              ).toLocaleDateString('vi-VN')
                                                            : 'Chưa có lần khám'}
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
                        {!isLoading && displayedPatients.length === 0 && (
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

                        {/* Pagination */}
                        <Paper p='md' withBorder style={{ marginTop: '2rem' }}>
                            <Group justify='space-between' align='center'>
                                <Group gap='xs'>
                                    <Text size='sm' c='dimmed'>
                                        Hiển thị:
                                    </Text>
                                    <Select
                                        value={limit.toString()}
                                        onChange={handleLimitChange}
                                        data={[
                                            { value: '8', label: '8' },
                                            { value: '16', label: '16' }
                                        ]}
                                        style={{ width: 80 }}
                                    />
                                    <Text size='sm' c='dimmed'>
                                        thư mục/trang
                                    </Text>
                                </Group>

                                {!isLoading && displayedPatients.length > 0 && totalPages > 1 && (
                                    <Pagination
                                        value={page}
                                        onChange={handlePageChange}
                                        total={totalPages}
                                        size='sm'
                                        withEdges
                                    />
                                )}
                            </Group>
                        </Paper>
                    </>
                ) : (
                    /* Year/Month View */
                    <Stack gap='xl'>
                        <Accordion
                            key={yearMonthBreakdown.length}
                            multiple
                            defaultValue={
                                yearMonthBreakdown.length > 0
                                    ? [`year-${Math.max(...yearMonthBreakdown.map((yearData: any) => yearData.year))}`]
                                    : []
                            }
                        >
                            {yearMonthBreakdown.map((yearData: any) => (
                                <Accordion.Item key={yearData.year} value={`year-${yearData.year}`}>
                                    <Accordion.Control>
                                        <Group justify='space-between' align='center' w='100%' pr='md'>
                                            <div className='flex-col'>
                                                <Title order={3}>Năm {yearData.year}</Title>
                                                <Text size='sm' c={'dimmed'}>
                                                    Lưu ý: Thời gian dựa trên ngày tạo hồ sơ bệnh nhân
                                                </Text>
                                            </div>

                                            <Text size='lg' fw={600} c='blue'>
                                                Tổng: {yearData.total} bệnh nhân
                                            </Text>
                                        </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <Grid mt='md'>
                                            {yearData.months.map((monthData: any) => (
                                                <Grid.Col key={monthData.month} span={{ base: 6, sm: 4, md: 3, lg: 2 }}>
                                                    <Card
                                                        shadow='sm'
                                                        padding='lg'
                                                        withBorder
                                                        onClick={() => handleMonthClick(yearData.year, monthData.month)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            backgroundColor: monthData.total > 0 ? '#f8f9fa' : '#ffffff'
                                                        }}
                                                        className='hover:transform hover:-translate-y-1 hover:shadow-lg'
                                                    >
                                                        <Stack gap='xs' align='center'>
                                                            <IconFolder
                                                                size={40}
                                                                color={monthData.total > 0 ? '#228be6' : '#adb5bd'}
                                                            />
                                                            <Text size='sm' fw={600} ta='center'>
                                                                {monthNames[monthData.month - 1]}
                                                            </Text>
                                                            <Text size='xs' c='dimmed' ta='center'>
                                                                {monthData.total} bệnh nhân
                                                            </Text>
                                                        </Stack>
                                                    </Card>
                                                </Grid.Col>
                                            ))}
                                        </Grid>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            ))}
                        </Accordion>

                        {/* Year/Month Loading State */}
                        {isYearMonthLoading && (
                            <Paper p='xl' ta='center'>
                                <Text c='dimmed'>Đang tải dữ liệu...</Text>
                            </Paper>
                        )}

                        {/* Year/Month Empty State */}
                        {!isYearMonthLoading && yearMonthBreakdown.length === 0 && (
                            <Paper p='xl' ta='center'>
                                <IconFolder size={48} color='gray' />
                                <Title order={4} mt='md' c='dimmed'>
                                    Chưa có dữ liệu
                                </Title>
                                <Text c='dimmed' mt='xs'>
                                    Không có thông tin bệnh nhân theo năm/tháng
                                </Text>
                            </Paper>
                        )}
                    </Stack>
                )}

                {/* Add Patient Modal */}
                <AddPatientModal
                    opened={isAddModalOpen}
                    onClose={handleCloseAddModal}
                    onSuccess={() => {
                        refetchYearMonth()
                        refetchPatients()
                    }}
                />

                {/* Edit Patient Modal */}
                <EditPatientModal opened={isEditModalOpen} onClose={handleCloseEditModal} patient={selectedPatient} />

                {/* Delete Confirmation Modal */}
                <Modal
                    opened={isDeleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    title='Xác nhận xóa'
                    centered
                    size='sm'
                >
                    <Stack gap='md'>
                        <Text>
                            Bạn có chắc chắn muốn xóa bệnh nhân{' '}
                            <Text span fw={600}>
                                {selectedPatient?.fullName}
                            </Text>
                            ?
                        </Text>

                        {errorMess && (
                            <Text c='red' size='sm'>
                                {errorMess}
                            </Text>
                        )}

                        <Group justify='flex-end' mt='md'>
                            <Button variant='light' onClick={handleCloseDeleteModal}>
                                Hủy
                            </Button>
                            <Button
                                color='red'
                                leftSection={<IconTrash size={16} />}
                                onClick={handleDeletePatient}
                                loading={deletePatientMutation.isPending}
                            >
                                Xóa
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
            </Stack>
        </Container>
    )
}

export default PatientFolderPage
