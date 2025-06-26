import { useState } from 'react'
import { useLabTestSessionDetail, useSendToAnalysis } from '@/services/hook/lab-test.hook'
import { useParams, useNavigate } from 'react-router'
import { Container, Stack, Grid, Alert, Loader, Center, Text, Group, Button } from '@mantine/core'
import { IconAlertCircle, IconSend } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { PageHeader, LabTestInfo, PatientInfo, FileUpload, FileHistory } from './_components'

const LabTestDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data, isLoading, error } = useLabTestSessionDetail(id)
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const sendToAnalysisMutation = useSendToAnalysis()

    // Get the latest FastQ file
    const latestFastQFile =
        data?.fastqFiles && data.fastqFiles.length > 0 ? data.fastqFiles[data.fastqFiles.length - 1] : null

    const handleBack = () => {
        navigate('/lab-test')
    }

    const handleFileDrop = (files: File[]) => {
        // Replace existing files with new files (only one file allowed)
        setUploadedFiles(files)
    }

    const handleRemoveFile = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleUploadSuccess = () => {
        // Clear uploaded files after successful upload
        setUploadedFiles([])
    }

    const handleSendToAnalysis = async () => {
        if (!latestFastQFile?.id) {
            notifications.show({
                title: 'Lỗi',
                message: 'Không tìm thấy file FastQ để gửi phân tích',
                color: 'red'
            })
            return
        }

        sendToAnalysisMutation.mutate(latestFastQFile.id, {
            onSuccess: () => {
                notifications.show({
                    title: 'Thành công',
                    message: 'File FastQ đã được gửi phân tích thành công',
                    color: 'green'
                })
            },
            onError: (error: any) => {
                notifications.show({
                    title: 'Lỗi gửi phân tích',
                    message: error.message || 'Không thể gửi file FastQ để phân tích',
                    color: 'red'
                })
            }
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
                <Alert variant='light' color='red' title='Lỗi' icon={<IconAlertCircle size={16} />}>
                    Không thể tải thông tin xét nghiệm. Vui lòng thử lại sau.
                </Alert>
            </Container>
        )
    }

    if (!data) {
        return (
            <Container size='xl' py='xl'>
                <Alert variant='light' color='orange' title='Không tìm thấy' icon={<IconAlertCircle size={16} />}>
                    Không tìm thấy thông tin xét nghiệm với ID này.
                </Alert>
            </Container>
        )
    }

    return (
        <Stack gap='lg'>
            {/* Header */}
            <PageHeader onBack={handleBack} />

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
                        sessionId={parseInt(id || '0', 10)}
                        latestFastQFile={latestFastQFile}
                        fastqFiles={data.fastqFiles}
                        uploadedFiles={uploadedFiles}
                        onFileDrop={handleFileDrop}
                        onRemoveFile={handleRemoveFile}
                        onUploadSuccess={handleUploadSuccess}
                    />
                    {latestFastQFile?.status === 'uploaded' && (
                        <Group justify='flex-end' mt={'lg'}>
                            <Button
                                color='green'
                                onClick={handleSendToAnalysis}
                                leftSection={<IconSend size={16} />}
                                loading={sendToAnalysisMutation.isPending}
                                disabled={sendToAnalysisMutation.isPending}
                            >
                                Phân tích FastQ
                            </Button>
                        </Group>
                    )}
                </Grid.Col>
            </Grid>

            {/* FastQ History */}
            <FileHistory fastqFiles={data.fastqFiles} />
        </Stack>
    )
}

export default LabTestDetailPage
