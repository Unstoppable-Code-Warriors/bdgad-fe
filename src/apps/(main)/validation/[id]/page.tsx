import { useCallback } from 'react'
import { useValidationSessionDetail, useDownloadValidationEtlResult } from '@/services/hook/validation.hook'
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
    Title
} from '@mantine/core'
import { IconAlertCircle, IconDownload, IconCheck, IconX, IconShieldCheck, IconXboxX } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { ValidationInfo, EtlResultHistory } from './_components'
import { PatientInfo } from '@/components/PatientInfo'
import { PageHeader } from '@/components/PageHeader'
import { ValidationEtlStatus } from '@/types/validation'
import { openRejectEtlResultModal } from '@/components/RejectEtlResultModal'
import { openAcceptEtlResultModal } from '@/components/AcceptEtlResultModal'

const ValidationDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data, isLoading, error, refetch } = useValidationSessionDetail(id)

    // Mutations
    const downloadEtlResultMutation = useDownloadValidationEtlResult()

    // Get the latest ETL result
    const latestEtlResult = data?.latestEtlResult

    const handleBack = () => {
        navigate('/validation')
    }

    const handleDownloadEtlResult = useCallback(async () => {
        if (!latestEtlResult?.id) {
            notifications.show({
                title: 'Lỗi',
                message: 'Không tìm thấy kết quả ETL để tải xuống',
                color: 'red'
            })
            return
        }

        try {
            const response = await downloadEtlResultMutation.mutateAsync(latestEtlResult.id)
            window.open(response.downloadUrl, '_blank')
        } catch (error: any) {
            notifications.show({
                title: 'Lỗi tải file',
                message: error.message || 'Không thể tạo link tải xuống',
                color: 'red'
            })
        }
    }, [latestEtlResult?.id, downloadEtlResultMutation])

    const handleOpenRejectModal = useCallback(() => {
        if (!latestEtlResult?.id) return

        openRejectEtlResultModal({
            etlResultId: latestEtlResult.id,
            onSuccess: () => {
                refetch()
            }
        })
    }, [latestEtlResult?.id, refetch])

    const handleOpenAcceptModal = useCallback(() => {
        if (!latestEtlResult?.id) return

        openAcceptEtlResultModal({
            etlResultId: latestEtlResult.id,
            onSuccess: () => {
                refetch()
            }
        })
    }, [latestEtlResult?.id, refetch])

    if (isLoading) {
        return (
            <Container size='xl' py='xl'>
                <Center h={400}>
                    <Stack align='center' gap='lg'>
                        <Loader size='lg' color='teal' />
                        <Text size='lg' fw={500}>
                            Đang tải thông tin xác thực...
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
                    <Alert icon={<IconAlertCircle size='1rem' />} title='Lỗi!' color='red' variant='light'>
                        {error?.message || 'Đã xảy ra lỗi khi tải thông tin xác thực'}
                    </Alert>
                </Center>
            </Container>
        )
    }

    if (!data) {
        return (
            <Container size='xl' py='xl'>
                <Center h={400}>
                    <Text size='lg' c='dimmed'>
                        Không tìm thấy thông tin xác thực
                    </Text>
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
                    title='Chi tiết thẩm định'
                    pageType='validation'
                    labcode={data.labcode}
                    barcode={data.barcode}
                />

                {/* Main Content Grid */}
                <Grid gutter='xl'>
                    {/* Left Column - Validation & Patient Info */}
                    <Grid.Col span={{ base: 12, lg: 8 }}>
                        <Stack gap='xl'>
                            {/* Validation Information */}
                            <ValidationInfo validation={data} />

                            {/* Patient Information */}
                            <PatientInfo
                                patient={data.patient}
                                doctor={data.doctor}
                                doctorTitle='Bác sĩ yêu cầu'
                                validationTitle='Người thẩm định'
                            />
                        </Stack>
                    </Grid.Col>

                    {/* Right Column - Action Panel */}
                    <Grid.Col span={{ base: 12, lg: 4 }}>
                        <Card shadow='sm' radius='lg' p='xl' withBorder h='fit-content' pos='sticky' top={80}>
                            <Stack gap='lg'>
                                <Group gap='sm'>
                                    <ThemeIcon size='lg' radius='md' variant='light' color='teal'>
                                        <IconShieldCheck size={20} />
                                    </ThemeIcon>
                                    <Box>
                                        <Title order={4}>Hành động</Title>
                                        <Text size='sm' c='dimmed'>
                                            Thao tác với kết quả thẩm định
                                        </Text>
                                    </Box>
                                </Group>

                                <Divider />

                                {/* Download Section */}
                                {latestEtlResult &&
                                    [
                                        ValidationEtlStatus.WAIT_FOR_APPROVAL,
                                        ValidationEtlStatus.REJECTED,
                                        ValidationEtlStatus.APPROVED
                                    ].includes(latestEtlResult.status as ValidationEtlStatus) && (
                                        <Stack gap='md'>
                                            <Text size='sm' fw={500} c='blue'>
                                                Kết quả phân tích đã sẵn sàng
                                            </Text>
                                            <Button
                                                color='blue'
                                                onClick={handleDownloadEtlResult}
                                                leftSection={<IconDownload size={16} />}
                                                loading={downloadEtlResultMutation.isPending}
                                                disabled={downloadEtlResultMutation.isPending}
                                                fullWidth
                                                size='md'
                                                radius='lg'
                                            >
                                                Tải xuống kết quả
                                            </Button>
                                        </Stack>
                                    )}

                                {/* Validation Actions */}
                                {latestEtlResult?.status === ValidationEtlStatus.WAIT_FOR_APPROVAL && (
                                    <>
                                        {/* Add divider if download section exists */}
                                        {latestEtlResult && <Divider />}

                                        <Stack gap='md'>
                                            <Text size='sm' fw={500} c='teal'>
                                                Chờ xác thực kết quả
                                            </Text>
                                            <Button
                                                color='green'
                                                onClick={handleOpenAcceptModal}
                                                leftSection={<IconCheck size={16} />}
                                                fullWidth
                                                size='md'
                                                radius='lg'
                                            >
                                                Phê duyệt
                                            </Button>
                                            <Button
                                                color='red'
                                                variant='light'
                                                onClick={handleOpenRejectModal}
                                                leftSection={<IconX size={16} />}
                                                fullWidth
                                                size='md'
                                                radius='lg'
                                            >
                                                Từ chối
                                            </Button>
                                        </Stack>
                                    </>
                                )}

                                {/* Status Indicators */}
                                {latestEtlResult?.status === ValidationEtlStatus.APPROVED && (
                                    <Stack gap='md' align='center'>
                                        <ThemeIcon size='xl' radius='xl' variant='light' color='green'>
                                            <IconCheck size={24} />
                                        </ThemeIcon>
                                        <Text size='sm' ta='center' c='green' fw={500}>
                                            Kết quả đã được phê duyệt
                                        </Text>
                                        <Text size='xs' ta='center' c='dimmed'>
                                            Quá trình thẩm định hoàn tất
                                        </Text>
                                    </Stack>
                                )}

                                {latestEtlResult?.status === ValidationEtlStatus.REJECTED && (
                                    <Stack gap='md' align='center'>
                                        <ThemeIcon size='xl' radius='xl' variant='light' color='red'>
                                            <IconX size={24} />
                                        </ThemeIcon>
                                        <Text size='sm' ta='center' c='red' fw={500}>
                                            Kết quả đã bị từ chối
                                        </Text>
                                        <Text size='xs' ta='center' c='dimmed'>
                                            Cần xem lại và xử lý lại
                                        </Text>
                                    </Stack>
                                )}

                                {!latestEtlResult && (
                                    <Stack gap='md' align='center'>
                                        <ThemeIcon size='xl' radius='xl' variant='light' color='gray'>
                                            <IconXboxX size={24} />
                                        </ThemeIcon>
                                        <Text size='sm' ta='center' c='dimmed' fw={500}>
                                            Chưa có kết quả ETL
                                        </Text>
                                        <Text size='xs' ta='center' c='dimmed'>
                                            Chờ phân tích hoàn tất
                                        </Text>
                                    </Stack>
                                )}
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>

                {/* ETL Result History */}
                <EtlResultHistory
                    actions={[
                        {
                            type: 'download',
                            label: 'Tải xuống',
                            icon: <IconDownload size={16} />,
                            color: 'teal',
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
                            handler: handleDownloadEtlResult
                        }
                        // {
                        //     type: 'send',
                        //     label: 'Gửi để xác thực',
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
                    ]}
                    validation={data}
                />
            </Stack>
        </Container>
    )
}

export default ValidationDetailPage
