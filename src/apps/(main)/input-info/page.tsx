import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Container, Center, Title, Select, Paper, Stack, Button, Group } from '@mantine/core'
import { IconMicroscope, IconClipboardCheck, IconDeviceFloppy, IconArrowNarrowLeft } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useUploadMedicalTestRequisition } from '@/services/hook/staff-upload.hook'
import ImportStep from './components/ImportStep'

interface SubmittedFile {
    id: string
    file: File
    uploadedAt: string
    status: 'uploaded' | 'processing' | 'completed'
    type: 'image' | 'pdf' | 'document' | 'other'
    ocrResult?: any
}

const InputInfoPage = () => {
    const [typeLabSession, setTypeLabSession] = useState<string>('test')
    const [submittedFiles, setSubmittedFiles] = useState<SubmittedFile[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    const patientId = location.state?.patientId || location.state?.patient?.id

    const uploadMutation = useUploadMedicalTestRequisition()

    useEffect(() => {
        if (location.state?.ocrResult) {
            handleOCRComplete(location.state.ocrResult)
        }
    }, [location.state])

    const handleFilesSubmitted = (files: SubmittedFile[]) => {
        setSubmittedFiles(files)
    }

    const handleOCRComplete = (data: any) => {
        console.log('OCR completed:', data)

        // Update the corresponding file with OCR result
        setSubmittedFiles((prev) =>
            prev.map((file) => ({
                ...file,
                ocrResult: data,
                status: 'completed' as const
            }))
        )
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
            // Include OCR results in the upload
            const ocrResults = submittedFiles.filter((file) => file.ocrResult).map((file) => file.ocrResult)

            const formData = {
                files: submittedFiles.map((sf) => sf.file),
                patientId: parseInt(patientId),
                typeLabSession: typeLabSession,
                ocrResult: ocrResults.length > 0 ? JSON.stringify(ocrResults[0]) : undefined
            }

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
            value: 'validation',
            label: 'Thẩm định',
            icon: <IconClipboardCheck size={16} />
        }
    ]

    return (
        <Container size='xl' py='xl'>
            <Center mb='xl'>
                <div>
                    <Title order={1} ta='center' mb='sm'>
                        Tạo lần khám mới
                    </Title>
                </div>
            </Center>
            <Button
                mb='xl'
                leftSection={<IconArrowNarrowLeft size={16} />}
                onClick={() => navigate(`/patient-detail/${patientId}`)}
            >
                Quay lại hồ sơ bệnh nhân
            </Button>

            {/* Session Type Selection */}
            <Paper p='lg' withBorder mb='xl' style={{ margin: '0 auto' }}>
                <Stack gap='md'>
                    <Select
                        label='Loại lần khám'
                        placeholder='Chọn loại lần khám'
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

            <ImportStep onFilesSubmitted={handleFilesSubmitted} onOCRComplete={handleOCRComplete} />

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
