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
    Box,
    Menu,
    ActionIcon,
    Modal
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import {
    IconSearch,
    IconCalendar,
    IconUser,
    IconCalendarEvent,
    IconPlus,
    IconDots,
    IconEdit,
    IconTrash
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { usePatientFolders, useDeletePatientFolder } from '@/services/hook/staff-patient-folder.hook'
import AddPatientModal from './components/AddPatientModal'
import EditPatientModal from './components/EditPatientModal'

const PatientFolderPage = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<any>(null)
    const [errorMess, setErrorMess] = useState('')

    // Use hooks
    const { data: patientsResponse, isLoading } = usePatientFolders({
        search: searchTerm
    })

    const deletePatientMutation = useDeletePatientFolder()

    const patients = patientsResponse?.data || patientsResponse || []

    const filteredPatients = patients.filter((patient: any) => {
        const matchesSearch =
            patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.citizenId?.toLowerCase().includes(searchTerm.toLowerCase())

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
                setErrorMess('') // Clear previous errors
                const res = await deletePatientMutation.mutateAsync(selectedPatient.id)

                if (res.code && res.code === 'PATIENT_HAS_LAB_SESSION') {
                    setErrorMess('Không thể xóa bệnh nhân này vì đã có lần khám.')
                    return
                }
                notifications.show({
                    title: 'Thành công',
                    message: 'Xóa bệnh nhân thành công',
                    color: 'green'
                })

                handleCloseDeleteModal()
            } catch (error) {
                console.error('Error deleting patient:', error)
                notifications.show({
                    title: 'Lỗi',
                    message: 'Không thể xóa bệnh nhân',
                    color: 'red'
                })
            }
        }
    }, [selectedPatient, deletePatientMutation, handleCloseDeleteModal])

    return (
        <Container size='xl' py='xl'>
            <Stack gap='lg'>
                {/* Header */}
                <Group justify='space-between'>
                    <Title order={2}>Thông tin bệnh nhân</Title>
                    <Group>
                        <Button leftSection={<IconPlus size={16} />} onClick={handleAddPatient}>
                            Thêm bệnh nhân
                        </Button>
                    </Group>
                </Group>

                {/* Search and Filters */}
                <Paper p='md' withBorder>
                    <Group grow>
                        <TextInput
                            placeholder='Tìm kiếm theo tên, mã định danh...'
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
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}
                                className='hover:transform hover:-translate-y-1 hover:shadow-lg'
                            >
                                {/* Menu ba chấm */}
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
                <AddPatientModal opened={isAddModalOpen} onClose={handleCloseAddModal} />

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
