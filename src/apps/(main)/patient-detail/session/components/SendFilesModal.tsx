import { useState, useEffect } from 'react'
import { Modal, Stack, Button, Group, Select, Text, Alert, Divider, Badge } from '@mantine/core'
import { IconSend, IconMicroscope, IconClipboardCheck, IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { Role } from '@/utils/constant'
import { authService } from '@/services/function/auth'
import { useAssignSession } from '@/services/hook/staff-patient-session.hook'

interface SendFilesModalProps {
    opened: boolean
    onClose: () => void
    sessionType: string
    sessionId: string
    patientId: string
    sessionData?: any // Thêm sessionData để check trạng thái
}

const SendFilesModal = ({ opened, onClose, sessionType, sessionId, sessionData }: SendFilesModalProps) => {
    const [selectedDoctor, setSelectedDoctor] = useState<string>('')
    const [selectedLabTech, setSelectedLabTech] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Get users by role
    const [doctors, setDoctors] = useState<any[]>([])
    const [labTechs, setLabTechs] = useState<any[]>([])

    const assignSessionMutation = useAssignSession()

    // Check if session is already assigned
    const hasDoctor = sessionData?.doctor?.id
    const hasLabTech = sessionData?.labTestingTechnician?.id || sessionData?.labTesting?.id
    const isAlreadyAssigned = sessionType === 'test' 
        ? hasDoctor && hasLabTech 
        : hasDoctor

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true)
            try {
                const doctorsResponse = await authService.getUserByCode(Role.DOCTOR)
                setDoctors(doctorsResponse.data?.users || [])
                 
                const labTechsResponse = await authService.getUserByCode(Role.LAB_TESTING_TECHNICIAN)                
                setLabTechs(labTechsResponse.data?.users || [])

            } catch (error) {
                console.error('Error fetching users:', error)
                setDoctors([])
                setLabTechs([])
                setError('Không thể tải danh sách người dùng')
            } finally {
                setIsLoading(false)
            }
        }

        if (opened) {
            fetchUsers()
        }
    }, [opened])

    useEffect(() => {
        if (!opened) {
            setSelectedDoctor('')
            setSelectedLabTech('')
            setError(null)
        } else {
            // Pre-fill với thông tin hiện tại nếu có
            if (hasDoctor) {
                setSelectedDoctor(hasDoctor.toString())
            }
            if (hasLabTech) {
                setSelectedLabTech(hasLabTech.toString())
            }
        }
    }, [opened, hasDoctor, hasLabTech])

    // Clear error when user makes changes
    useEffect(() => {
        if (error) {
            setError(null)
        }
    }, [selectedDoctor, selectedLabTech])

    const handleSendFiles = async () => {
        setError(null)

        // Validation
        if (!selectedDoctor) {
            setError('Vui lòng chọn bác sĩ')
            return
        }

        if (sessionType === 'test' && !selectedLabTech) {
            setError('Vui lòng chọn kỹ thuật viên xét nghiệm')
            return
        }

        try {
            const assignData = {
                doctorId: Number(selectedDoctor),
                ...(sessionType === 'test' && selectedLabTech && { labTestingId: Number(selectedLabTech) })
            }

            await assignSessionMutation.mutateAsync({
                sessionId,
                data: assignData
            })

            notifications.show({
                title: 'Thành công',
                message: isAlreadyAssigned ? 'Cập nhật thông tin thành công' : 'Gửi thông tin thành công',
                color: 'green'
            })

            onClose()

        } catch (error) {
            console.error('Assign session error:', error)
            setError('Không thể gán file cho người dùng')
        }
    }

    // Filter users by role and map to options
    const doctorOptions = doctors
        .filter(user => user.roleId === Role.DOCTOR)
        .map((doctor: any) => ({
            value: doctor.id.toString(),
            label: `${doctor.name} (${doctor.email})`
        }))

    const labTechOptions = labTechs
        .filter(user => user.roleId === Role.LAB_TESTING_TECHNICIAN)
        .map((labTech: any) => ({
            value: labTech.id.toString(),
            label: `${labTech.name} (${labTech.email})`
        }))

    const isSending = assignSessionMutation.isPending

    // Get current assigned names for display
    const currentDoctorName = sessionData?.doctor?.name
    const currentLabTechName = sessionData?.labTestingTechnician?.name || sessionData?.labTesting?.name

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group>
                    {isAlreadyAssigned ? <IconCheck size={20} /> : <IconSend size={20} />}
                    <Text fw={600}>
                        {isAlreadyAssigned ? 'Đã gửi yêu cầu' : 'Gửi yêu cầu xét nghiệm'}
                    </Text>
                </Group>
            }
            centered
            size='md'
        >
            <Stack gap='md'>
                {/* Error Alert */}
                {error && (
                    <Alert icon={<IconAlertCircle size={16} />} color='red' variant='light'>
                        {error}
                    </Alert>
                )}

                {/* Already Assigned Status */}
                {isAlreadyAssigned && (
                    <Alert icon={<IconCheck size={16} />} color='green' variant='light'>
                        <Stack gap='xs'>
                            <Text size='sm' fw={500}>Yêu cầu đã được gửi cho:</Text>
                            {currentDoctorName && (
                                <Group gap='xs'>
                                    <Badge color='blue' variant='light' size='sm'>Bác sĩ</Badge>
                                    <Text size='sm'>{currentDoctorName}</Text>
                                </Group>
                            )}
                            {sessionType === 'test' && currentLabTechName && (
                                <Group gap='xs'>
                                    <Badge color='orange' variant='light' size='sm'>Kỹ thuật viên</Badge>
                                    <Text size='sm'>{currentLabTechName}</Text>
                                </Group>
                            )}
                        </Stack>
                    </Alert>
                )}

                {/* Session Type Info */}
                <Alert
                    icon={sessionType === 'test' ? <IconMicroscope size={16} /> : <IconClipboardCheck size={16} />}
                    color={sessionType === 'test' ? 'blue' : 'green'}
                    variant='light'
                >
                    <Text size='sm'>
                        Loại phiên: <strong>{sessionType === 'test' ? 'Xét nghiệm' : 'Thẩm định'}</strong>
                    </Text>
                </Alert>

                {/* Loading State */}
                {isLoading && (
                    <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
                        <Text size="sm">Đang tải danh sách người dùng...</Text>
                    </Alert>
                )}

                {/* Doctor Selection */}
                <div>
                    <Text size='sm' fw={500} mb='xs'>
                        Chọn bác sĩ <span style={{ color: 'red' }}>*</span>
                        {hasDoctor && (
                            <Badge ml='xs' color='green' variant='light' size='xs'>
                                Đã có
                            </Badge>
                        )}
                    </Text>
                    <Select
                        placeholder='Chọn bác sĩ...'
                        value={selectedDoctor}
                        onChange={(value) => setSelectedDoctor(value || '')}
                        data={doctorOptions}
                        searchable
                        nothingFoundMessage='Không tìm thấy bác sĩ'
                        size='md'
                        disabled={isLoading}
                        error={error && !selectedDoctor ? true : false}
                    />
                    {!isLoading && doctorOptions.length === 0 && (
                        <Text size="xs" c="dimmed" mt="xs">
                            Không có bác sĩ nào trong hệ thống
                        </Text>
                    )}
                </div>

                {/* Lab Technician Selection (only for test sessions) */}
                {sessionType === 'test' && (
                    <>
                        <Divider />
                        <div>
                            <Text size='sm' fw={500} mb='xs'>
                                Chọn kỹ thuật viên xét nghiệm <span style={{ color: 'red' }}>*</span>
                                {hasLabTech && (
                                    <Badge ml='xs' color='green' variant='light' size='xs'>
                                        Đã có
                                    </Badge>
                                )}
                            </Text>
                            <Select
                                placeholder='Chọn kỹ thuật viên...'
                                value={selectedLabTech}
                                onChange={(value) => setSelectedLabTech(value || '')}
                                data={labTechOptions}
                                searchable
                                nothingFoundMessage='Không tìm thấy kỹ thuật viên'
                                size='md'
                                disabled={isLoading}
                                error={error && sessionType === 'test' && !selectedLabTech ? true : false}
                            />
                            {!isLoading && labTechOptions.length === 0 && (
                                <Text size="xs" c="dimmed" mt="xs">
                                    Không có kỹ thuật viên xét nghiệm nào trong hệ thống
                                </Text>
                            )}
                        </div>
                    </>
                )}

                {/* Actions */}
                <Group justify='flex-end' mt='md'>
                    <Button variant='light' onClick={onClose} disabled={isSending}>
                        {isAlreadyAssigned ? 'Đóng' : 'Hủy'}
                    </Button>
                    <Button
                        leftSection={isAlreadyAssigned ? <IconCheck size={16} /> : <IconSend size={16} />}
                        onClick={handleSendFiles}
                        loading={isSending}
                        disabled={isSending || isLoading}
                        color={sessionType === 'test' ? 'blue' : 'green'}
                        variant={isAlreadyAssigned ? 'light' : 'filled'}
                    >
                        {isSending 
                            ? (isAlreadyAssigned ? 'Đang cập nhật...' : 'Đang gửi...') 
                            : (isAlreadyAssigned ? 'Cập nhật' : 'Gửi yêu cầu')}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    )
}

export default SendFilesModal
