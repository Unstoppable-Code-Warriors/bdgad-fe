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
    Tooltip,
    Text
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { DataTable, type DataTableColumn, type DataTableSortStatus } from 'mantine-datatable'
import {
    IconSearch,
    IconCalendar,
    IconEye,
    IconFilter,
    IconX,
    IconRefresh,
    IconAlertCircle,
    IconDownload,
    IconPlayerPlay
} from '@tabler/icons-react'
import { analysisStatusConfig, AnalysisStatus, type AnalysisFilter } from '@/types/analysis'
import { useAnalysisSessions, useProcessAnalysis, useDownloadEtlResult } from '@/services/hook/analysis.hook'
import { useDebouncedValue } from '@mantine/hooks'
import { useSearchParamState } from '@/hooks/use-search-params'
import { notifications } from '@mantine/notifications'
import type { AnalysisSessionListItem } from '@/types/analysis'
import { FastQFileStatus } from '@/types/lab-test.types'
import { openRejectFastqModal } from '@/components/RejectFastqModal'

const getStatusColor = (status: string) => {
    return analysisStatusConfig[status as keyof typeof analysisStatusConfig]?.color || 'gray'
}

const getStatusLabel = (status: string) => {
    return analysisStatusConfig[status as keyof typeof analysisStatusConfig]?.label || status
}

const AnalysisPage = () => {
    const navigate = useNavigate()
    const [isDownloading, setIsDownloading] = useState(false)

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
    const [etlStatusFilter, setEtlStatusFilter] = useState<string>('')
    const [etlApprovalStatusFilter, setEtlApprovalStatusFilter] = useState<string>('')
    const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null])

    // Debounced search
    const [debouncedSearch] = useDebouncedValue(search, 1000)

    // Build filter object
    const filter: AnalysisFilter = useMemo(() => {
        const filterObj: AnalysisFilter = {}
        if (etlStatusFilter) filterObj.etlStatus = etlStatusFilter
        if (etlApprovalStatusFilter) filterObj.etlApprovalStatus = etlApprovalStatusFilter
        return filterObj
    }, [etlStatusFilter, etlApprovalStatusFilter])

    // Fetch data
    const {
        data: analysisResponse,
        isLoading,
        error,
        isError,
        refetch
    } = useAnalysisSessions({
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
    const processAnalysisMutation = useProcessAnalysis()
    const downloadEtlResultMutation = useDownloadEtlResult()

    // Reset page when search or filters change
    useEffect(() => {
        if (page > 1) setPage(1)
    }, [debouncedSearch, filter, dateRange])

    const handleViewDetail = useCallback(
        (id: number) => {
            navigate(`/analysis/${id}`)
        },
        [navigate]
    )

    const handleSort = useCallback(
        (sortStatus: DataTableSortStatus<AnalysisSessionListItem>) => {
            setSortBy(sortStatus.columnAccessor)
            setSortOrder(sortStatus.direction.toUpperCase())
        },
        [setSortBy, setSortOrder]
    )

    const handleProcessAnalysis = useCallback(
        async (fastqFileId: number) => {
            processAnalysisMutation.mutate(fastqFileId, {
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
        },
        [processAnalysisMutation]
    )

    const handleDownloadEtlResult = useCallback(
        async (etlResultId: number) => {
            try {
                setIsDownloading(true)
                const response = await downloadEtlResultMutation.mutateAsync(etlResultId)
                // Open the download URL in a new window/tab
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

    const handleRetryEtlResult = useCallback(
        async (fastqFileId: number) => {
            processAnalysisMutation.mutate(fastqFileId, {
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
        },
        [processAnalysisMutation]
    )

    const handleRejectFastq = useCallback(
        (fastqFileId: number) => {
            openRejectFastqModal({
                fastqFileId,
                onSuccess: () => {
                    refetch()
                }
            })
        },
        [refetch]
    )

    const recordsPerPageOptions = [5, 10, 20, 50]

    // Extract data from response
    const analysisData = analysisResponse?.data || []
    const totalRecords = analysisResponse?.meta?.total || 0

    const columns: DataTableColumn<AnalysisSessionListItem>[] = useMemo(
        () => [
            {
                accessor: 'barcode',
                title: 'Barcode',
                sortable: true,
                width: 150,
                render: (record) => record.barcode || '-',
                titleClassName: 'bg-white',
                cellsClassName: 'bg-white'
            },
            {
                accessor: 'patient.fullName',
                title: 'Tên bệnh nhân',
                sortable: true,
                width: 200,
                render: (record) => record.patient?.fullName || '-'
            },
            {
                accessor: 'doctor.name',
                title: 'Bác sĩ',
                sortable: true,
                width: 150,
                render: (record) => record.doctor?.name || '-'
            },
            {
                accessor: 'validation.name',
                title: 'KTV Thẩm Định',
                sortable: true,
                width: 150,
                render: (record) => (
                    <Text size='sm'>{record.validation ? record.validation.name : 'Chưa chỉ định'}</Text>
                )
            },
            {
                accessor: 'requestDate',
                title: 'Ngày chỉ định',
                sortable: true,
                width: 130,
                render: (record) => new Date(record.requestDate).toLocaleDateString('vi-VN')
            },
            {
                accessor: 'latestFastqFile.status',
                title: 'Trạng thái FastQ',
                width: 140,
                render: (record) => {
                    const status = record.latestFastqFile?.status
                    if (!status) return <Badge color='gray'>Chưa có file</Badge>
                    return (
                        <Badge color={getStatusColor(status)} variant='light'>
                            {getStatusLabel(status)}
                        </Badge>
                    )
                }
            },
            {
                accessor: 'latestEtlResult.status',
                title: 'Trạng thái ETL',
                width: 140,
                render: (record) => {
                    const status = record.latestEtlResult?.status
                    if (!status) return <Badge color='gray'>Chưa xử lý</Badge>
                    return (
                        <Badge color={getStatusColor(status)} variant='light'>
                            {getStatusLabel(status)}
                        </Badge>
                    )
                }
            },
            {
                accessor: 'actions',
                title: 'Thao tác',
                width: 150,
                textAlign: 'center',
                render: (record) => (
                    <Group gap='xs' justify='center'>
                        <Tooltip label='Xem chi tiết'>
                            <ActionIcon variant='light' color='blue' onClick={() => handleViewDetail(record.id)}>
                                <IconEye size={16} />
                            </ActionIcon>
                        </Tooltip>

                        {/* Process Analysis Button - only show for approved FastQ files */}
                        {record.latestFastqFile?.status === FastQFileStatus.WAIT_FOR_APPROVAL && (
                            <Tooltip label='Bắt đầu phân tích'>
                                <ActionIcon
                                    variant='light'
                                    color='green'
                                    onClick={() => handleProcessAnalysis(record.latestFastqFile!.id)}
                                    loading={processAnalysisMutation.isPending}
                                >
                                    <IconPlayerPlay size={16} />
                                </ActionIcon>
                            </Tooltip>
                        )}

                        {/* Reject FastQ Button - only show for files waiting for approval */}
                        {record.latestFastqFile?.status === FastQFileStatus.WAIT_FOR_APPROVAL && (
                            <Tooltip label='Từ chối FastQ'>
                                <ActionIcon
                                    variant='light'
                                    color='red'
                                    onClick={() => handleRejectFastq(record.latestFastqFile!.id)}
                                >
                                    <IconX size={16} />
                                </ActionIcon>
                            </Tooltip>
                        )}

                        {/* Download ETL Result - only show for completed results */}
                        {record.latestEtlResult?.status === AnalysisStatus.COMPLETED && (
                            <Tooltip label='Tải xuống kết quả'>
                                <ActionIcon
                                    variant='light'
                                    color='teal'
                                    onClick={() => handleDownloadEtlResult(record.latestEtlResult!.id)}
                                    loading={isDownloading}
                                >
                                    <IconDownload size={16} />
                                </ActionIcon>
                            </Tooltip>
                        )}

                        {/* Retry ETL Result - only show for failed results with available FastQ */}
                        {record.latestEtlResult?.status === AnalysisStatus.FAILED && record.latestFastqFile?.id && (
                            <Tooltip label='Thử lại phân tích'>
                                <ActionIcon
                                    variant='light'
                                    color='orange'
                                    onClick={() => handleRetryEtlResult(record.latestFastqFile!.id)}
                                    loading={processAnalysisMutation.isPending}
                                >
                                    <IconRefresh size={16} />
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </Group>
                ),
                titleClassName: 'bg-white',
                cellsClassName: 'bg-white'
            }
        ],
        [
            handleViewDetail,
            handleProcessAnalysis,
            handleRejectFastq,
            handleDownloadEtlResult,
            handleRetryEtlResult,
            processAnalysisMutation.isPending,
            isDownloading
        ]
    )

    return (
        <Stack gap='lg'>
            {/* Header */}
            <Group justify='space-between'>
                <Title order={2}>Quản lý phân tích</Title>
            </Group>

            {/* Error Alert */}
            {isError && (
                <Alert icon={<IconAlertCircle size={16} />} title='Lỗi tải dữ liệu' color='red' variant='light'>
                    {error?.message || 'Không thể tải danh sách phân tích. Vui lòng thử lại.'}
                </Alert>
            )}

            {/* Search and Filters */}
            <Paper shadow='sm' p='lg' withBorder>
                <Stack gap='md'>
                    <Group grow>
                        <TextInput
                            placeholder='Tìm kiếm theo barcode'
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(event) => setSearch(event.currentTarget.value)}
                        />
                        {/* <Select
                            placeholder='Lọc theo trạng thái phân tích'
                            leftSection={<IconFilter size={16} />}
                            data={[
                                { value: '', label: 'Tất cả trạng thái' },
                                { value: AnalysisStatus.PROCESSING, label: 'Đang xử lý' },
                                { value: AnalysisStatus.COMPLETED, label: 'Hoàn thành' },
                                { value: AnalysisStatus.FAILED, label: 'Thất bại' }
                            ]}
                            value={etlStatusFilter}
                            onChange={(value) => setEtlStatusFilter(value || '')}
                            clearable
                            rightSection={
                                etlStatusFilter && (
                                    <ActionIcon size='sm' variant='transparent' onClick={() => setEtlStatusFilter('')}>
                                        <IconX size={12} />
                                    </ActionIcon>
                                )
                            }
                        /> */}
                        <Select
                            placeholder='Lọc theo trạng thái ETL'
                            leftSection={<IconFilter size={16} />}
                            data={[
                                { value: '', label: 'Tất cả trạng thái ETL' },
                                { value: AnalysisStatus.REJECTED, label: 'Từ chối' },
                                { value: AnalysisStatus.APPROVED, label: 'Đã phê duyệt' },
                                { value: AnalysisStatus.WAIT_FOR_APPROVAL, label: 'Chờ phê duyệt' },
                                { value: AnalysisStatus.PROCESSING, label: 'Đang xử lý' },
                                { value: AnalysisStatus.COMPLETED, label: 'Hoàn thành' },
                                { value: AnalysisStatus.FAILED, label: 'Thất bại' }
                            ]}
                            value={etlApprovalStatusFilter}
                            onChange={(value) => setEtlApprovalStatusFilter(value || '')}
                            clearable
                            rightSection={
                                etlApprovalStatusFilter && (
                                    <ActionIcon
                                        size='sm'
                                        variant='transparent'
                                        onClick={() => setEtlApprovalStatusFilter('')}
                                    >
                                        <IconX size={12} />
                                    </ActionIcon>
                                )
                            }
                        />
                        <DatePickerInput
                            type='range'
                            placeholder='Chọn khoảng thời gian'
                            leftSection={<IconCalendar size={16} />}
                            value={dateRange}
                            onChange={setDateRange}
                            clearable
                            maxDate={new Date()}
                        />
                    </Group>
                </Stack>
            </Paper>

            {/* Data Table */}
            <Paper shadow='sm' withBorder>
                <DataTable
                    records={analysisData}
                    columns={columns}
                    totalRecords={totalRecords}
                    recordsPerPage={limit}
                    page={page}
                    onPageChange={setPage}
                    recordsPerPageOptions={recordsPerPageOptions}
                    recordsPerPageLabel='Số bản ghi mỗi trang'
                    onRecordsPerPageChange={setLimit}
                    sortStatus={{
                        columnAccessor: sortBy as string,
                        direction: (sortOrder as string).toLowerCase() as 'asc' | 'desc'
                    }}
                    paginationText={({ from, to, totalRecords }) =>
                        `Hiển thị ${from} - ${to} của ${totalRecords} bản ghi`
                    }
                    onSortStatusChange={handleSort}
                    fetching={isLoading}
                    noRecordsText='Không có dữ liệu phân tích'
                    minHeight={150}
                    verticalSpacing='md'
                    striped
                    highlightOnHover
                    pinFirstColumn
                    pinLastColumn
                />
            </Paper>
        </Stack>
    )
}

export default AnalysisPage
