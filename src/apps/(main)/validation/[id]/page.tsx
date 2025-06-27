import { useState, useCallback } from 'react'
import {
    useValidationSessionDetail,
    useDownloadValidationEtlResult,
    useRejectEtlResult,
    useAcceptEtlResult
} from '@/services/hook/validation.hook'
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
import { useForm } from '@mantine/form'

const ValidationDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data, isLoading, error } = useValidationSessionDetail(id)

    // Modal states
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false)

    // Mutations
    const downloadEtlResultMutation = useDownloadValidationEtlResult()
    const rejectEtlResultMutation = useRejectEtlResult()
    const acceptEtlResultMutation = useAcceptEtlResult()

    // Get the latest ETL result
    const latestEtlResult = data?.latestEtlResult

    // Forms
    const rejectForm = useForm({
        initialValues: {
            reason: ''
        },
        validate: {
            reason: (value) => (!value ? 'Lý do từ chối là bắt buộc' : null)
        }
    })

    const acceptForm = useForm({
        initialValues: {
            comment: ''
        }
    })

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
        setIsRejectModalOpen(true)
        rejectForm.reset()
    }, [rejectForm])

    const handleOpenAcceptModal = useCallback(() => {
        setIsAcceptModalOpen(true)
        acceptForm.reset()
    }, [acceptForm])

    const handleRejectEtlResult = useCallback(
        async (values: { reason: string }) => {
            if (!latestEtlResult?.id) return

            rejectEtlResultMutation.mutate(
                { etlResultId: latestEtlResult.id, data: values },
                {
                    onSuccess: () => {
                        notifications.show({
                            title: 'Thành công',
                            message: 'Kết quả ETL đã được từ chối',
                            color: 'red'
                        })
                        setIsRejectModalOpen(false)
                    },
                    onError: (error: any) => {
                        notifications.show({
                            title: 'Lỗi từ chối',
                            message: error.message || 'Không thể từ chối kết quả ETL',
                            color: 'red'
                        })
                    }
                }
            )
        },
        [latestEtlResult?.id, rejectEtlResultMutation]
    )

    const handleAcceptEtlResult = useCallback(
        async (values: { comment: string }) => {
            if (!latestEtlResult?.id) return

            acceptEtlResultMutation.mutate(
                { etlResultId: latestEtlResult.id, data: values },
                {
                    onSuccess: () => {
                        notifications.show({
                            title: 'Thành công',
                            message: 'Kết quả ETL đã được phê duyệt',
                            color: 'green'
                        })
                        setIsAcceptModalOpen(false)
                    },
                    onError: (error: any) => {
                        notifications.show({
                            title: 'Lỗi phê duyệt',
                            message: error.message || 'Không thể phê duyệt kết quả ETL',
                            color: 'red'
                        })
                    }
                }
            )
        },
        [latestEtlResult?.id, acceptEtlResultMutation]
    )

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
                    title='Chi tiết xác thực'
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
                            <PatientInfo patient={data.patient} doctor={data.doctor} doctorTitle='Bác sĩ yêu cầu' />
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
                                            Thao tác với kết quả xác thực
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
                                                Kết quả ETL đã sẵn sàng
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
                                                loading={acceptEtlResultMutation.isPending}
                                                disabled={acceptEtlResultMutation.isPending}
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
                                                loading={rejectEtlResultMutation.isPending}
                                                disabled={rejectEtlResultMutation.isPending}
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
                                            Quá trình xác thực hoàn tất
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
                <EtlResultHistory validation={data} />
            </Stack>

            {/* Enhanced Reject Modal */}
            <Modal
                opened={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                title={
                    <Group gap='sm'>
                        <ThemeIcon size='lg' color='red' variant='light'>
                            <IconX size={20} />
                        </ThemeIcon>
                        <Box>
                            <Text fw={600} size='lg'>
                                Từ chối kết quả ETL
                            </Text>
                            <Text size='sm' c='dimmed'>
                                Nhập lý do để từ chối kết quả này
                            </Text>
                        </Box>
                    </Group>
                }
                size='md'
                radius='lg'
                centered
            >
                <form onSubmit={rejectForm.onSubmit(handleRejectEtlResult)}>
                    <Stack gap='lg'>
                        <Alert color='orange' variant='light' icon={<IconAlertCircle size={16} />}>
                            Kết quả ETL sẽ được đánh dấu là bị từ chối và cần phải xử lý lại.
                        </Alert>

                        <Textarea
                            label='Lý do từ chối'
                            placeholder='Nhập lý do từ chối kết quả ETL chi tiết...'
                            required
                            minRows={4}
                            maxRows={8}
                            maxLength={500}
                            error={
                                rejectForm.getInputProps('reason').error ||
                                (rejectForm.values.reason.length > 500 ? 'Lý do không được quá 500 ký tự' : undefined)
                            }
                            radius='md'
                            {...rejectForm.getInputProps('reason')}
                        />

                        <Group justify='space-between'>
                            <Text size='xs' c='dimmed'>
                                {rejectForm.values.reason.length}/500 ký tự
                            </Text>
                            <Group>
                                <Button variant='light' onClick={() => setIsRejectModalOpen(false)} radius='lg'>
                                    Hủy bỏ
                                </Button>
                                <Button
                                    type='submit'
                                    color='red'
                                    loading={rejectEtlResultMutation.isPending}
                                    disabled={!rejectForm.values.reason.trim() || rejectForm.values.reason.length > 500}
                                    radius='lg'
                                >
                                    Xác nhận từ chối
                                </Button>
                            </Group>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* Enhanced Accept Modal */}
            <Modal
                opened={isAcceptModalOpen}
                onClose={() => setIsAcceptModalOpen(false)}
                title={
                    <Group gap='sm'>
                        <ThemeIcon size='lg' color='green' variant='light'>
                            <IconCheck size={20} />
                        </ThemeIcon>
                        <Box>
                            <Text fw={600} size='lg'>
                                Phê duyệt kết quả ETL
                            </Text>
                            <Text size='sm' c='dimmed'>
                                Xác nhận phê duyệt kết quả này
                            </Text>
                        </Box>
                    </Group>
                }
                size='md'
                radius='lg'
                centered
            >
                <form onSubmit={acceptForm.onSubmit(handleAcceptEtlResult)}>
                    <Stack gap='lg'>
                        <Alert color='green' variant='light' icon={<IconCheck size={16} />}>
                            Kết quả ETL sẽ được đánh dấu là đã phê duyệt và hoàn tất quy trình.
                        </Alert>

                        <Textarea
                            label='Ghi chú (tùy chọn)'
                            placeholder='Nhập ghi chú về việc phê duyệt...'
                            minRows={3}
                            maxRows={6}
                            maxLength={300}
                            error={
                                acceptForm.values.comment.length > 300 ? 'Ghi chú không được quá 300 ký tự' : undefined
                            }
                            radius='md'
                            {...acceptForm.getInputProps('comment')}
                        />

                        <Group justify='space-between'>
                            <Text size='xs' c='dimmed'>
                                {acceptForm.values.comment.length}/300 ký tự
                            </Text>
                            <Group>
                                <Button variant='light' onClick={() => setIsAcceptModalOpen(false)} radius='lg'>
                                    Hủy bỏ
                                </Button>
                                <Button
                                    type='submit'
                                    color='green'
                                    loading={acceptEtlResultMutation.isPending}
                                    disabled={acceptForm.values.comment.length > 300}
                                    radius='lg'
                                >
                                    Xác nhận phê duyệt
                                </Button>
                            </Group>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Container>
    )
}

export default ValidationDetailPage
