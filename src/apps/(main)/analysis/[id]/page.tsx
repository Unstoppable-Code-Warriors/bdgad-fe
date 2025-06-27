import { useState, useCallback } from 'react'
import {
    useAnalysisSessionDetail,
    useProcessAnalysis,
    useRejectFastq,
    useDownloadEtlResult,
    useSendEtlResultToValidation,
    useRetryEtlProcess
} from '@/services/hook/analysis.hook'
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
    Modal,
    Textarea,
    Title,
    Box,
    Card,
    Divider,
    ThemeIcon
} from '@mantine/core'
import {
    IconAlertCircle,
    IconPlayerPlay,
    IconX,
    IconDownload,
    IconXboxX,
    IconRefresh,
    IconSend
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { AnalysisInfo, PatientInfo, FastqHistory, EtlResultHistory } from './_components'
import { PageHeader } from '@/components/PageHeader'
import { AnalysisStatus } from '@/types/analysis'
import { labTestService } from '@/services/function/lab-test'

const AnalysisDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data, isLoading, error } = useAnalysisSessionDetail(id)

    // Rejection modal state
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [selectedFastqId, setSelectedFastqId] = useState<number | null>(null)

    // Mutations
    const processAnalysisMutation = useProcessAnalysis()
    const rejectFastqMutation = useRejectFastq()
    const downloadEtlResultMutation = useDownloadEtlResult()
    const sendEtlResultToValidationMutation = useSendEtlResultToValidation()
    const retryEtlProcessMutation = useRetryEtlProcess()

    // Get the latest FastQ file waiting for approval
    const latestFastQFile =
        data?.fastqFiles && data.fastqFiles.length > 0
            ? data.fastqFiles.find((f) => f.status === AnalysisStatus.WAIT_FOR_APPROVAL) || data.fastqFiles[0]
            : null

    // Get the latest ETL result
    const latestEtlResult = data?.etlResults && data.etlResults.length > 0 ? data.etlResults[0] : null

    const handleBack = () => {
        navigate('/analysis')
    }

    const handleProcessAnalysis = async () => {
        if (!latestFastQFile?.id) {
            notifications.show({
                title: 'Lỗi',
                message: 'Không tìm thấy file FastQ để xử lý phân tích',
                color: 'red'
            })
            return
        }

        processAnalysisMutation.mutate(latestFastQFile.id, {
            onSuccess: () => {
                notifications.show({
                    title: 'Thành công',
                    message: 'Quá trình phân tích đã được bắt đầu',
                    color: 'green'
                })
            },
            onError: (error: any) => {
                notifications.show({
                    title: 'Lỗi xử lý phân tích',
                    message: error.message || 'Không thể bắt đầu quá trình phân tích',
                    color: 'red'
                })
            }
        })
    }

    const handleOpenRejectModal = (fastqId: number) => {
        setSelectedFastqId(fastqId)
        setRejectReason('')
        setIsRejectModalOpen(true)
    }

    const handleCloseRejectModal = () => {
        setIsRejectModalOpen(false)
        setSelectedFastqId(null)
        setRejectReason('')
    }

    const handleRejectFastq = async () => {
        if (!selectedFastqId || !rejectReason.trim()) {
            notifications.show({
                title: 'Lỗi',
                message: 'Vui lòng nhập lý do từ chối',
                color: 'red'
            })
            return
        }

        rejectFastqMutation.mutate(
            { fastqFileId: selectedFastqId, data: { redoReason: rejectReason.trim() } },
            {
                onSuccess: () => {
                    notifications.show({
                        title: 'Thành công',
                        message: 'File FastQ đã được từ chối',
                        color: 'green'
                    })
                    handleCloseRejectModal()
                },
                onError: (error: any) => {
                    notifications.show({
                        title: 'Lỗi từ chối file',
                        message: error.message || 'Không thể từ chối file FastQ',
                        color: 'red'
                    })
                }
            }
        )
    }

    const handleDownloadEtlResult = async (etlResultId: number) => {
        try {
            const response = await downloadEtlResultMutation.mutateAsync(etlResultId)
            window.open(response.downloadUrl, '_blank')
            notifications.show({
                title: 'Thành công',
                message: 'Đang tải xuống kết quả phân tích',
                color: 'green'
            })
        } catch (error: any) {
            notifications.show({
                title: 'Lỗi tải file',
                message: error.message || 'Không thể tải xuống kết quả phân tích',
                color: 'red'
            })
        }
    }

    const handleRetryEtlResult = async (etlResultId: number) => {
        retryEtlProcessMutation.mutate(etlResultId, {
            onSuccess: () => {
                notifications.show({
                    title: 'Thành công',
                    message: 'Đã bắt đầu thử lại xử lý phân tích',
                    color: 'green'
                })
            },
            onError: (error: any) => {
                notifications.show({
                    title: 'Lỗi thử lại phân tích',
                    message: error.message || 'Không thể thử lại quá trình phân tích',
                    color: 'red'
                })
            }
        })
    }

    const handleSendEtlResultToValidation = async (etlResultId: number) => {
        sendEtlResultToValidationMutation.mutate(etlResultId, {
            onSuccess: () => {
                notifications.show({
                    title: 'Thành công',
                    message: 'Kết quả phân tích đã được gửi để xác thực',
                    color: 'green'
                })
            },
            onError: (error: any) => {
                notifications.show({
                    title: 'Lỗi gửi xác thực',
                    message: error.message || 'Không thể gửi kết quả để xác thực',
                    color: 'red'
                })
            }
        })
    }

    const handleDownloadFastQ = useCallback(async (fastqFileId: number) => {
        try {
            const response = await labTestService.downloadFastQ(fastqFileId)
            // Open the download URL in a new window/tab
            window.open(response.downloadUrl, '_blank')
        } catch (error: any) {
            notifications.show({
                title: 'Lỗi tải file',
                message: error.message || 'Không thể tạo link tải xuống',
                color: 'red'
            })
        }
    }, [])

    if (isLoading) {
        return (
            <Container size='xl' py='xl'>
                <Center h={400}>
                    <Stack align='center' gap='lg'>
                        <Loader size='lg' color='blue' />
                        <Text size='lg' fw={500}>
                            Đang tải thông tin phân tích...
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
                        <Text mb='md'>Không thể tải thông tin phân tích. Vui lòng thử lại sau.</Text>
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
                        <Text mb='md'>Không tìm thấy thông tin phân tích với ID này.</Text>
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
                    title='Chi tiết phân tích'
                    pageType='analysis'
                    labcode={data.labcode}
                    barcode={data.barcode}
                />

                {/* Main Content Grid */}
                <Grid gutter='xl'>
                    {/* Left Column - Analysis & Patient Info */}
                    <Grid.Col span={{ base: 12, lg: 8 }}>
                        <Stack gap='xl'>
                            {/* Analysis Information */}
                            <AnalysisInfo
                                data={data}
                                latestFastQFile={latestFastQFile}
                                latestEtlResult={latestEtlResult}
                            />

                            {/* Patient Information */}
                            <PatientInfo patient={data.patient} doctor={data.doctor} />
                        </Stack>
                    </Grid.Col>

                    {/* Right Column - Action Panel */}
                    <Grid.Col span={{ base: 12, lg: 4 }}>
                        <Card shadow='sm' radius='lg' p='xl' withBorder h='fit-content' pos='sticky' top={80}>
                            <Stack gap='lg'>
                                <Group gap='sm'>
                                    <ThemeIcon size='lg' radius='md' variant='light' color='blue'>
                                        <IconPlayerPlay size={20} />
                                    </ThemeIcon>
                                    <Box>
                                        <Title order={4}>Hành động</Title>
                                        <Text size='sm' c='dimmed'>
                                            Thao tác với mẫu phân tích
                                        </Text>
                                    </Box>
                                </Group>

                                <Divider />

                                {/* Analysis Actions */}
                                {latestFastQFile?.status === AnalysisStatus.WAIT_FOR_APPROVAL && (
                                    <Stack gap='md'>
                                        <Text size='sm' fw={500} c='blue'>
                                            FastQ đang chờ phê duyệt
                                        </Text>
                                        <Button
                                            variant='light'
                                            color='blue'
                                            leftSection={<IconDownload size={16} />}
                                            onClick={() => handleDownloadFastQ(latestFastQFile.id)}
                                            fullWidth
                                            size='md'
                                            radius='lg'
                                        >
                                            Tải file FastQ
                                        </Button>
                                        <Button
                                            color='green'
                                            onClick={handleProcessAnalysis}
                                            leftSection={<IconPlayerPlay size={16} />}
                                            loading={processAnalysisMutation.isPending}
                                            disabled={processAnalysisMutation.isPending}
                                            fullWidth
                                            size='md'
                                            radius='lg'
                                        >
                                            Bắt đầu phân tích
                                        </Button>
                                        <Button
                                            color='red'
                                            variant='light'
                                            onClick={() => handleOpenRejectModal(latestFastQFile.id)}
                                            leftSection={<IconX size={16} />}
                                            loading={rejectFastqMutation.isPending}
                                            disabled={rejectFastqMutation.isPending}
                                            fullWidth
                                            size='md'
                                            radius='lg'
                                        >
                                            Từ chối FastQ
                                        </Button>
                                    </Stack>
                                )}

                                {latestEtlResult?.status === AnalysisStatus.COMPLETED && (
                                    <Stack gap='md'>
                                        <Text size='sm' fw={500} c='green'>
                                            Kết quả đã sẵn sàng
                                        </Text>
                                        <Button
                                            color='teal'
                                            onClick={() => handleDownloadEtlResult(latestEtlResult.id)}
                                            leftSection={<IconDownload size={16} />}
                                            loading={downloadEtlResultMutation.isPending}
                                            disabled={downloadEtlResultMutation.isPending}
                                            fullWidth
                                            size='md'
                                            radius='lg'
                                        >
                                            Tải xuống kết quả
                                        </Button>
                                        <Button
                                            color='blue'
                                            variant='light'
                                            onClick={() => handleSendEtlResultToValidation(latestEtlResult.id)}
                                            leftSection={<IconSend size={16} />}
                                            loading={sendEtlResultToValidationMutation.isPending}
                                            disabled={sendEtlResultToValidationMutation.isPending}
                                            fullWidth
                                            size='md'
                                            radius='lg'
                                        >
                                            Gửi để xác thực
                                        </Button>
                                    </Stack>
                                )}

                                {latestFastQFile?.status === AnalysisStatus.PROCESSING && (
                                    <Stack gap='md' align='center'>
                                        <Loader size='md' color='blue' />
                                        <Text size='sm' ta='center' c='blue' fw={500}>
                                            Đang xử lý phân tích...
                                        </Text>
                                        <Text size='xs' ta='center' c='dimmed'>
                                            Quá trình này có thể mất vài phút
                                        </Text>
                                    </Stack>
                                )}

                                {latestEtlResult?.status === AnalysisStatus.PROCESSING && (
                                    <Stack gap='md' align='center'>
                                        <Loader size='md' color='orange' />
                                        <Text size='sm' ta='center' c='orange' fw={500}>
                                            Đang xử lý phân tích...
                                        </Text>
                                        <Text size='xs' ta='center' c='dimmed'>
                                            Đang tạo kết quả cuối cùng
                                        </Text>
                                    </Stack>
                                )}

                                {latestEtlResult?.status === AnalysisStatus.FAILED && (
                                    <Stack gap='md'>
                                        <Text size='sm' fw={500} c='red'>
                                            Xử lý phân tích thất bại
                                        </Text>
                                        <Button
                                            color='orange'
                                            onClick={() => handleRetryEtlResult(latestEtlResult!.id)}
                                            leftSection={<IconRefresh size={16} />}
                                            loading={retryEtlProcessMutation.isPending}
                                            disabled={retryEtlProcessMutation.isPending}
                                            fullWidth
                                            size='md'
                                            radius='lg'
                                        >
                                            Phân tích lại
                                        </Button>
                                    </Stack>
                                )}

                                {latestEtlResult?.status === AnalysisStatus.WAIT_FOR_APPROVAL && (
                                    <Stack gap='md' align='center'>
                                        <Text size='sm' ta='center' c='orange' fw={500}>
                                            Đang chờ xác thực
                                        </Text>
                                        <Text size='xs' ta='center' c='dimmed'>
                                            Kết quả đã được gửi để xác thực
                                        </Text>
                                    </Stack>
                                )}

                                {!latestFastQFile && (
                                    <Stack gap='md' align='center'>
                                        <ThemeIcon size='xl' radius='xl' variant='light' color='gray'>
                                            <IconXboxX size={24} />
                                        </ThemeIcon>
                                        <Text size='sm' ta='center' c='dimmed' fw={500}>
                                            Chưa có file FastQ
                                        </Text>
                                        <Text size='xs' ta='center' c='dimmed'>
                                            Chờ tải lên file để bắt đầu
                                        </Text>
                                    </Stack>
                                )}
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>

                {/* History sections with better spacing */}
                <Grid>
                    <Grid.Col span={{ base: 12, lg: 6 }}>
                        <FastqHistory
                            fastqFiles={data.fastqFiles}
                            onReject={handleOpenRejectModal}
                            onProcess={handleProcessAnalysis}
                            onDownload={handleDownloadFastQ}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, lg: 6 }}>
                        <EtlResultHistory
                            etlResults={data.etlResults}
                            onDownload={handleDownloadEtlResult}
                            onRetry={() => handleRetryEtlResult(latestEtlResult!.id)}
                            onSendToValidation={handleSendEtlResultToValidation}
                            latestFastQFile={latestFastQFile}
                        />
                    </Grid.Col>
                </Grid>
            </Stack>

            {/* Enhanced Reject FastQ Modal */}
            <Modal
                opened={isRejectModalOpen}
                onClose={handleCloseRejectModal}
                title={
                    <Group gap='sm'>
                        <ThemeIcon size='lg' color='red' variant='light'>
                            <IconX size={20} />
                        </ThemeIcon>
                        <Box>
                            <Text fw={600} size='lg'>
                                Từ chối file FastQ
                            </Text>
                            <Text size='sm' c='dimmed'>
                                Nhập lý do để từ chối file này
                            </Text>
                        </Box>
                    </Group>
                }
                size='md'
                radius='lg'
                centered
            >
                <Stack gap='lg'>
                    <Alert color='orange' variant='light' icon={<IconAlertCircle size={16} />}>
                        File FastQ sẽ được đánh dấu là bị từ chối và cần phải tải lên lại.
                    </Alert>

                    <Textarea
                        placeholder='Nhập lý do từ chối chi tiết...'
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.currentTarget.value)}
                        minRows={4}
                        maxRows={8}
                        maxLength={500}
                        error={rejectReason.length > 500 ? 'Lý do không được quá 500 ký tự' : undefined}
                        radius='md'
                    />

                    <Group justify='space-between'>
                        <Text size='xs' c='dimmed'>
                            {rejectReason.length}/500 ký tự
                        </Text>
                        <Group>
                            <Button variant='light' onClick={handleCloseRejectModal} radius='lg'>
                                Hủy bỏ
                            </Button>
                            <Button
                                color='red'
                                onClick={handleRejectFastq}
                                loading={rejectFastqMutation.isPending}
                                disabled={!rejectReason.trim() || rejectReason.length > 500}
                                radius='lg'
                            >
                                Xác nhận từ chối
                            </Button>
                        </Group>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    )
}

export default AnalysisDetailPage
