import { useState } from 'react'
import {
    useAnalysisSessionDetail,
    useProcessAnalysis,
    useRejectFastq,
    useDownloadEtlResult
} from '@/services/hook/analysis.hook'
import { useParams, useNavigate } from 'react-router'
import { Container, Stack, Grid, Alert, Loader, Center, Text, Group, Button, Modal, Textarea } from '@mantine/core'
import { IconAlertCircle, IconPlayerPlay, IconX, IconDownload } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { PageHeader, AnalysisInfo, PatientInfo, FastqHistory, EtlResultHistory } from './_components'
import { ANALYSIS_STATUS } from '@/types/analysis'

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

    // Get the latest FastQ file waiting for approval
    const latestFastQFile =
        data?.fastqFiles && data.fastqFiles.length > 0
            ? data.fastqFiles.find((f) => f.status === ANALYSIS_STATUS.WAIT_FOR_APPROVAL) || data.fastqFiles[0]
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

    if (isLoading) {
        return (
            <Container size='xl' py='xl'>
                <Center>
                    <Stack align='center' gap='md'>
                        <Loader size='lg' />
                        <Text>Đang tải thông tin phân tích...</Text>
                    </Stack>
                </Center>
            </Container>
        )
    }

    if (error) {
        return (
            <Container size='xl' py='xl'>
                <Alert variant='light' color='red' title='Lỗi' icon={<IconAlertCircle size={16} />}>
                    Không thể tải thông tin phân tích. Vui lòng thử lại sau.
                </Alert>
            </Container>
        )
    }

    if (!data) {
        return (
            <Container size='xl' py='xl'>
                <Alert variant='light' color='orange' title='Không tìm thấy' icon={<IconAlertCircle size={16} />}>
                    Không tìm thấy thông tin phân tích với ID này.
                </Alert>
            </Container>
        )
    }

    return (
        <>
            <Stack gap='lg'>
                {/* Header */}
                <PageHeader onBack={handleBack} />

                <Grid>
                    {/* Left Column - Analysis & Patient Info */}
                    <Grid.Col span={{ base: 12, lg: 6 }}>
                        <Stack gap='lg'>
                            {/* Analysis Information */}
                            <AnalysisInfo
                                data={data}
                                latestFastQFile={latestFastQFile}
                                latestEtlResult={latestEtlResult}
                            />

                            {/* Patient Information with Doctor */}
                            <PatientInfo patient={data.patient} doctor={data.doctor} />
                        </Stack>
                    </Grid.Col>

                    {/* Right Column - Action Buttons */}
                    <Grid.Col span={{ base: 12, lg: 6 }}>
                        <Stack gap='lg'>
                            {/* Analysis Actions */}
                            {latestFastQFile?.status === ANALYSIS_STATUS.WAIT_FOR_APPROVAL && (
                                <Group>
                                    <Button
                                        color='green'
                                        onClick={handleProcessAnalysis}
                                        leftSection={<IconPlayerPlay size={16} />}
                                        loading={processAnalysisMutation.isPending}
                                        disabled={processAnalysisMutation.isPending}
                                    >
                                        Bắt đầu phân tích
                                    </Button>
                                    <Button
                                        color='red'
                                        onClick={() => handleOpenRejectModal(latestFastQFile.id)}
                                        leftSection={<IconX size={16} />}
                                        loading={rejectFastqMutation.isPending}
                                        disabled={rejectFastqMutation.isPending}
                                    >
                                        Từ chối FastQ
                                    </Button>
                                </Group>
                            )}

                            {latestEtlResult?.status === ANALYSIS_STATUS.COMPLETED && (
                                <Button
                                    color='teal'
                                    onClick={() => handleDownloadEtlResult(latestEtlResult.id)}
                                    leftSection={<IconDownload size={16} />}
                                    loading={downloadEtlResultMutation.isPending}
                                    disabled={downloadEtlResultMutation.isPending}
                                >
                                    Tải xuống kết quả
                                </Button>
                            )}
                        </Stack>
                    </Grid.Col>
                </Grid>

                {/* FastQ History */}
                <FastqHistory
                    fastqFiles={data.fastqFiles}
                    onReject={handleOpenRejectModal}
                    onProcess={handleProcessAnalysis}
                />

                {/* ETL Result History */}
                <EtlResultHistory etlResults={data.etlResults} onDownload={handleDownloadEtlResult} />
            </Stack>

            {/* Reject FastQ Modal */}
            <Modal opened={isRejectModalOpen} onClose={handleCloseRejectModal} title='Từ chối file FastQ' size='md'>
                <Stack gap='md'>
                    <Text size='sm' c='dimmed'>
                        Vui lòng nhập lý do từ chối file FastQ này:
                    </Text>
                    <Textarea
                        placeholder='Nhập lý do từ chối...'
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.currentTarget.value)}
                        minRows={3}
                        maxRows={6}
                        maxLength={500}
                        error={rejectReason.length > 500 ? 'Lý do không được quá 500 ký tự' : undefined}
                    />
                    <Text size='xs' c='dimmed' ta='right'>
                        {rejectReason.length}/500 ký tự
                    </Text>
                    <Group justify='flex-end'>
                        <Button variant='light' onClick={handleCloseRejectModal}>
                            Hủy
                        </Button>
                        <Button
                            color='red'
                            onClick={handleRejectFastq}
                            loading={rejectFastqMutation.isPending}
                            disabled={!rejectReason.trim() || rejectReason.length > 500}
                        >
                            Từ chối
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    )
}

export default AnalysisDetailPage
