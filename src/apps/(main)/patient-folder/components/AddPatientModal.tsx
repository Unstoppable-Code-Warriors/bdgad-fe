import { useState, useCallback } from 'react'
import { Modal, TextInput, Group, Stack, Button, Select, Grid, Textarea } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconPlus } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useCreatePatientFolder } from '@/services/hook/staff-patient-folder.hook'
import { validateName, formatName } from '@/utils/validateName'
import { validateCitizenId, formatCitizenId } from '@/utils/validateIdentification'
import { validatePhone } from '@/utils/validatePhone'

interface AddPatientModalProps {
    opened: boolean
    onClose: () => void
}

const AddPatientModal = ({ opened, onClose }: AddPatientModalProps) => {
    const [patientData, setPatientData] = useState({
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

    const createPatientMutation = useCreatePatientFolder()

    const handleClose = useCallback(() => {
        setPatientData({
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

    const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        // Allow typing but validate in real-time
        setPatientData((prev) => ({
            ...prev,
            fullName: value
        }))

        // Real-time validation
        const error = validateName(value)
        setFullNameError(error || '')
    }, [])

    const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        // Allow typing but validate in real-time
        setPatientData((prev) => ({
            ...prev,
            phone: value
        }))

        // Real-time validation
        const error = validatePhone(value)
        setPhoneError(error || '')
    }, [])

    const handleCitizenIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const formattedValue = formatCitizenId(value)

        setPatientData((prev) => ({
            ...prev,
            citizenId: formattedValue
        }))

        // Real-time validation
        const error = validateCitizenId(formattedValue)
        setCitizenIdError(error || '')
    }, [])

    const handleSavePatient = useCallback(async () => {
        const formattedName = formatName(patientData.fullName)
        const nameValidation = validateName(formattedName)
        const citizenIdValidation = validateCitizenId(patientData.citizenId)
        const phoneValidation = patientData.phone ? validatePhone(patientData.phone) : null

        setFullNameError(nameValidation || '')
        setCitizenIdError(citizenIdValidation || '')
        setPhoneError(phoneValidation || '')

        if (!nameValidation && !citizenIdValidation && !phoneValidation) {
            try {
                // Only include fields that have values (not empty strings)
                const createData: any = {
                    fullName: formattedName, // Always include formatted name as it's required
                    citizenId: patientData.citizenId // Always include citizenId as it's required
                }

                // Only add optional fields that have actual values
                if (patientData.dateOfBirth) {
                    createData.dateOfBirth = patientData.dateOfBirth
                }
                if (patientData.phone.trim()) {
                    createData.phone = patientData.phone
                }
                if (patientData.ethnicity.trim()) {
                    createData.ethnicity = patientData.ethnicity
                }
                if (patientData.maritalStatus.trim()) {
                    createData.maritalStatus = patientData.maritalStatus
                }
                if (patientData.address1.trim()) {
                    createData.address1 = patientData.address1
                }
                if (patientData.address2.trim()) {
                    createData.address2 = patientData.address2
                }
                if (patientData.gender.trim()) {
                    createData.gender = patientData.gender
                }
                if (patientData.nation.trim()) {
                    createData.nation = patientData.nation
                }
                if (patientData.workAddress.trim()) {
                    createData.workAddress = patientData.workAddress
                }

                const res = await createPatientMutation.mutateAsync(createData)

                if (res.code && res.code === 'CITIZEN_ID_EXISTS') {
                    setCitizenIdError('Số căn cước công dân đã tồn tại')
                    return
                }

                notifications.show({
                    title: 'Thành công',
                    message: 'Thêm thư mục bệnh nhân thành công',
                    color: 'green'
                })

                handleClose()
            } catch (error) {
                console.error('Error creating patient:', error)
                notifications.show({
                    title: 'Lỗi',
                    message: 'Không thể thêm bệnh nhân',
                    color: 'red'
                })
            }
        }
    }, [patientData, createPatientMutation, handleClose])

    const isFormValid =
        patientData.fullName.trim() &&
        patientData.citizenId.length === 12 &&
        !fullNameError &&
        !citizenIdError &&
        !phoneError

    return (
        <Modal opened={opened} onClose={handleClose} title='Thêm thư mục bệnh nhân' centered size='md'>
            <Stack gap='md'>
                <Grid>
                    <Grid.Col span={12}>
                        <TextInput
                            label='Họ và tên'
                            placeholder='Nhập họ và tên đầy đủ...'
                            value={patientData.fullName}
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
                            value={patientData.citizenId}
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
                            value={patientData.dateOfBirth}
                            onChange={(value) => {
                                const dateValue = typeof value === 'string' ? new Date(value) : value
                                setPatientData((prev) => ({ ...prev, dateOfBirth: dateValue }))
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
                            value={patientData.phone}
                            onChange={handlePhoneChange}
                            size='md'
                            error={phoneError}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <Select
                            label='Giới tính'
                            placeholder='Chọn giới tính'
                            value={patientData.gender}
                            onChange={(value) => setPatientData((prev) => ({ ...prev, gender: value || '' }))}
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
                            value={patientData.ethnicity}
                            onChange={(e) => setPatientData((prev) => ({ ...prev, ethnicity: e.target.value }))}
                            size='md'
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <Select
                            label='Tình trạng hôn nhân'
                            placeholder='Chọn tình trạng hôn nhân'
                            value={patientData.maritalStatus}
                            onChange={(value) => setPatientData((prev) => ({ ...prev, maritalStatus: value || '' }))}
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
                    <Grid.Col span={6}>
                        <TextInput
                            label='Quốc gia'
                            placeholder='Nhập quốc gia...'
                            value={patientData.nation}
                            onChange={(e) => setPatientData((prev) => ({ ...prev, nation: e.target.value }))}
                            size='md'
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <Textarea
                            label='Địa chỉ 1'
                            placeholder='Nhập địa chỉ chính...'
                            value={patientData.address1}
                            onChange={(e) => setPatientData((prev) => ({ ...prev, address1: e.target.value }))}
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
                            value={patientData.address2}
                            onChange={(e) => setPatientData((prev) => ({ ...prev, address2: e.target.value }))}
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
                            value={patientData.workAddress}
                            onChange={(e) => setPatientData((prev) => ({ ...prev, workAddress: e.target.value }))}
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
                        leftSection={<IconPlus size={16} />}
                        onClick={handleSavePatient}
                        disabled={!isFormValid}
                        loading={createPatientMutation?.isPending}
                    >
                        Thêm bệnh nhân
                    </Button>
                </Group>
            </Stack>
        </Modal>
    )
}

export default AddPatientModal
