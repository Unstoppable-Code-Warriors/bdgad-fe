import { useState, useCallback, useEffect } from 'react'
import {
    Modal,
    TextInput,
    Group,
    Stack,
    Button
} from '@mantine/core'
import { IconEdit } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useUpdatePatientFolder } from '@/services/hook/staff-patient-folder.hook'
import { validateName, formatName } from '@/utils/validateName'
import { validateCitizenId, formatCitizenId } from '@/utils/validateIdentification'

interface EditPatientModalProps {
    opened: boolean
    onClose: () => void
    patient: any
}

const EditPatientModal = ({ opened, onClose, patient }: EditPatientModalProps) => {
    const [editPatientData, setEditPatientData] = useState({
        fullName: '',
        citizenId: ''
    })
    const [fullNameError, setFullNameError] = useState<string>('')
    const [citizenIdError, setCitizenIdError] = useState<string>('')

    const updatePatientMutation = useUpdatePatientFolder()

    useEffect(() => {
        if (patient) {
            setEditPatientData({
                fullName: patient.fullName || '',
                citizenId: patient.citizenId || ''
            })
        }
    }, [patient])

    const handleClose = useCallback(() => {
        setEditPatientData({
            fullName: '',
            citizenId: ''
        })
        setFullNameError('')
        setCitizenIdError('')
        onClose()
    }, [onClose])

    const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        
        setEditPatientData(prev => ({
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
        
        setEditPatientData(prev => ({
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
        
        setFullNameError(nameValidation || '')
        setCitizenIdError(citizenIdValidation || '')

        if (!nameValidation && !citizenIdValidation && patient) {
            try {
                await updatePatientMutation.mutateAsync({
                    id: patient.id,
                    data: {
                        ...editPatientData,
                        fullName: formattedName
                    }
                })

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

    const isFormValid = editPatientData.fullName.trim() && 
                       editPatientData.citizenId.length === 12 && 
                       !fullNameError &&
                       !citizenIdError

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title="Chỉnh sửa thông tin bệnh nhân"
            centered
            size="md"
        >
            <Stack gap="md">
                <TextInput
                    label="Họ và tên"
                    placeholder="Nhập họ và tên đầy đủ..."
                    value={editPatientData.fullName}
                    onChange={handleFullNameChange}
                    required
                    size="md"
                    error={fullNameError}
                />

                <TextInput
                    label="Số CCCD"
                    placeholder="Nhập số căn cước công dân (12 số)..."
                    value={editPatientData.citizenId}
                    onChange={handleCitizenIdChange}
                    required
                    size="md"
                    error={citizenIdError}
                    maxLength={12}
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="light" onClick={handleClose}>
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