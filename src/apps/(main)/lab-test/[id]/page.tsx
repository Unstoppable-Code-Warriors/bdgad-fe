import { useState } from 'react'
import { useLabTestSessionDetail, useSendToAnalysis } from '@/services/hook/lab-test.hook'
import { useUsersByRole } from '@/services/hook/auth.hook'
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
    Select
} from '@mantine/core'
import { IconAlertCircle, IconSend } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { LabTestInfo, FileHistory } from './_components'
import { FileUpload } from './_components/FileUploadPair'
import { PatientInfo } from '@/components/PatientInfo'
import { PageHeader } from '@/components/PageHeader'
import { Role } from '@/utils/constant'

const LabTestDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data, isLoading, error } = useLabTestSessionDetail(id)
    const { data: analysisTechniciansData, isLoading: isLoadingTechnicians } = useUsersByRole(Role.ANALYSIS_TECHNICIAN)
    const [r1File, setR1File] = useState<File | null>(null)
    const [r2File, setR2File] = useState<File | null>(null)

    const sendToAnalysisMutation = useSendToAnalysis()
    const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(
        data?.analysis?.id ? String(data.analysis.id) : null
    )

    // Get analysis technicians from the hook
    const analysisTechnicians = analysisTechniciansData?.data?.users || []

    // Get the latest FastQ file pair
    const latestFastqFilePair = data?.fastqFilePairs && data.fastqFilePairs.length > 0 ? data.fastqFilePairs[0] : null

    const handleBack = () => {
        navigate('/lab-test')
    }

    const handleUploadSuccess = () => {
        // Clear uploaded files after successful upload
        setR1File(null)
        setR2File(null)
    }

    const handleR1FileDrop = (file: File | null) => {
        setR1File(file)
    }

    const handleR2FileDrop = (file: File | null) => {
        setR2File(file)
    }

    const handleSendToAnalysis = async () => {
        if (!latestFastqFilePair?.id) {
            notifications.show({
                title: 'Lỗi',
                message: 'Không tìm thấy file FastQ để gửi phân tích',
                color: 'red'
            })
            return
        }

        // Use selected analysis ID
        const analysisId = selectedAnalysisId ? parseInt(selectedAnalysisId, 10) : undefined
        
        if (!analysisId) {
            notifications.show({
                title: 'Thiếu thông tin',
                message: 'Vui lòng chọn người phân tích trước khi gửi.',
                color: 'orange'
            })
            return
        }

        sendToAnalysisMutation.mutate(
            {
                fastqPairId: latestFastqFilePair.id,
                analysisId: analysisId
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
                    labcode={Array.isArray(data.labcode) ? data.labcode : [data.labcode]}
                    barcode={data.barcode}
                />

                {/* Main Content Grid */}
                <Grid gutter='xl'>
                    {/* Left Column - Lab Test & Patient Info */}
                    <Grid.Col span={{ base: 12, lg: 8 }}>
                        <Stack gap='xl'>
                            {/* Lab Test Information */}
                            <LabTestInfo data={data} latestFastqFilePair={latestFastqFilePair} />

                            {/* Patient Information */}
                            <PatientInfo patient={data.patient} analysis={data?.analysis} doctor={data?.doctor} />
                        </Stack>
                    </Grid.Col>

                    {/* Right Column - File Upload & Actions */}
                    <Grid.Col span={{ base: 12, lg: 4 }}>
                        <Box pos='sticky' top={80}>
                            <Stack gap='lg'>
                                <FileUpload
                                    sessionId={parseInt(id || '0', 10)}
                                    latestFastqFilePair={latestFastqFilePair}
                                    fastqFilePairs={data.fastqFilePairs}
                                    onUploadSuccess={handleUploadSuccess}
                                    r1File={r1File}
                                    r2File={r2File}
                                    onR1FileDrop={handleR1FileDrop}
                                    onR2FileDrop={handleR2FileDrop}
                                />

                                {/* Action Panel */}
                                {(latestFastqFilePair?.status === 'uploaded' ||
                                    latestFastqFilePair?.status === 'rejected') && (
                                    <Card shadow='sm' radius='lg' p='lg' withBorder>
                                        <Stack gap='lg'>
                                            <Group gap='sm'>
                                                <ThemeIcon size='lg' radius='md' variant='light' color='green'>
                                                    <IconSend size={20} />
                                                </ThemeIcon>
                                                <Box>
                                                    <Text fw={600} size='md'>
                                                        Gửi phân tích
                                                    </Text>
                                                    <Text size='sm' c='dimmed'>
                                                        {latestFastqFilePair?.status === 'rejected'
                                                            ? 'File FastQ đã được sửa đổi và sẵn sàng gửi lại phân tích'
                                                            : 'File FastQ đã sẵn sàng để gửi phân tích'}
                                                    </Text>
                                                </Box>
                                            </Group>

                                            <Divider />
                                            {/* Analysis Assignment Form */}

                                            <Select
                                                label='Chọn kỹ thuật viên Phân Tích'
                                                placeholder='Chọn người dùng...'
                                                data={analysisTechnicians.map((user) => ({
                                                    label: `${user.name} - ${user.email}`,
                                                    value: String(user.id)
                                                }))}
                                                disabled={
                                                    sendToAnalysisMutation.isPending ||
                                                    latestFastqFilePair?.status !== 'uploaded' ||
                                                    isLoadingTechnicians
                                                }
                                                value={selectedAnalysisId}
                                                onChange={setSelectedAnalysisId}
                                                required
                                            />

                                            <Divider />

                                            <Button
                                                color='green'
                                                onClick={handleSendToAnalysis}
                                                leftSection={<IconSend size={16} />}
                                                loading={sendToAnalysisMutation.isPending}
                                                disabled={
                                                    sendToAnalysisMutation.isPending ||
                                                    !selectedAnalysisId ||
                                                    latestFastqFilePair?.status !== 'uploaded'
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
                <FileHistory fastqFilePairs={data.fastqFilePairs} />
            </Stack>
        </Container>
    )
}

export default LabTestDetailPage
