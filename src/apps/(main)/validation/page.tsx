import { useCallback, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Title, Group, Stack, Paper, Button, Badge, ActionIcon, Alert, Modal, Text, Textarea } from '@mantine/core'
import { DataTable, type DataTableColumn } from 'mantine-datatable'
import {
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
import { notifications } from '@mantine/notifications'
import { useForm } from '@mantine/form'
import { ListSearchFilter, type SelectOption } from '@/components/ListSearchFilter'
import { useListState } from '@/hooks/use-list-state'

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

    // Use the new list state hook
    const {
        search,
        debouncedSearch,
        setSearch,
        page,
        setPage,
        limit,
        setLimit,
        sortStatus,
        handleSort,
        filter,
        updateFilter,
        dateRange,
        setDateRange
    } = useListState<ValidationFilter>({
        defaultSortBy: 'createdAt',
        defaultSortOrder: 'DESC'
    })

    // Status filter from the main filter object
    const statusFilter = filter.status || ''

    // Fetch data
    const {
        data: validationResponse,
        isLoading,
        error,
        isError,
        refetch
    } = useValidationPatients({
        page,
        limit,
        search: debouncedSearch,
        sortBy: sortStatus.columnAccessor,
        sortOrder: sortStatus.direction.toUpperCase(),
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

    // Status options for the filter
    const statusOptions: SelectOption[] = [
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
    ]

    const handleViewDetail = useCallback(
        (id: number) => {
            navigate(`/validation/${id}`)
        },
        [navigate]
    )

    const handleRefresh = useCallback(() => {
        refetch()
    }, [refetch])

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
            <Group justify='space-between'>
                <Title order={2}>Xác thực kết quả ETL</Title>
                <Button
                    leftSection={<IconRefresh size={16} />}
                    variant='light'
                    onClick={handleRefresh}
                    loading={isLoading}
                >
                    Làm mới
                </Button>
            </Group>

            {/* Reusable Search and Filter Component */}
            <ListSearchFilter
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder='Tìm kiếm theo tên, CCCD, mã xét nghiệm...'
                statusFilter={statusFilter}
                onStatusFilterChange={(value) => updateFilter({ status: value || undefined })}
                statusOptions={statusOptions}
                statusPlaceholder='Trạng thái'
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onRefresh={handleRefresh}
                isLoading={isLoading}
                totalRecords={totalRecords}
                showRefreshButton={false} // We have it in the header
            />

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
                    recordsPerPage={limit}
                    page={page}
                    onPageChange={setPage}
                    recordsPerPageOptions={recordsPerPageOptions}
                    onRecordsPerPageChange={setLimit}
                    sortStatus={sortStatus}
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
