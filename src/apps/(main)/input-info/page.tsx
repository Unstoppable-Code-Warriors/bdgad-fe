import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Container, Center, Title, Select, Paper, Stack, Button, Group } from '@mantine/core'
import { IconMicroscope, IconClipboardCheck, IconDeviceFloppy } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useUploadMedicalTestRequisition } from '@/services/hook/staff-upload.hook'
import ImportStep from './components/ImportStep'

interface SubmittedFile {
    id: string
    file: File
    uploadedAt: string
    status: 'uploaded' | 'processing' | 'completed'
    type: 'image' | 'pdf' | 'document' | 'other'
}

const InputInfoPage = () => {
    const [typeLabSession, setTypeLabSession] = useState<string>('test')
    const [submittedFiles, setSubmittedFiles] = useState<SubmittedFile[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    const patientId = location.state?.patientId || location.state?.patient?.id

    const uploadMutation = useUploadMedicalTestRequisition()

    const handleFilesSubmitted = (files: SubmittedFile[]) => {
        setSubmittedFiles(files)
    }

    const handleOCRComplete = (data: any) => {
        // Handle OCR complete if needed
        console.log('OCR completed:', data)
    }

    const handleSaveFiles = async () => {
        if (submittedFiles.length === 0) {
            notifications.show({
                title: 'Lỗi',
                message: 'Vui lòng chọn ít nhất một file',
                color: 'red'
            })
            return
        }

        setIsSaving(true)

        try {
            const formData = {
                files: submittedFiles.map(sf => sf.file),
                patientId: parseInt(patientId),
                typeLabSession: typeLabSession,
                ocrResult: undefined 
            }

            // Call API
            await uploadMutation.mutateAsync(formData)

            notifications.show({
                title: 'Thành công',
                message: 'Upload file thành công',
                color: 'green'
            })

            navigate(`/patient-detail/${patientId}`)

        } catch (error) {
            console.error('Upload error:', error)

            notifications.show({
                title: 'Lỗi',
                message: 'Không thể upload file',
                color: 'red'
            })
        } finally {
            setIsSaving(false)
        }
    }

    const sessionTypeOptions = [
        {
            value: 'test',
            label: 'Xét nghiệm',
            icon: <IconMicroscope size={16} />
        },
        {
            value: 'assessment',
            label: 'Thẩm định',
            icon: <IconClipboardCheck size={16} />
        }
    ]

    return (
        <Container size='xl' py='xl'>
            <Center mb='xl'>
                <div>
                    <Title order={1} ta='center' mb='sm'>
                        Tạo phiên khám mới
                    </Title>
                </div>
            </Center>

            {/* Session Type Selection */}
            <Paper p='lg' withBorder mb='xl' style={{ margin: '0 auto' }}>
                <Stack gap='md'>
                    <Select
                        label='Loại phiên khám'
                        placeholder='Chọn loại phiên khám'
                        value={typeLabSession}
                        onChange={(value) => setTypeLabSession(value || 'test')}
                        data={sessionTypeOptions.map((option) => ({
                            value: option.value,
                            label: option.label
                        }))}
                        size='md'
                        required
                        leftSection={
                            typeLabSession === 'test' ? <IconMicroscope size={16} /> : <IconClipboardCheck size={16} />
                        }
                    />
                </Stack>
            </Paper>

            <ImportStep 
                onFilesSubmitted={handleFilesSubmitted}
                onOCRComplete={handleOCRComplete}
            />

            {/* Save Files Button */}
            {submittedFiles.length > 0 && (
                <Paper p='lg' withBorder mt='xl'>
                    <Group justify='right' mb='md'>
                        <Button
                            size='lg'
                            leftSection={<IconDeviceFloppy size={20} />}
                            onClick={handleSaveFiles}
                            loading={isSaving}
                            disabled={isSaving}
                            color='green'
                            style={{ minWidth: 200 }}
                        >
                            {isSaving ? 'Đang lưu...' : `Lưu ${submittedFiles.length} file`}
                        </Button>
                    </Group>
                </Paper>
            )}
        </Container>
    )
}

export default InputInfoPage
