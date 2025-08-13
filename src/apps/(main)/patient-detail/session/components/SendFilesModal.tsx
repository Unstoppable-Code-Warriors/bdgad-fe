import { useState, useEffect } from 'react'
import { Modal, Stack, Button, Group, Select, Text, Alert, Divider, Box } from '@mantine/core'
import { IconSend, IconMicroscope, IconClipboardCheck, IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { Role } from '@/utils/constant'
import { authService } from '@/services/function/auth'
import { useAssignSession, useAssignResultTest } from '@/services/hook/staff-patient-session.hook'
import { cancerPanelOptions, cancerScreeningPackageOptions, niptPackageOptions } from '@/types/prescription-form'

interface AssignmentItem {
    labcode: string
    labTestingId: number | null
}

interface SendFilesModalProps {
    opened: boolean
    onClose: () => void
    sessionType: string
    sessionId: string
    patientId: string
    sessionData?: any
}

const SendFilesModal = ({ opened, onClose, sessionType, sessionId, sessionData }: SendFilesModalProps) => {
    console.log('Session data from modal:', sessionData)
    console.log('Labcodes extracted:', sessionData?.labcodes)

    // Utility functions for translating package types and sample types
    const getPackageTypeLabel = (packageType: string): string => {
        // Check cancer screening packages
        const cancerScreening = cancerScreeningPackageOptions.find((option) => option.value === packageType)
        if (cancerScreening) return cancerScreening.label

        // Check NIPT packages
        const nipt = niptPackageOptions.find((option) => option.value === packageType)
        if (nipt) return nipt.label

        // Check cancer panels
        const cancerPanel = cancerPanelOptions.find((option) => option.value === packageType)
        if (cancerPanel) return cancerPanel.label

        // Return original value if not found
        return packageType || 'Không xác định'
    }

    const getSampleTypeLabel = (sampleType: string): string => {
        const sampleTypeMap: { [key: string]: string } = {
            biopsy_tissue_ffpe: 'Mô sinh thiết/FFPE',
            blood_stl_ctdna: 'Máu (STL-ctDNA)',
            pleural_peritoneal_fluid: 'Dịch màng phổi/bụng'
        }
        return sampleTypeMap[sampleType] || sampleType || 'Không xác định'
    }

    const [selectedDoctor, setSelectedDoctor] = useState<string>('')
    const [assignments, setAssignments] = useState<AssignmentItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Get users by role
    const [doctors, setDoctors] = useState<any[]>([])
    const [labTechs, setLabTechs] = useState<any[]>([])

    const assignSessionMutation = useAssignSession()
    const assignResultTestMutation = useAssignResultTest()

    // Extract labcodes from sessionData
    const labcodes = Array.isArray(sessionData?.labcodes)
        ? sessionData.labcodes
        : sessionData?.labcode
          ? Array.isArray(sessionData.labcode)
              ? sessionData.labcode
              : [sessionData.labcode]
          : []

    // Check if session is already assigned
    const hasDoctor = labcodes.length > 0 && labcodes.every((item: any) => item.assignment?.doctor?.id)
    const hasAnyLabTesting = assignments.some((item) => item.labTestingId !== null)
    const isAlreadyAssigned = sessionType === 'test' ? hasDoctor && hasAnyLabTesting : hasDoctor

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
            setAssignments([])
            setError(null)
        } else {
            // Initialize assignments from existing data
            const initialAssignments: AssignmentItem[] = labcodes.map((labcodeItem: any) => ({
                labcode: labcodeItem.labcode || labcodeItem.code || labcodeItem.name || '',
                labTestingId: labcodeItem.assignment?.labTesting?.id || null
            }))

            // Only update assignments if they've actually changed
            setAssignments((prev) => {
                if (prev.length !== initialAssignments.length) return initialAssignments

                const hasChanged = initialAssignments.some(
                    (newItem, index) =>
                        prev[index]?.labcode !== newItem.labcode || prev[index]?.labTestingId !== newItem.labTestingId
                )

                return hasChanged ? initialAssignments : prev
            })

            // Pre-fill doctor if exists (get from first labcode assignment)
            const firstDoctorId = labcodes.length > 0 ? labcodes[0].assignment?.doctor?.id : null
            if (firstDoctorId) {
                setSelectedDoctor(firstDoctorId.toString())
            }
        }
    }, [opened, sessionData?.labcodes])

    const handleLabTestingChange = (labcode: string, labTestingId: string | null) => {
        setAssignments((prev) =>
            prev.map((item) =>
                item.labcode === labcode ? { ...item, labTestingId: labTestingId ? Number(labTestingId) : null } : item
            )
        )
        // Clear error when user makes changes
        if (error) {
            setError(null)
        }
    }

    const handleSendFiles = async () => {
        setError(null)

        // Validation
        if (!selectedDoctor) {
            setError('Vui lòng chọn bác sĩ')
            return
        }

        if (sessionType === 'test') {
            const missingLabTesting = assignments.some((item) => item.labTestingId === null)
            if (missingLabTesting) {
                setError('Vui lòng chọn kỹ thuật viên xét nghiệm cho tất cả labcode')
                return
            }
        }

        try {
            if (sessionType === 'result_test') {
                // For result_test, we need to call assignResultTest for each labcode
                const resultTestPromises = labcodes.map(async (labcodeItem: any) => {
                    const labcodeLabSessionId = labcodeItem.id || labcodeItem.labcodeLabSessionId
                    if (!labcodeLabSessionId) {
                        throw new Error(`Không tìm thấy labcodeLabSessionId cho labcode: ${labcodeItem.labcode}`)
                    }
                    console.log('Assigning result test for DOCTOR:', selectedDoctor)

                    return assignResultTestMutation.mutateAsync({
                        doctorId: Number(selectedDoctor),
                        labcodeLabSessionId: Number(labcodeLabSessionId)
                    })
                })

                await Promise.all(resultTestPromises)
            } else {
                // Original logic for other session types
                const assignData = {
                    doctorId: Number(selectedDoctor),
                    assignment: assignments
                        .filter((item) => sessionType !== 'test' || item.labTestingId !== null)
                        .map((item) => ({
                            labcode: item.labcode,
                            labTestingId: item.labTestingId!
                        }))
                }

                console.log('Assign data:', assignData)
                await assignSessionMutation.mutateAsync({
                    sessionId,
                    data: assignData
                })
            }

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
        .filter((user) => user.roleId === Role.DOCTOR)
        .map((doctor: any) => ({
            value: doctor.id.toString(),
            label: `${doctor.name} (${doctor.email})`
        }))

    const labTechOptions = labTechs
        .filter((user) => user.roleId === Role.LAB_TESTING_TECHNICIAN)
        .map((labTech: any) => ({
            value: labTech.id.toString(),
            label: `${labTech.name} (${labTech.email})`
        }))

    const isSending = assignSessionMutation.isPending || assignResultTestMutation.isPending

    // Get current assigned names for display
    const currentDoctorName = labcodes.length > 0 ? labcodes[0].assignment?.doctor?.name : null
    const currentDoctorGmail = labcodes.length > 0 ? labcodes[0].assignment?.doctor?.email : null
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group>
                    {isAlreadyAssigned ? <IconCheck size={20} /> : <IconSend size={20} />}
                    <Text fw={600}>{isAlreadyAssigned ? 'Đã gửi yêu cầu' : 'Gửi yêu cầu'}</Text>
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

                {/* Session Type Info */}
                <Alert
                    icon={sessionType === 'test' ? <IconMicroscope size={16} /> : <IconClipboardCheck size={16} />}
                    color={sessionType === 'test' ? 'blue' : 'green'}
                    variant='light'
                >
                    <Text size='sm'>
                        <strong>{sessionType === 'test' ? 'Xét nghiệm gen' : 'Kết quả xét nghiệm'}</strong>
                    </Text>
                </Alert>

                {/* Loading State */}
                {isLoading && (
                    <Alert icon={<IconAlertCircle size={16} />} color='blue' variant='light'>
                        <Text size='sm'>Đang tải danh sách người dùng...</Text>
                    </Alert>
                )}

                {/* Doctor Selection */}
                <div>
                    <Text size='sm' fw={500} mb='xs'>
                        Chọn bác sĩ <span style={{ color: 'red' }}>*</span>
                    </Text>
                    {!currentDoctorName ? (
                        <Select
                            placeholder='Chọn bác sĩ...'
                            value={selectedDoctor}
                            onChange={(value) => {
                                setSelectedDoctor(value || '')
                                if (error) {
                                    setError(null)
                                }
                            }}
                            data={doctorOptions}
                            searchable
                            nothingFoundMessage='Không tìm thấy bác sĩ'
                            size='md'
                            disabled={isLoading}
                            error={error && !selectedDoctor ? true : false}
                        />
                    ) : (
                        <Text
                            size='sm'
                            fw={500}
                            c='blue'
                            mt='xs'
                            p='sm'
                            bg='blue.0'
                            style={{
                                borderRadius: '6px',
                                border: '1px solid var(--mantine-color-blue-2)'
                            }}
                        >
                            {currentDoctorName} - {currentDoctorGmail}
                        </Text>
                    )}
                    {!isLoading && doctorOptions.length === 0 && (
                        <Text size='xs' c='dimmed' mt='xs'>
                            Không có bác sĩ nào trong hệ thống
                        </Text>
                    )}
                </div>

                {/* Lab Technician Selection per Labcode (only for test sessions) */}
                {sessionType === 'test' && assignments.length > 0 && (
                    <>
                        <Divider />
                        <div>
                            <Text size='sm' fw={500} mb='md'>
                                Phân công kỹ thuật viên xét nghiệm <span style={{ color: 'red' }}>*</span>
                            </Text>
                            <Stack gap='md'>
                                {assignments.map((assignment) => {
                                    const labcodeData = labcodes.find(
                                        (item: any) =>
                                            (item.labcode || item.code || item.name || '') === assignment.labcode
                                    )

                                    return (
                                        <Box
                                            key={assignment.labcode}
                                            p='sm'
                                            bg='gray.0'
                                            style={{ borderRadius: '6px' }}
                                        >
                                            <Group justify='space-between' mb='xs'>
                                                <div>
                                                    <Text size='sm' fw={500}>
                                                        Labcode: {assignment.labcode}
                                                    </Text>
                                                    {/* Package Type Information */}
                                                    {labcodeData?.packageType && (
                                                        <Text size='xs' c='dimmed' mt={2}>
                                                            <strong>Gói xét nghiệm:</strong>{' '}
                                                            {getPackageTypeLabel(labcodeData.packageType)}
                                                        </Text>
                                                    )}
                                                    {/* Sample Type Information */}
                                                    {labcodeData?.sampleType && (
                                                        <Text size='xs' c='dimmed' mt={2}>
                                                            <strong>Loại mẫu:</strong>{' '}
                                                            {getSampleTypeLabel(labcodeData.sampleType)}
                                                        </Text>
                                                    )}
                                                </div>
                                            </Group>
                                            {labcodeData.fastqFilePairs[0].status === 'not_uploaded' ? (
                                                <Select
                                                    placeholder='Chọn kỹ thuật viên...'
                                                    value={assignment.labTestingId?.toString() || ''}
                                                    onChange={(value) =>
                                                        handleLabTestingChange(assignment.labcode, value)
                                                    }
                                                    data={labTechOptions}
                                                    searchable
                                                    nothingFoundMessage='Không tìm thấy kỹ thuật viên'
                                                    size='md'
                                                    disabled={isLoading}
                                                    error={error && assignment.labTestingId === null ? true : false}
                                                />
                                            ) : (
                                                <Text
                                                    size='sm'
                                                    fw={500}
                                                    c='blue'
                                                    mt='xs'
                                                    p='sm'
                                                    bg='blue.0'
                                                    style={{
                                                        borderRadius: '6px',
                                                        border: '1px solid var(--mantine-color-blue-2)'
                                                    }}
                                                >
                                                    {labcodeData?.assignment?.labTesting?.name} - {' '}
                                                    {labcodeData?.assignment?.labTesting?.email}
                                                </Text>
                                            )}
                                        </Box>
                                    )
                                })}
                            </Stack>
                            {!isLoading && labTechOptions.length === 0 && (
                                <Text size='xs' c='dimmed' mt='xs'>
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
                        disabled={isSending || isLoading || (sessionType === 'result_test' && isAlreadyAssigned)}
                        color={sessionType === 'test' ? 'blue' : 'green'}
                        variant={isAlreadyAssigned ? 'light' : 'filled'}
                        style={{
                            display: sessionType === 'result_test' && isAlreadyAssigned ? 'none' : 'block'
                        }}
                    >
                        {isSending
                            ? isAlreadyAssigned
                                ? 'Đang cập nhật...'
                                : 'Đang gửi...'
                            : isAlreadyAssigned
                              ? 'Cập nhật'
                              : 'Gửi yêu cầu'}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    )
}

export default SendFilesModal
