import { useState } from 'react'
import { useLabTestSessionDetail } from '@/services/hook/lab-test.hook'
import { useParams, useNavigate } from 'react-router'
import { Container, Stack, Grid, Alert, Loader, Center, Text } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { PageHeader, LabTestInfo, PatientInfo, FileUpload, FileHistory } from './_components'

const LabTestDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data, isLoading, error } = useLabTestSessionDetail(id)
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

    // Get the latest FastQ file
    const latestFastQFile =
        data?.fastqFiles && data.fastqFiles.length > 0 ? data.fastqFiles[data.fastqFiles.length - 1] : null

    const handleBack = () => {
        navigate('/lab-test')
    }

    const handleFileDrop = (files: File[]) => {
        setUploadedFiles((prev) => [...prev, ...files])
    }

    const handleRemoveFile = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSave = () => {
        // Mock save functionality
        notifications.show({
            title: 'Đã lưu',
            message: 'Thông tin đã được lưu thành công',
            color: 'green'
        })
    }

    if (isLoading) {
        return (
            <Container size='xl' py='xl'>
                <Center>
                    <Stack align='center' gap='md'>
                        <Loader size='lg' />
                        <Text>Đang tải thông tin xét nghiệm...</Text>
                    </Stack>
                </Center>
            </Container>
        )
    }

    if (error) {
        return (
            <Container size='xl' py='xl'>
                <Stack gap='lg'>
                    <PageHeader onBack={handleBack} onSave={handleSave} />
                    <Alert icon={<IconAlertCircle size={16} />} title='Lỗi tải dữ liệu' color='red' variant='light'>
                        {error?.message || 'Không thể tải thông tin xét nghiệm. Vui lòng thử lại.'}
                    </Alert>
                </Stack>
            </Container>
        )
    }

    if (!data) {
        return (
            <Container size='xl' py='xl'>
                <Stack gap='lg'>
                    <PageHeader onBack={handleBack} onSave={handleSave} />
                    <Alert
                        icon={<IconAlertCircle size={16} />}
                        title='Không tìm thấy dữ liệu'
                        color='yellow'
                        variant='light'
                    >
                        Không tìm thấy thông tin xét nghiệm
                    </Alert>
                </Stack>
            </Container>
        )
    }

    return (
        <Stack gap='lg'>
            {/* Header */}
            <PageHeader onBack={handleBack} onSave={handleSave} />

            <Grid>
                {/* Left Column - Lab Test & Patient Info */}
                <Grid.Col span={{ base: 12, lg: 6 }}>
                    <Stack gap='lg'>
                        {/* Lab Test Information */}
                        <LabTestInfo data={data} latestFastQFile={latestFastQFile} />

                        {/* Patient Information with Doctor */}
                        <PatientInfo patient={data.patient} doctor={data.doctor} />
                    </Stack>
                </Grid.Col>

                {/* Right Column - FastQ File Upload */}
                <Grid.Col span={{ base: 12, lg: 6 }}>
                    <FileUpload
                        latestFastQFile={latestFastQFile}
                        uploadedFiles={uploadedFiles}
                        onFileDrop={handleFileDrop}
                        onRemoveFile={handleRemoveFile}
                    />
                </Grid.Col>
            </Grid>

            {/* FastQ History */}
            <FileHistory fastqFiles={data.fastqFiles} />
        </Stack>
    )
}

export default LabTestDetailPage
