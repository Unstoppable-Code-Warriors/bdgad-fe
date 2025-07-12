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
import { validateName, formatName } from '@/utils/validateName'

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
        
        const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]*$/
        
        if (nameRegex.test(value)) {
            const formattedValue = value.replace(/\s{2,}/g, ' ')
            
            setPatientData(prev => ({
                ...prev,
                fullName: formattedValue
            }))

            // Real-time validation
            const error = validateName(formattedValue)
            setFullNameError(error)
        }
    }, [])

    const handleCitizenIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        
        const numericValue = value.replace(/\D/g, '')
        
        const limitedValue = numericValue.slice(0, 12)
        
        setPatientData(prev => ({
            ...prev,
            citizenId: limitedValue
        }))

        // Validate
        if (limitedValue.length > 0 && limitedValue.length < 12) {
            setCitizenIdError('Số CCCD phải có đúng 12 số')
        } else {
            setCitizenIdError('')
        }
    }, [])

    const validateCitizenId = (citizenId: string) => {
        if (!citizenId) return 'Số CCCD là bắt buộc'
        if (citizenId.length !== 12) return 'Số CCCD phải có đúng 12 số'
        if (!/^\d{12}$/.test(citizenId)) return 'Số CCCD chỉ được chứa số'
        return ''
    }

    const handleSavePatient = useCallback(async () => {
        const formattedName = formatName(patientData.fullName)
        const nameValidation = validateName(formattedName)
        const citizenIdValidation = validateCitizenId(patientData.citizenId)
        
        setFullNameError(nameValidation)
        setCitizenIdError(citizenIdValidation)

        if (!nameValidation && !citizenIdValidation) {
            try {
                await createPatientMutation.mutateAsync({
                    ...patientData,
                    fullName: formattedName 
                })

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

    const isFormValid = patientData.fullName.trim() && 
                       patientData.citizenId.length === 12 && 
                       !fullNameError &&
                       !citizenIdError

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title="Thêm thư mục bệnh nhân"
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
                    error={fullNameError}
                />

                <TextInput
                    label="Số CCCD"
                    placeholder="Nhập số căn cước công dân (12 số)..."
                    value={patientData.citizenId}
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