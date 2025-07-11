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
        onClose()
    }, [onClose])

    const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEditPatientData(prev => ({
            ...prev,
            fullName: e.target.value
        }))
    }, [])

    const handleCitizenIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEditPatientData(prev => ({
            ...prev,
            citizenId: e.target.value
        }))
    }, [])

    const handleUpdatePatient = useCallback(async () => {
        if (patient && editPatientData.fullName.trim() && editPatientData.citizenId.trim()) {
            try {
                await updatePatientMutation.mutateAsync({
                    id: patient.id,
                    data: editPatientData
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

    const isFormValid = editPatientData.fullName.trim() && editPatientData.citizenId.trim()

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
                />

                <TextInput
                    label="Mã định danh"
                    placeholder="Nhập mã định danh..."
                    value={editPatientData.citizenId}
                    onChange={handleCitizenIdChange}
                    required
                    size="md"
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