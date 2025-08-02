import { useCallback, useState } from 'react'
import {
    useAnalysisSessionDetail,
    useProcessAnalysis,
    useDownloadEtlResult,
    useSendEtlResultToValidation,
    useRetryEtlProcess,
    getAllValidations
} from '@/services/hook/analysis.hook'
import { useParams, useNavigate } from 'react-router'
import {
    Container,
    Stack,
    Grid,
    Loader,
    Center,
    Text,
    Group,
    Button,
    Title,
    Box,
    Card,
    Divider,
    ThemeIcon,
    Avatar,
    Select,
    Alert
} from '@mantine/core'
import {
    IconAlertCircle,
    IconPlayerPlay,
    IconX,
    IconDownload,
    IconXboxX,
    IconRefresh,
    IconSend,
    IconFileText,
    IconChartLine,
    IconUser
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { AnalysisInfo } from './_components'
import { PatientInfo } from '@/components/PatientInfo'
import { FileHistory } from '@/components/FileHistory'
import { EtlResultHistory } from '@/components/EtlResultHistory'
import { PageHeader } from '@/components/PageHeader'
import { AnalysisStatus, analysisStatusConfig } from '@/types/analysis'
import { labTestService } from '@/services/function/lab-test'
import { openRejectFastqModal } from '@/components/RejectFastqModal'

const AnalysisDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data, isLoading, error, refetch } = useAnalysisSessionDetail(id)
    const [selectedValidationId, setSelectedValidationId] = useState<string | null>(
        data?.validation ? String(data.validation.id) : null
    )

    // Mutations
    const processAnalysisMutation = useProcessAnalysis()
    const downloadEtlResultMutation = useDownloadEtlResult()
    const sendEtlResultToValidationMutation = useSendEtlResultToValidation()
    const retryEtlProcessMutation = useRetryEtlProcess()
    const validations = getAllValidations()

    // Get the latest FastQ file pair waiting for approval
    const latestFastqFilePair =
        data?.fastqFilePairs && data.fastqFilePairs.length > 0
            ? data.fastqFilePairs.find((f) => f.status === AnalysisStatus.WAIT_FOR_APPROVAL) || data.fastqFilePairs[0]
            : null

    // Get the latest ETL result
    const latestEtlResult = data?.etlResults && data.etlResults.length > 0 ? data.etlResults[0] : null

    console.log('Latest Etl File:', latestEtlResult)
    const handleBack = () => {
        navigate('/analysis')
    }

    const handleProcessAnalysis = async () => {
        if (!latestFastqFilePair?.id) {
            notifications.show({
                title: 'Lỗi',
                message: 'Không tìm thấy cặp file FastQ để xử lý phân tích',
                color: 'red'
            })
            return
        }

        processAnalysisMutation.mutate(latestFastqFilePair.id, {
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

    const handleOpenRejectModal = (fastqPairId: number) => {
        openRejectFastqModal({
            fastqPairId: fastqPairId,
            onSuccess: () => {
                refetch()
            }
        })
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
        if (!selectedValidationId) {
            notifications.show({
                title: 'Thieu thong tin',
                message: 'Vui long chon nguoi xac thuc truoc khi gui ket qua.',
                color: 'orange'
            })
            return
        }
        sendEtlResultToValidationMutation.mutate(
            {
                etlResultId: etlResultId,
                validataionId: parseInt(selectedValidationId!)
            },
            {
                onSuccess: () => {
                    notifications.show({
                        title: 'Thành công',
                        message: 'Kết quả phân tích đã được gửi để thẩm định',
                        color: 'green'
                    })
                },
                onError: (error: any) => {
                    notifications.show({
                        title: 'Lỗi gửi thẩm định',
                        message: error.message || 'Không thể gửi kết quả để thẩm định',
                        color: 'red'
                    })
                }
            }
        )
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

    const handleDownloadR1 = useCallback(
        async (fastqFilePairId: number) => {
            // Find the FastQ file pair by ID
            const fastqFilePair = data?.fastqFilePairs?.find((pair) => pair.id === fastqFilePairId)
            if (fastqFilePair?.fastqFileR1?.id) {
                await handleDownloadFastQ(fastqFilePair.fastqFileR1.id)
            }
        },
        [handleDownloadFastQ, data?.fastqFilePairs]
    )

    const handleDownloadR2 = useCallback(
        async (fastqFilePairId: number) => {
            // Find the FastQ file pair by ID
            const fastqFilePair = data?.fastqFilePairs?.find((pair) => pair.id === fastqFilePairId)
            if (fastqFilePair?.fastqFileR2?.id) {
                await handleDownloadFastQ(fastqFilePair.fastqFileR2.id)
            }
        },
        [handleDownloadFastQ, data?.fastqFilePairs]
    )

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
                    labcode={Array.isArray(data.labcode) ? data.labcode : [data.labcode]}
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
                                latestFastqFilePair={latestFastqFilePair}
                                latestEtlResult={latestEtlResult}
                            />

                            {/* Patient Information */}
                            <PatientInfo validation={data.validation} patient={data.patient} doctor={data.doctor} />
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
                                {latestFastqFilePair?.status === AnalysisStatus.WAIT_FOR_APPROVAL && (
                                    <Stack gap='md'>
                                        <Text size='sm' fw={500} c='blue'>
                                            Cặp file FastQ đang chờ phê duyệt
                                        </Text>
                                        <Group justify='space-between' grow>
                                            <Button
                                                variant='light'
                                                color='blue'
                                                leftSection={<IconDownload size={16} />}
                                                onClick={() => handleDownloadFastQ(latestFastqFilePair.fastqFileR1.id)}
                                                size='md'
                                                radius='lg'
                                            >
                                                R1 file
                                            </Button>
                                            <Button
                                                variant='light'
                                                color='blue'
                                                leftSection={<IconDownload size={16} />}
                                                onClick={() => handleDownloadFastQ(latestFastqFilePair.fastqFileR2.id)}
                                                size='md'
                                                radius='lg'
                                            >
                                                R2 file
                                            </Button>
                                        </Group>

                                        <Divider />
                                        {/* <Text size='sm' fw={500} c='teal'>
                                            {latestEtlResult?.status === AnalysisStatus.REJECTED
                                                ? 'phân tích'
                                                : 'Phân tích mẫu'}
                                        </Text> */}
                                        {latestEtlResult?.status === AnalysisStatus.REJECTED ? (
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
                                                Phân tích
                                            </Button>
                                        ) : (
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
                                        )}
                                        <Button
                                            color='red'
                                            variant='light'
                                            onClick={() => handleOpenRejectModal(latestFastqFilePair.id)}
                                            leftSection={<IconX size={16} />}
                                            fullWidth
                                            size='md'
                                            radius='lg'
                                        >
                                            Từ chối cặp file FastQ
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
                                        <Divider />
                                        {data.validation ? (
                                            <>
                                                <Text fw={600}>Kỹ thuật viên phân tích</Text>
                                                <Group gap='sm'>
                                                    <Avatar size='lg' radius='md' color='green' variant='light'>
                                                        <IconUser size={24} />
                                                    </Avatar>
                                                    <Box>
                                                        <Text fw={700} size='lg'>
                                                            {data.validation.name}
                                                        </Text>
                                                        <Text size='sm' c='dimmed'>
                                                            {data.validation.email}
                                                        </Text>
                                                    </Box>
                                                </Group>
                                            </>
                                        ) : (
                                            <Select
                                                label='Chọn kỹ thuật viên Thẩm Định'
                                                placeholder='Chọn kỹ thuật viên...'
                                                data={validations.data?.data?.users.map((user) => ({
                                                    label: `${user.name} - ${user.email}`,
                                                    value: String(user.id)
                                                }))}
                                                value={selectedValidationId}
                                                onChange={setSelectedValidationId}
                                                required
                                            />
                                        )}
                                        <Button
                                            color='blue'
                                            variant='light'
                                            onClick={() => handleSendEtlResultToValidation(latestEtlResult.id)}
                                            leftSection={<IconSend size={16} />}
                                            loading={sendEtlResultToValidationMutation.isPending}
                                            disabled={
                                                sendEtlResultToValidationMutation.isPending ||
                                                (!data.validation && selectedValidationId == undefined)
                                            }
                                            fullWidth
                                            size='md'
                                            radius='lg'
                                        >
                                            Gửi để thẩm định
                                        </Button>
                                    </Stack>
                                )}

                                {latestFastqFilePair?.status === AnalysisStatus.PROCESSING && (
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
                                            phân tích
                                        </Button>
                                    </Stack>
                                )}

                                {latestEtlResult?.status === AnalysisStatus.WAIT_FOR_APPROVAL && (
                                    <Stack gap='md' align='center'>
                                        <Text size='sm' ta='center' c='orange' fw={500}>
                                            Đang chờ thẩm định
                                        </Text>
                                        <Text size='xs' ta='center' c='dimmed'>
                                            Kết quả đã được gửi để thẩm định
                                        </Text>
                                    </Stack>
                                )}

                                {!latestFastqFilePair && (
                                    <Stack gap='md' align='center'>
                                        <ThemeIcon size='xl' radius='xl' variant='light' color='gray'>
                                            <IconXboxX size={24} />
                                        </ThemeIcon>
                                        <Text size='sm' ta='center' c='dimmed' fw={500}>
                                            Chưa có cặp file FastQ
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
                        <FileHistory
                            files={data.fastqFilePairs}
                            title='Lịch sử cặp file FastQ'
                            subtitle='Theo dõi các cặp file FastQ đã tải lên'
                            emptyStateTitle='Chưa có cặp file FastQ nào'
                            emptyStateDescription='Cặp file FastQ sẽ xuất hiện ở đây sau khi được tải lên'
                            icon={<IconFileText size={20} />}
                            iconColor='orange'
                            statusConfig={analysisStatusConfig}
                            fileNamePrefix='Cặp file FastQ'
                            actions={[
                                {
                                    type: 'download',
                                    label: 'R1 file',
                                    icon: <IconDownload size={16} />,
                                    color: 'blue',
                                    variant: 'light',
                                    condition: (result) =>
                                        [
                                            AnalysisStatus.WAIT_FOR_APPROVAL,
                                            AnalysisStatus.APPROVED,
                                            AnalysisStatus.REJECTED,
                                            AnalysisStatus.PROCESSING,
                                            AnalysisStatus.COMPLETED,
                                            AnalysisStatus.FAILED
                                        ].includes(result.status as AnalysisStatus),
                                    handler: handleDownloadR1
                                },
                                {
                                    type: 'download',
                                    label: 'R2 file',
                                    icon: <IconDownload size={16} />,
                                    color: 'blue',
                                    variant: 'light',
                                    condition: (result) =>
                                        [
                                            AnalysisStatus.WAIT_FOR_APPROVAL,
                                            AnalysisStatus.APPROVED,
                                            AnalysisStatus.REJECTED,
                                            AnalysisStatus.PROCESSING,
                                            AnalysisStatus.COMPLETED,
                                            AnalysisStatus.FAILED
                                        ].includes(result.status as AnalysisStatus),
                                    handler: handleDownloadR2
                                }
                                // {
                                //     type: 'process',
                                //     label: 'Bắt đầu phân tích',
                                //     icon: <IconPlayerPlay size={16} />,
                                //     color: 'green',
                                //     variant: 'light',
                                //     condition: (file) => file.status === AnalysisStatus.WAIT_FOR_APPROVAL,
                                //     handler: () => handleProcessAnalysis()
                                // },
                                // {
                                //     type: 'reject',
                                //     label: 'Từ chối',
                                //     icon: <IconX size={16} />,
                                //     color: 'red',
                                //     variant: 'light',
                                //     condition: (file) => file.status === AnalysisStatus.WAIT_FOR_APPROVAL,
                                //     handler: handleOpenRejectModal
                                // }
                            ]}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, lg: 6 }}>
                        <EtlResultHistory
                            results={data.etlResults}
                            title='Lịch sử kết quả phân tích'
                            subtitle='Theo dõi các kết quả phân tích đã hoàn thành'
                            emptyStateTitle='Chưa có kết quả phân tích nào'
                            emptyStateDescription='Kết quả phân tích sẽ xuất hiện ở đây sau khi hoàn thành xử lý'
                            icon={<IconChartLine size={20} />}
                            iconColor='teal'
                            statusConfig={analysisStatusConfig}
                            resultNamePrefix='Kết quả phân tích'
                            actions={
                                [
                                    // {
                                    //     type: 'download',
                                    //     label: 'Tải xuống',
                                    //     icon: <IconDownload size={16} />,
                                    //     color: 'teal',
                                    //     variant: 'light',
                                    //     condition: (result) =>
                                    //         [
                                    //             AnalysisStatus.WAIT_FOR_APPROVAL,
                                    //             AnalysisStatus.APPROVED,
                                    //             AnalysisStatus.REJECTED,
                                    //             AnalysisStatus.PROCESSING,
                                    //             AnalysisStatus.COMPLETED,
                                    //             AnalysisStatus.FAILED
                                    //         ].includes(result.status as AnalysisStatus),
                                    //     handler: handleDownloadEtlResult
                                    // }
                                    // {
                                    //     type: 'send',
                                    //     label: 'Gửi để thẩm định',
                                    //     icon: <IconSend size={16} />,
                                    //     color: 'blue',
                                    //     variant: 'light',
                                    //     condition: (result) => result.status === AnalysisStatus.COMPLETED,
                                    //     handler: handleSendEtlResultToValidation
                                    // },
                                    // {
                                    //     type: 'retry',
                                    //     label: 'phân tích',
                                    //     icon: <IconRefresh size={16} />,
                                    //     color: 'orange',
                                    //     variant: 'light',
                                    //     condition: (result) => result.status === AnalysisStatus.FAILED,
                                    //     handler: handleRetryEtlResult
                                    // },
                                    // {
                                    //     type: 'retry',
                                    //     label: 'phân tích',
                                    //     icon: <IconRefresh size={16} />,
                                    //     color: 'orange',
                                    //     variant: 'light',
                                    //     condition: (result) => result.status === AnalysisStatus.REJECTED,
                                    //     handler: handleRetryEtlResult
                                    // }
                                ]
                            }
                        />
                    </Grid.Col>
                </Grid>
            </Stack>
        </Container>
    )
}

export default AnalysisDetailPage
