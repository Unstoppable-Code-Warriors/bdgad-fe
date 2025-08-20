import { useCallback } from 'react'
import { useValidationSessionDetail } from '@/services/hook/validation.hook'
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
import { IconAlertCircle, IconCheck, IconX, IconShieldCheck, IconXboxX } from '@tabler/icons-react'
import { ValidationInfo } from './_components/ValidationInfo'
import { EtlResultHistory } from '@/components/EtlResultHistory'
import { PatientInfo } from '@/components/PatientInfo'
import { PageHeader } from '@/components/PageHeader'
import { ValidationEtlStatus, validationEtlStatusConfig } from '@/types/validation'
import { openRejectEtlResultModal } from '@/components/RejectEtlResultModal'
import { openAcceptEtlResultModal } from '@/components/AcceptEtlResultModal'
import { EtlResultActionsCenter } from '@/components/EtlResultActionsCenter'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import AIChatbotAside from './_components/ai-chatbot-aside'
import { useAppShell } from '@/stores/appshell.store'
import AIChatbotButton from './_components/ai-chatbot-btn'

const ValidationDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data, isLoading, error, refetch } = useValidationSessionDetail(id)
    const { aside } = useAppShell()

    // Get the latest ETL result from the array
    const latestEtlResult = data?.etlResults && data.etlResults.length > 0 ? data.etlResults[0] : null

    const handleBack = () => {
        navigate('/validation')
    }

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
                            Đang tải thông tin thẩm định...
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
                        {error?.message || 'Đã xảy ra lỗi khi tải thông tin thẩm định'}
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
                        Không tìm thấy thông tin thẩm định
                    </Text>
                </Center>
            </Container>
        )
    }

    return (
        <>
            <PanelGroup direction='horizontal'>
                <Panel>
                    <Container size='xl' py='lg'>
                        <Stack gap='xl'>
                            {/* Page Header */}
                            <PageHeader
                                onBack={handleBack}
                                title='Chi tiết thẩm định'
                                pageType='validation'
                                labcode={Array.isArray(data.labcode) ? data.labcode : [data.labcode]}
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
                                    <Card
                                        shadow='sm'
                                        radius='lg'
                                        p='xl'
                                        withBorder
                                        h='fit-content'
                                        pos='sticky'
                                        top={80}
                                    >
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
                                            {/* ETL Result Actions */}
                                            {latestEtlResult &&
                                                (latestEtlResult.htmlResult || latestEtlResult.excelResult) && (
                                                    <>
                                                        <Text size='sm' fw={500} c='teal'>
                                                            Kết quả phân tích
                                                        </Text>
                                                        <EtlResultActionsCenter
                                                            htmlResult={latestEtlResult.htmlResult}
                                                            excelResult={latestEtlResult.excelResult}
                                                            status={latestEtlResult.status}
                                                        />
                                                    </>
                                                )}
                                            <Divider />

                                            {/* Validation Actions */}
                                            {latestEtlResult?.status === ValidationEtlStatus.WAIT_FOR_APPROVAL && (
                                                <Stack gap='md'>
                                                    <Text size='sm' fw={500} c='teal'>
                                                        Chờ thẩm định kết quả
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
                                results={data.etlResults}
                                statusConfig={validationEtlStatusConfig}
                                title='Lịch sử kết quả phân tích'
                                subtitle='Theo dõi các kết quả phân tích đã hoàn thành'
                            />
                        </Stack>
                    </Container>
                </Panel>

                <PanelResizeHandle className='ml-4' />
                <Panel hidden={!aside} maxSize={50} minSize={30} defaultSize={40} className='border-l border-gray-200'>
                    <AIChatbotAside excelFilePath={latestEtlResult?.excelResult || ''} />
                </Panel>
            </PanelGroup>
            <AIChatbotButton />
        </>
    )
}

export default ValidationDetailPage
