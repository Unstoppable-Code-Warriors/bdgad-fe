import { useState, useCallback, useEffect } from 'react'
import { Modal, TextInput, Group, Stack, Button, Select, Grid, Textarea } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconEdit } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useUpdatePatientFolder } from '@/services/hook/staff-patient-folder.hook'
import { validateName, formatName } from '@/utils/validateName'
import { validateCitizenId, formatCitizenId } from '@/utils/validateIdentification'
import { validatePhone } from '@/utils/validatePhone'

interface EditPatientModalProps {
    opened: boolean
    onClose: () => void
    patient: any
}

const EditPatientModal = ({ opened, onClose, patient }: EditPatientModalProps) => {
    const [editPatientData, setEditPatientData] = useState({
        fullName: '',
        citizenId: '',
        dateOfBirth: null as Date | null,
        phone: '',
        ethnicity: '',
        maritalStatus: '',
        address1: '',
        address2: '',
        gender: '',
        nation: '',
        workAddress: ''
    })
    const [fullNameError, setFullNameError] = useState<string>('')
    const [citizenIdError, setCitizenIdError] = useState<string>('')
    const [phoneError, setPhoneError] = useState<string>('')

    const updatePatientMutation = useUpdatePatientFolder()

    useEffect(() => {
        if (patient) {
            setEditPatientData({
                fullName: patient.fullName || '',
                citizenId: patient.citizenId || '',
                dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : null,
                phone: patient.phone || '',
                ethnicity: patient.ethnicity || '',
                maritalStatus: patient.maritalStatus || '',
                address1: patient.address1 || '',
                address2: patient.address2 || '',
                gender: patient.gender || '',
                nation: patient.nation || '',
                workAddress: patient.workAddress || ''
            })
        }
    }, [patient])

    const handleClose = useCallback(() => {
        setEditPatientData({
            fullName: '',
            citizenId: '',
            dateOfBirth: null,
            phone: '',
            ethnicity: '',
            maritalStatus: '',
            address1: '',
            address2: '',
            gender: '',
            nation: '',
            workAddress: ''
        })
        setFullNameError('')
        setCitizenIdError('')
        setPhoneError('')
        onClose()
    }, [onClose])

    const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        // Allow typing but validate in real-time
        setEditPatientData((prev) => ({
            ...prev,
            phone: value
        }))

        // Real-time validation
        const error = validatePhone(value)
        setPhoneError(error || '')
    }, [])

    const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        setEditPatientData((prev) => ({
            ...prev,
            fullName: value
        }))

        // Real-time validation
        const error = validateName(value)
        setFullNameError(error || '')
    }, [])

    const handleCitizenIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const formattedValue = formatCitizenId(value)

        setEditPatientData((prev) => ({
            ...prev,
            citizenId: formattedValue
        }))

        // Real-time validation
        const error = validateCitizenId(formattedValue)
        setCitizenIdError(error || '')
    }, [])

    const handleUpdatePatient = useCallback(async () => {
        const formattedName = formatName(editPatientData.fullName)
        const nameValidation = validateName(formattedName)
        const citizenIdValidation = validateCitizenId(editPatientData.citizenId)
        const phoneValidation = editPatientData.phone ? validatePhone(editPatientData.phone) : null

        setFullNameError(nameValidation || '')
        setCitizenIdError(citizenIdValidation || '')
        setPhoneError(phoneValidation || '')

        if (!nameValidation && !citizenIdValidation && !phoneValidation && patient) {
            try {
                // Only include fields that have values (not empty strings)
                const updateData: any = {
                    fullName: formattedName // Always include formatted name as it's required
                }

                // Only add fields that have actual values
                if (editPatientData.citizenId.trim()) {
                    updateData.citizenId = editPatientData.citizenId
                }
                if (editPatientData.dateOfBirth) {
                    updateData.dateOfBirth = editPatientData.dateOfBirth
                }
                if (editPatientData.phone.trim()) {
                    updateData.phone = editPatientData.phone
                }
                if (editPatientData.ethnicity.trim()) {
                    updateData.ethnicity = editPatientData.ethnicity
                }
                if (editPatientData.maritalStatus.trim()) {
                    updateData.maritalStatus = editPatientData.maritalStatus
                }
                if (editPatientData.address1.trim()) {
                    updateData.address1 = editPatientData.address1
                }
                if (editPatientData.address2.trim()) {
                    updateData.address2 = editPatientData.address2
                }
                if (editPatientData.gender.trim()) {
                    updateData.gender = editPatientData.gender
                }
                if (editPatientData.nation.trim()) {
                    updateData.nation = editPatientData.nation
                }
                if (editPatientData.workAddress.trim()) {
                    updateData.workAddress = editPatientData.workAddress
                }

                const res = await updatePatientMutation.mutateAsync({
                    id: patient.id,
                    data: updateData
                })

                if (res.code && res.code === 'CITIZEN_ID_EXISTS') {
                    setCitizenIdError('Số căn cước công dân đã tồn tại')
                    return
                }

                notifications.show({
                    title: 'Thành công',
                    message: 'Cập nhật thông tin bệnh nhân thành công',
                    color: 'green'
                })

                handleClose()
            } catch (error) {
                console.error('Error updating patient:', error)
                notifications.show({
                    title: 'Lỗi',
                    message: 'Không thể cập nhật thông tin bệnh nhân',
                    color: 'red'
                })
            }
        }
    }, [patient, editPatientData, updatePatientMutation, handleClose])

    const isFormValid =
        editPatientData.fullName.trim() &&
        editPatientData.citizenId.length === 12 &&
        !fullNameError &&
        !citizenIdError &&
        !phoneError

    return (
        <Modal opened={opened} onClose={handleClose} title='Chỉnh sửa thông tin bệnh nhân' centered size='md'>
            <Stack gap='md'>
                <Grid>
                    <Grid.Col span={12}>
                        <TextInput
                            label='Họ và tên'
                            placeholder='Nhập họ và tên đầy đủ...'
                            value={editPatientData.fullName}
                            onChange={handleFullNameChange}
                            required
                            size='md'
                            error={fullNameError}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput
                            label='Số CCCD'
                            placeholder='Nhập số căn cước công dân (12 số)...'
                            value={editPatientData.citizenId}
                            onChange={handleCitizenIdChange}
                            required
                            size='md'
                            error={citizenIdError}
                            maxLength={12}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <DatePickerInput
                            label='Ngày sinh'
                            placeholder='Chọn ngày sinh'
                            value={editPatientData.dateOfBirth}
                            onChange={(value) => {
                                const dateValue = typeof value === 'string' ? new Date(value) : value
                                setEditPatientData((prev) => ({ ...prev, dateOfBirth: dateValue }))
                            }}
                            size='md'
                            maxDate={new Date()}
                            valueFormat='DD/MM/YYYY'
                            clearable
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput
                            label='Số điện thoại'
                            placeholder='Nhập số điện thoại...'
                            value={editPatientData.phone}
                            onChange={handlePhoneChange}
                            size='md'
                            error={phoneError}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <Select
                            label='Giới tính'
                            placeholder='Chọn giới tính'
                            value={editPatientData.gender}
                            onChange={(value) => setEditPatientData((prev) => ({ ...prev, gender: value || '' }))}
                            data={[
                                { value: 'Male', label: 'Nam' },
                                { value: 'Female', label: 'Nữ' },
                                { value: 'Other', label: 'Khác' }
                            ]}
                            size='md'
                            clearable
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput
                            label='Dân tộc'
                            placeholder='Nhập dân tộc...'
                            value={editPatientData.ethnicity}
                            onChange={(e) => setEditPatientData((prev) => ({ ...prev, ethnicity: e.target.value }))}
                            size='md'
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <Select
                            label='Tình trạng hôn nhân'
                            placeholder='Chọn tình trạng hôn nhân'
                            value={editPatientData.maritalStatus}
                            onChange={(value) =>
                                setEditPatientData((prev) => ({ ...prev, maritalStatus: value || '' }))
                            }
                            data={[
                                { value: 'Single', label: 'Độc thân' },
                                { value: 'Married', label: 'Đã kết hôn' },
                                { value: 'Divorced', label: 'Ly hôn' },
                                { value: 'Widowed', label: 'Góa phụ' }
                            ]}
                            size='md'
                            clearable
                        />
                    </Grid.Col>

                    <Grid.Col span={8}>
                        <TextInput
                            label='Quốc gia'
                            placeholder='Nhập quốc gia...'
                            value={editPatientData.nation}
                            onChange={(e) => setEditPatientData((prev) => ({ ...prev, nation: e.target.value }))}
                            size='md'
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <Textarea
                            label='Địa chỉ 1'
                            placeholder='Nhập địa chỉ chính...'
                            value={editPatientData.address1}
                            onChange={(e) => setEditPatientData((prev) => ({ ...prev, address1: e.target.value }))}
                            size='md'
                            autosize
                            minRows={2}
                            maxRows={4}
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <Textarea
                            label='Địa chỉ 2'
                            placeholder='Nhập địa chỉ phụ (tùy chọn)...'
                            value={editPatientData.address2}
                            onChange={(e) => setEditPatientData((prev) => ({ ...prev, address2: e.target.value }))}
                            size='md'
                            autosize
                            minRows={2}
                            maxRows={4}
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <Textarea
                            label='Địa chỉ làm việc'
                            placeholder='Nhập địa chỉ làm việc...'
                            value={editPatientData.workAddress}
                            onChange={(e) => setEditPatientData((prev) => ({ ...prev, workAddress: e.target.value }))}
                            size='md'
                            autosize
                            minRows={2}
                            maxRows={4}
                        />
                    </Grid.Col>
                </Grid>

                <Group justify='flex-end' mt='md'>
                    <Button variant='light' onClick={handleClose}>
                        Hủy
                    </Button>
                    <Button
                        leftSection={<IconEdit size={16} />}
                        onClick={handleUpdatePatient}
                        disabled={!isFormValid}
                        loading={updatePatientMutation?.isPending}
                    >
                        Cập nhật
                    </Button>
                </Group>
            </Stack>
        </Modal>
    )
}

export default EditPatientModal
