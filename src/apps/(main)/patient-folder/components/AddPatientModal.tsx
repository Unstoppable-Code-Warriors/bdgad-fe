import { useState, useCallback } from 'react'
import {
    Modal,
    TextInput,
    Group,
    Stack,
    Button
} from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useCreatePatientFolder } from '@/services/hook/staff-patient-folder.hook' 

interface AddPatientModalProps {
    opened: boolean
    onClose: () => void
}

const AddPatientModal = ({ opened, onClose }: AddPatientModalProps) => {
    const [patientData, setPatientData] = useState({
        fullName: '',
        healthInsuranceCode: ''
    })

    const createPatientMutation = useCreatePatientFolder()

    const handleClose = useCallback(() => {
        setPatientData({
            fullName: '',
            healthInsuranceCode: ''
        })
        onClose()
    }, [onClose])

    const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPatientData(prev => ({
            ...prev,
            fullName: e.target.value
        }))
    }, [])

    const handleHealthInsuranceCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPatientData(prev => ({
            ...prev,
            healthInsuranceCode: e.target.value
        }))
    }, [])

    const handleSavePatient = useCallback(async () => {
        if (patientData.fullName.trim() && patientData.healthInsuranceCode.trim()) {
            try {
                await createPatientMutation.mutateAsync(patientData)

                notifications.show({
                    title: 'Thành công',
                    message: 'Thêm bệnh nhân thành công',
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

    const isFormValid = patientData.fullName.trim() && patientData.healthInsuranceCode.trim()

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title="Thêm bệnh nhân mới"
            centered
            size="md"
        >
            <Stack gap="md">
                <TextInput
                    label="Họ và tên"
                    placeholder="Nhập họ và tên đầy đủ..."
                    value={patientData.fullName}
                    onChange={handleFullNameChange}
                    required
                    size="md"
                />

                <TextInput
                    label="Số BHYT"
                    placeholder="Nhập số thẻ bảo hiểm y tế..."
                    value={patientData.healthInsuranceCode}
                    onChange={handleHealthInsuranceCodeChange}
                    required
                    size="md"
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="light" onClick={handleClose}>
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