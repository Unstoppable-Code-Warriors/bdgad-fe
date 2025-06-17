import { useState } from 'react'
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
    Modal
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import {
    IconSearch,
    IconCalendar,
    IconUser,
    IconCalendarEvent,
    IconPlus
} from '@tabler/icons-react'

const mockPatients = [
    {
        id: '1',
        insuranceNumber: 'GD1234567890123',
        createdAt: '2024-01-15',
    },
    {
        id: '2',
        insuranceNumber: 'HN9876543210987',
        createdAt: '2024-01-16',
    },
    {
        id: '3',
        insuranceNumber: 'DN4567891234567',
        createdAt: '2024-01-17',
    }
]

const PatientInfoPage = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null])
    const [patients, setPatients] = useState(mockPatients)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newPatientBHYT, setNewPatientBHYT] = useState('')

    const filteredPatients = patients.filter(patient => {
        const matchesSearch = patient.insuranceNumber.toLowerCase().includes(searchTerm.toLowerCase()) 

        const patientDate = new Date(patient.createdAt)
        const [dateFrom, dateTo] = dateRange
        const matchesDateRange = (!dateFrom || patientDate >= new Date(dateFrom)) && 
                               (!dateTo || patientDate <= new Date(dateTo))

        return matchesSearch && matchesDateRange
    })

    const clearFilters = () => {
        setSearchTerm('')
        setDateRange([null, null])
    }

    const openModal = () => {
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setNewPatientBHYT('')
    }

    const handleAddPatient = () => {
        if (newPatientBHYT.trim()) {
            const newPatient = {
                id: (patients.length + 1).toString(),
                insuranceNumber: newPatientBHYT.trim(),
                createdAt: new Date().toISOString().split('T')[0]
            }
            setPatients([...patients, newPatient])
            closeModal()
        }
    }

    const handlePatientClick = (patientId: string) => {
        navigate(`/patient-detail/${patientId}`)
    }

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between">
                    <Title order={2}>Thông tin bệnh nhân</Title>
                    <Button leftSection={<IconUser size={16} />} onClick={openModal}>
                        Thêm bệnh nhân
                    </Button>
                </Group>

                {/* Add Patient Modal */}
                <Modal
                    opened={isModalOpen}
                    onClose={closeModal}
                    title="Thêm bệnh nhân mới"
                    centered
                    size="md"
                >
                    <Stack gap="md">
                        <TextInput
                            label="Số BHYT"
                            placeholder="Nhập số BHYT..."
                            value={newPatientBHYT}
                            onChange={(e) => setNewPatientBHYT(e.currentTarget.value)}
                            required
                        />
                        
                        <Group justify="flex-end" mt="md">
                            <Button variant="light" onClick={closeModal}>
                                Hủy
                            </Button>
                            <Button 
                                leftSection={<IconPlus size={16} />}
                                onClick={handleAddPatient}
                                disabled={!newPatientBHYT.trim()}
                            >
                                Thêm bệnh nhân
                            </Button>
                        </Group>
                    </Stack>
                </Modal>

                {/* Search and Filters */}
                <Paper p="md" withBorder>
                    <Group grow>
                        <TextInput
                            placeholder="Tìm kiếm theo tên, số BHYT, CCCD..."
                            leftSection={<IconSearch size={16} />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.currentTarget.value)}
                        />

                        <DatePickerInput
                            type="range"
                            placeholder="Chọn khoảng thời gian"
                            leftSection={<IconCalendar size={16} />}
                            value={dateRange}
                            onChange={setDateRange}
                            clearable
                        />
                        <Button variant="light" onClick={clearFilters}>
                            Xóa bộ lọc
                        </Button>
                    </Group>
                </Paper>

                {/* Patient Cards Grid */}
                <Grid>
                    {filteredPatients.map((patient) => (
                        <Grid.Col key={patient.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                            <Card
                                shadow="sm"
                                padding="lg"
                                withBorder
                                onClick={() => handlePatientClick(patient.id)}
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                    }
                                }}
                            >

                                <Stack gap="xs" mt="sm">
                                                              
                                    <Stack gap={4}>
 
                                    
                                        <Box>
                                            <Text size="xs" fw={500} c="blue">
                                                BHYT: {patient.insuranceNumber}
                                            </Text>
        
                                        </Box>

                                        <Flex align="center" gap="xs" mt="xs">
                                            <IconCalendarEvent size={14} />
                                            <Text size="xs" c="dimmed">
                                                {new Date(patient.createdAt).toLocaleDateString('vi-VN')}
                                            </Text>
                                        </Flex>
                                    </Stack>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    ))}
                </Grid>

                {/* Empty State */}
                {filteredPatients.length === 0 && (
                    <Paper p="xl" ta="center">
                        <IconUser size={48} color="gray" />
                        <Title order={4} mt="md" c="dimmed">
                            Không tìm thấy bệnh nhân
                        </Title>
                        <Text c="dimmed" mt="xs">
                            Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                        </Text>
                    </Paper>
                )}
            </Stack>
        </Container>
    )
}

export default PatientInfoPage