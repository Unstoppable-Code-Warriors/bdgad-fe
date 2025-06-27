import { useCallback, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
    Title,
    TextInput,
    Select,
    Group,
    Stack,
    Paper,
    Button,
    Badge,
    ActionIcon,
    Alert,
    Modal,
    Text,
    Textarea
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { DataTable, type DataTableColumn, type DataTableSortStatus } from 'mantine-datatable'
import {
    IconSearch,
    IconCalendar,
    IconFilter,
    IconX,
    IconRefresh,
    IconAlertCircle,
    IconDownload,
    IconCheck,
    IconX as IconReject,
    IconEye
} from '@tabler/icons-react'
import {
    validationEtlStatusConfig,
    ValidationEtlStatus,
    type ValidationFilter,
    type ValidationSessionWithLatestEtlResponse
} from '@/types/validation'
import {
    useValidationPatients,
    useDownloadValidationEtlResult,
    useRejectEtlResult,
    useAcceptEtlResult
} from '@/services/hook/validation.hook'
import { useDebouncedValue } from '@mantine/hooks'
import { useSearchParamState } from '@/hooks/use-search-params'
import { notifications } from '@mantine/notifications'
import { useForm } from '@mantine/form'

const getStatusColor = (status: string) => {
    return validationEtlStatusConfig[status as keyof typeof validationEtlStatusConfig]?.color || 'gray'
}

const getStatusLabel = (status: string) => {
    return validationEtlStatusConfig[status as keyof typeof validationEtlStatusConfig]?.label || status
}

const ValidationPage = () => {
    const navigate = useNavigate()
    const [isDownloading, setIsDownloading] = useState(false)
    const [rejectModalOpened, setRejectModalOpened] = useState(false)
    const [acceptModalOpened, setAcceptModalOpened] = useState(false)
    const [selectedEtlResult, setSelectedEtlResult] = useState<number | null>(null)

    // URL state management
    const [page, setPage] = useSearchParamState({
        key: 'page',
        initValue: 1
    })
    const [limit, setLimit] = useSearchParamState({
        key: 'limit',
        initValue: 10
    })
    const [search, setSearch] = useSearchParamState({
        key: 'search',
        initValue: ''
    })
    const [sortBy, setSortBy] = useSearchParamState({
        key: 'sortBy',
        initValue: 'createdAt'
    })
    const [sortOrder, setSortOrder] = useSearchParamState({
        key: 'sortOrder',
        initValue: 'DESC'
    })

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null])

    // Debounced search
    const [debouncedSearch] = useDebouncedValue(search, 500)

    // Build filter object
    const filter: ValidationFilter = useMemo(() => {
        const filterObj: ValidationFilter = {}
        if (statusFilter) filterObj.status = statusFilter
        return filterObj
    }, [statusFilter])

    // Fetch data
    const {
        data: validationResponse,
        isLoading,
        error,
        isError,
        refetch
    } = useValidationPatients({
        page: page as number,
        limit: limit as number,
        search: debouncedSearch as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as string,
        filter,
        dateFrom: dateRange[0],
        dateTo: dateRange[1]
    })

    // Mutations
    const downloadEtlResultMutation = useDownloadValidationEtlResult()
    const rejectEtlResultMutation = useRejectEtlResult()
    const acceptEtlResultMutation = useAcceptEtlResult()

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

    // Reset page when search or filters change
    useEffect(() => {
        if (page > 1) setPage(1)
    }, [debouncedSearch, filter, dateRange])

    const handleViewDetail = useCallback(
        (id: number) => {
            navigate(`/validation/${id}`)
        },
        [navigate]
    )

    const handleRefresh = useCallback(() => {
        refetch()
    }, [refetch])

    const handleSort = useCallback(
        (sortStatus: DataTableSortStatus<ValidationSessionWithLatestEtlResponse>) => {
            setSortBy(sortStatus.columnAccessor)
            setSortOrder(sortStatus.direction.toUpperCase())
        },
        [setSortBy, setSortOrder]
    )

    const handleDownloadEtlResult = useCallback(
        async (etlResultId: number) => {
            try {
                setIsDownloading(true)
                const response = await downloadEtlResultMutation.mutateAsync(etlResultId)
                window.open(response.downloadUrl, '_blank')
            } catch (error: any) {
                notifications.show({
                    title: 'Lỗi tải file',
                    message: error.message || 'Không thể tạo link tải xuống',
                    color: 'red'
                })
            } finally {
                setIsDownloading(false)
            }
        },
        [downloadEtlResultMutation]
    )

    const handleOpenRejectModal = useCallback(
        (etlResultId: number) => {
            setSelectedEtlResult(etlResultId)
            setRejectModalOpened(true)
            rejectForm.reset()
        },
        [rejectForm]
    )

    const handleOpenAcceptModal = useCallback(
        (etlResultId: number) => {
            setSelectedEtlResult(etlResultId)
            setAcceptModalOpened(true)
            acceptForm.reset()
        },
        [acceptForm]
    )

    const handleRejectEtlResult = useCallback(
        async (values: { reason: string }) => {
            if (!selectedEtlResult) return

            rejectEtlResultMutation.mutate(
                { etlResultId: selectedEtlResult, data: values },
                {
                    onSuccess: () => {
                        notifications.show({
                            title: 'Thành công',
                            message: 'Kết quả ETL đã được từ chối',
                            color: 'red'
                        })
                        setRejectModalOpened(false)
                        setSelectedEtlResult(null)
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
        [selectedEtlResult, rejectEtlResultMutation]
    )

    const handleAcceptEtlResult = useCallback(
        async (values: { comment: string }) => {
            if (!selectedEtlResult) return

            acceptEtlResultMutation.mutate(
                { etlResultId: selectedEtlResult, data: values },
                {
                    onSuccess: () => {
                        notifications.show({
                            title: 'Thành công',
                            message: 'Kết quả ETL đã được phê duyệt',
                            color: 'green'
                        })
                        setAcceptModalOpened(false)
                        setSelectedEtlResult(null)
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
        [selectedEtlResult, acceptEtlResultMutation]
    )

    const recordsPerPageOptions = [5, 10, 20, 50]

    // Extract data from response
    const validationData = validationResponse?.data || []
    const totalRecords = validationResponse?.meta?.total || 0

    const columns: DataTableColumn<ValidationSessionWithLatestEtlResponse>[] = useMemo(
        () => [
            {
                accessor: 'patient.personalId',
                title: 'CCCD/CMND',
                sortable: true,
                width: 150,
                render: (record) => record.patient?.personalId || '-',
                titleClassName: 'bg-white',
                cellsClassName: 'bg-white'
            },
            {
                accessor: 'patient.fullName',
                title: 'Tên bệnh nhân',
                sortable: true,
                width: 180,
                render: (record) => <Text fw={500}>{record.patient?.fullName || '-'}</Text>
            },
            {
                accessor: 'labcode',
                title: 'Mã xét nghiệm',
                sortable: true,
                width: 120,
                render: (record) => (
                    <Text fw={500} c='blue'>
                        {record.labcode}
                    </Text>
                )
            },
            {
                accessor: 'barcode',
                title: 'Barcode',
                sortable: true,
                width: 120,
                render: (record) => (
                    <Text size='sm' ff='monospace'>
                        {record.barcode}
                    </Text>
                )
            },
            {
                accessor: 'doctor.name',
                title: 'Bác sĩ',
                width: 150,
                render: (record) => record.doctor?.name || '-'
            },
            {
                accessor: 'requestDate',
                title: 'Ngày yêu cầu',
                sortable: true,
                width: 120,
                render: (record) => new Date(record.requestDate).toLocaleDateString('vi-VN')
            },
            {
                accessor: 'latestEtlResult.status',
                title: 'Trạng thái',
                width: 120,
                render: (record) => {
                    const status = record.latestEtlResult?.status
                    if (!status) return '-'

                    return (
                        <Badge color={getStatusColor(status)} size='sm'>
                            {getStatusLabel(status)}
                        </Badge>
                    )
                }
            },
            {
                accessor: 'latestEtlResult.etlCompletedAt',
                title: 'Hoàn thành ETL',
                width: 130,
                render: (record) => {
                    if (!record.latestEtlResult?.etlCompletedAt) return '-'
                    return new Date(record.latestEtlResult.etlCompletedAt).toLocaleDateString('vi-VN')
                }
            },
            {
                accessor: 'actions',
                title: 'Thao tác',
                width: 180,
                render: (record) => {
                    const etlResult = record.latestEtlResult

                    return (
                        <Group gap='xs'>
                            <ActionIcon
                                size='sm'
                                variant='light'
                                color='blue'
                                onClick={() => handleViewDetail(record.id)}
                                title='Xem chi tiết'
                            >
                                <IconEye size={14} />
                            </ActionIcon>

                            {etlResult && (
                                <>
                                    {[
                                        ValidationEtlStatus.WAIT_FOR_APPROVAL,
                                        ValidationEtlStatus.REJECTED,
                                        ValidationEtlStatus.APPROVED
                                    ].includes(etlResult.status as ValidationEtlStatus) && (
                                        <ActionIcon
                                            size='sm'
                                            variant='light'
                                            color='blue'
                                            loading={isDownloading}
                                            onClick={() => handleDownloadEtlResult(etlResult.id)}
                                            title='Tải xuống kết quả'
                                        >
                                            <IconDownload size={14} />
                                        </ActionIcon>
                                    )}

                                    {etlResult.status === ValidationEtlStatus.WAIT_FOR_APPROVAL && (
                                        <>
                                            <ActionIcon
                                                size='sm'
                                                variant='light'
                                                color='green'
                                                onClick={() => handleOpenAcceptModal(etlResult.id)}
                                                title='Phê duyệt'
                                            >
                                                <IconCheck size={14} />
                                            </ActionIcon>
                                            <ActionIcon
                                                size='sm'
                                                variant='light'
                                                color='red'
                                                onClick={() => handleOpenRejectModal(etlResult.id)}
                                                title='Từ chối'
                                            >
                                                <IconReject size={14} />
                                            </ActionIcon>
                                        </>
                                    )}
                                </>
                            )}
                        </Group>
                    )
                }
            }
        ],
        [isDownloading, handleDownloadEtlResult, handleOpenAcceptModal, handleOpenRejectModal, handleViewDetail]
    )

    return (
        <Stack>
            <Title order={2}>Xác thực kết quả ETL</Title>

            {/* Filters */}
            <Paper p='md' withBorder>
                <Stack gap='md'>
                    <Group>
                        <TextInput
                            placeholder='Tìm kiếm theo tên, CCCD, mã xét nghiệm...'
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            style={{ flexGrow: 1 }}
                        />
                        <Button variant='light' leftSection={<IconRefresh size={16} />} onClick={handleRefresh}>
                            Làm mới
                        </Button>
                    </Group>

                    <Group>
                        <Select
                            placeholder='Trạng thái'
                            leftSection={<IconFilter size={16} />}
                            data={[
                                { value: '', label: 'Tất cả trạng thái' },
                                {
                                    value: ValidationEtlStatus.WAIT_FOR_APPROVAL,
                                    label: validationEtlStatusConfig[ValidationEtlStatus.WAIT_FOR_APPROVAL].label
                                },
                                {
                                    value: ValidationEtlStatus.REJECTED,
                                    label: validationEtlStatusConfig[ValidationEtlStatus.REJECTED].label
                                },
                                {
                                    value: ValidationEtlStatus.APPROVED,
                                    label: validationEtlStatusConfig[ValidationEtlStatus.APPROVED].label
                                }
                            ]}
                            value={statusFilter}
                            onChange={(value) => setStatusFilter(value || '')}
                            clearable
                            rightSection={
                                statusFilter && (
                                    <ActionIcon size='xs' variant='transparent' onClick={() => setStatusFilter('')}>
                                        <IconX size={12} />
                                    </ActionIcon>
                                )
                            }
                        />

                        <DatePickerInput
                            type='range'
                            placeholder='Chọn khoảng thời gian'
                            leftSection={<IconCalendar size={16} />}
                            value={dateRange as [Date | null, Date | null]}
                            onChange={(value) =>
                                setDateRange([value[0]?.toString() || null, value[1]?.toString() || null])
                            }
                            clearable
                        />
                    </Group>
                </Stack>
            </Paper>

            {/* Error Alert */}
            {isError && (
                <Alert icon={<IconAlertCircle size='1rem' />} title='Lỗi!' color='red' variant='light'>
                    {error?.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
                </Alert>
            )}

            {/* Data Table */}
            <Paper withBorder>
                <DataTable
                    records={validationData}
                    columns={columns}
                    totalRecords={totalRecords}
                    recordsPerPage={limit as number}
                    page={page as number}
                    onPageChange={setPage}
                    recordsPerPageOptions={recordsPerPageOptions}
                    onRecordsPerPageChange={setLimit}
                    sortStatus={{
                        columnAccessor: sortBy as string,
                        direction: (sortOrder as string).toLowerCase() as 'asc' | 'desc'
                    }}
                    onSortStatusChange={handleSort}
                    fetching={isLoading}
                    noRecordsText='Không có dữ liệu'
                    striped
                    highlightOnHover
                    minHeight={200}
                />
            </Paper>

            {/* Reject Modal */}
            <Modal
                opened={rejectModalOpened}
                onClose={() => setRejectModalOpened(false)}
                title='Từ chối kết quả ETL'
                centered
            >
                <form onSubmit={rejectForm.onSubmit(handleRejectEtlResult)}>
                    <Stack gap='md'>
                        <Textarea
                            label='Lý do từ chối'
                            placeholder='Nhập lý do từ chối kết quả ETL...'
                            required
                            minRows={3}
                            {...rejectForm.getInputProps('reason')}
                        />
                        <Group justify='flex-end'>
                            <Button variant='light' onClick={() => setRejectModalOpened(false)}>
                                Hủy
                            </Button>
                            <Button type='submit' color='red' loading={rejectEtlResultMutation.isPending}>
                                Từ chối
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* Accept Modal */}
            <Modal
                opened={acceptModalOpened}
                onClose={() => setAcceptModalOpened(false)}
                title='Phê duyệt kết quả ETL'
                centered
            >
                <form onSubmit={acceptForm.onSubmit(handleAcceptEtlResult)}>
                    <Stack gap='md'>
                        <Textarea
                            label='Ghi chú (tùy chọn)'
                            placeholder='Nhập ghi chú về việc phê duyệt...'
                            minRows={3}
                            {...acceptForm.getInputProps('comment')}
                        />
                        <Group justify='flex-end'>
                            <Button variant='light' onClick={() => setAcceptModalOpened(false)}>
                                Hủy
                            </Button>
                            <Button type='submit' color='green' loading={acceptEtlResultMutation.isPending}>
                                Phê duyệt
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Stack>
    )
}

export default ValidationPage
