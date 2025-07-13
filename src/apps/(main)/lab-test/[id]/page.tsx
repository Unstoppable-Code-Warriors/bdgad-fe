import { useState } from 'react'
import { getAllAnalysis, useLabTestSessionDetail, useSendToAnalysis } from '@/services/hook/lab-test.hook'
import { useParams, useNavigate } from 'react-router'
import {
    Container,
    Stack,
    Grid,
    Alert,
    Loader,
    Center,
    Text,
    Group,
    Button,
    Box,
    Card,
    Divider,
    ThemeIcon,
    Select,
    Avatar
} from '@mantine/core'
import { IconAlertCircle, IconSend, IconUser } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { LabTestInfo, FileUpload, FileHistory } from './_components'
import { PatientInfo } from '@/components/PatientInfo'
import { PageHeader } from '@/components/PageHeader'

const LabTestDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data, isLoading, error } = useLabTestSessionDetail(id)
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const sendToAnalysisMutation = useSendToAnalysis()
    const analysises = getAllAnalysis()
    const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(
        data?.analysis?.id ? String(data.analysis.id) : null
    )

    // Get the latest FastQ file
    const latestFastQFile = data?.fastqFiles && data.fastqFiles.length > 0 ? data.fastqFiles[0] : null

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

        if (!selectedAnalysisId && !data?.analysis) {
            notifications.show({
                title: 'Thiếu thông tin',
                message: 'Vui lòng chọn người phân tích trước khi gửi.',
                color: 'orange'
            })
            return
        }

        sendToAnalysisMutation.mutate(
            {
                fastqFileId: latestFastQFile.id,
                analysisId: parseInt(selectedAnalysisId!)
            },
            {
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
            }
        )
    }

    if (isLoading) {
        return (
            <Container size='xl' py='xl'>
                <Center h={400}>
                    <Stack align='center' gap='lg'>
                        <Loader size='lg' color='blue' />
                        <Text size='lg' fw={500}>
                            Đang tải thông tin xét nghiệm...
                        </Text>
                        <Text size='sm' c='dimmed'>
                            Vui lòng chờ trong giây lát
                        </Text>
                    </Stack>
                </Center>
            </Container>
        )
    }

    if (error) {
        return (
            <Container size='xl' py='xl'>
                <Center h={400}>
                    <Alert
                        variant='light'
                        color='red'
                        title='Có lỗi xảy ra'
                        icon={<IconAlertCircle size={20} />}
                        maw={500}
                        radius='lg'
                    >
                        <Text mb='md'>Không thể tải thông tin xét nghiệm. Vui lòng thử lại sau.</Text>
                        <Button variant='light' color='red' onClick={() => window.location.reload()}>
                            Thử lại
                        </Button>
                    </Alert>
                </Center>
            </Container>
        )
    }

    if (!data) {
        return (
            <Container size='xl' py='xl'>
                <Center h={400}>
                    <Alert
                        variant='light'
                        color='orange'
                        title='Không tìm thấy dữ liệu'
                        icon={<IconAlertCircle size={20} />}
                        maw={500}
                        radius='lg'
                    >
                        <Text mb='md'>Không tìm thấy thông tin xét nghiệm với ID này.</Text>
                        <Button variant='light' color='orange' onClick={handleBack}>
                            Quay lại danh sách
                        </Button>
                    </Alert>
                </Center>
            </Container>
        )
    }

    return (
        <Container size='xl' py='lg'>
            <Stack gap='xl'>
                {/* Page Header */}
                <PageHeader
                    onBack={handleBack}
                    title='Chi tiết xét nghiệm'
                    pageType='lab-test'
                    labcode={data.labcode}
                    barcode={data.barcode}
                />

                {/* Main Content Grid */}
                <Grid gutter='xl'>
                    {/* Left Column - Lab Test & Patient Info */}
                    <Grid.Col span={{ base: 12, lg: 8 }}>
                        <Stack gap='xl'>
                            {/* Lab Test Information */}
                            <LabTestInfo data={data} latestFastQFile={latestFastQFile} />

                            {/* Patient Information */}
                            <PatientInfo patient={data.patient} doctor={data.doctor} />
                        </Stack>
                    </Grid.Col>

                    {/* Right Column - File Upload & Actions */}
                    <Grid.Col span={{ base: 12, lg: 4 }}>
                        <Box pos='sticky' top={80}>
                            <Stack gap='lg'>
                                <FileUpload
                                    sessionId={parseInt(id || '0', 10)}
                                    latestFastQFile={latestFastQFile}
                                    fastqFiles={data.fastqFiles}
                                    uploadedFiles={uploadedFiles}
                                    onFileDrop={handleFileDrop}
                                    onRemoveFile={handleRemoveFile}
                                    onUploadSuccess={handleUploadSuccess}
                                />

                                {/* Action Panel */}
                                {latestFastQFile?.status === 'uploaded' && (
                                    <Card shadow='sm' radius='lg' p='lg' withBorder>
                                        <Stack gap='lg'>
                                            <Group gap='sm'>
                                                <ThemeIcon size='lg' radius='md' variant='light' color='green'>
                                                    <IconSend size={20} />
                                                </ThemeIcon>
                                                <Box>
                                                    <Text fw={600} size='md'>
                                                        Sẵn sàng phân tích
                                                    </Text>
                                                    <Text size='sm' c='dimmed'>
                                                        File FastQ đã sẵn sàng để gửi phân tích
                                                    </Text>
                                                </Box>
                                            </Group>

                                            <Divider />

                                            {data.analysis ? (
                                                <>
                                                    <Text fw={600}>Kỹ thuật viên phân tích</Text>
                                                    <Group gap='sm'>
                                                        <Avatar size='lg' radius='md' color='green' variant='light'>
                                                            <IconUser size={24} />
                                                        </Avatar>
                                                        <Box>
                                                            <Text fw={700} size='lg'>
                                                                {data.analysis.name}
                                                            </Text>
                                                            <Text size='sm' c='dimmed'>
                                                                {data.analysis.email}
                                                            </Text>
                                                        </Box>
                                                    </Group>
                                                </>
                                            ) : (
                                                <Select
                                                    label='Chọn kỹ thuật viên Phân Tích'
                                                    placeholder='Chọn người dùng...'
                                                    data={analysises.data?.data?.users.map((user) => ({
                                                        label: `${user.name} - ${user.email}`,
                                                        value: String(user.id)
                                                    }))}
                                                    value={selectedAnalysisId}
                                                    onChange={setSelectedAnalysisId}
                                                    required
                                                />
                                            )}

                                            <Divider />

                                            <Button
                                                color='green'
                                                onClick={handleSendToAnalysis}
                                                leftSection={<IconSend size={16} />}
                                                loading={sendToAnalysisMutation.isPending}
                                                disabled={
                                                    sendToAnalysisMutation.isPending ||
                                                    (!data.analysis && !selectedAnalysisId)
                                                }
                                                fullWidth
                                                size='md'
                                                radius='lg'
                                            >
                                                Gửi phân tích FastQ
                                            </Button>
                                        </Stack>
                                    </Card>
                                )}
                            </Stack>
                        </Box>
                    </Grid.Col>
                </Grid>

                {/* FastQ File History */}
                <FileHistory fastqFiles={data.fastqFiles} />
            </Stack>
        </Container>
    )
}

export default LabTestDetailPage
