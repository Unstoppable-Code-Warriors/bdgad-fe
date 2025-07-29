import { useState, useCallback } from 'react'
import { Modal, TextInput, Group, Stack, Button } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useCreatePatientFolder } from '@/services/hook/staff-patient-folder.hook'
import { validateName, formatName } from '@/utils/validateName'
import { validateCitizenId, formatCitizenId } from '@/utils/validateIdentification'

interface AddPatientModalProps {
    opened: boolean
    onClose: () => void
}

const AddPatientModal = ({ opened, onClose }: AddPatientModalProps) => {
    const [patientData, setPatientData] = useState({
        fullName: '',
        citizenId: ''
    })
    const [fullNameError, setFullNameError] = useState<string>('')
    const [citizenIdError, setCitizenIdError] = useState<string>('')

    const createPatientMutation = useCreatePatientFolder()

    const handleClose = useCallback(() => {
        setPatientData({
            fullName: '',
            citizenId: ''
        })
        setFullNameError('')
        setCitizenIdError('')
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

        setFullNameError(nameValidation || '')
        setCitizenIdError(citizenIdValidation || '')

        if (!nameValidation && !citizenIdValidation) {
            try {
                const res = await createPatientMutation.mutateAsync({
                    ...patientData,
                    fullName: formattedName
                })

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
        patientData.fullName.trim() && patientData.citizenId.length === 12 && !fullNameError && !citizenIdError

    return (
        <Modal opened={opened} onClose={handleClose} title='Thêm thư mục bệnh nhân' centered size='md'>
            <Stack gap='md'>
                <TextInput
                    label='Họ và tên'
                    placeholder='Nhập họ và tên đầy đủ...'
                    value={patientData.fullName}
                    onChange={handleFullNameChange}
                    required
                    size='md'
                    error={fullNameError}
                />

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
