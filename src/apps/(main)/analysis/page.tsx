import { useCallback, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Title, TextInput, Select, Group, Stack, Paper, Badge, ActionIcon, Alert, Tooltip, Text } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { DataTable, type DataTableColumn, type DataTableSortStatus } from 'mantine-datatable'
import {
    IconSearch,
    IconCalendar,
    IconEye,
    IconX,
    IconRefresh,
    IconAlertCircle,
    IconPlayerPlay
} from '@tabler/icons-react'
import { analysisStatusConfig, AnalysisStatus, type AnalysisFilter } from '@/types/analysis'
import { useAnalysisSessions, useProcessAnalysis } from '@/services/hook/analysis.hook'
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
    const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null])
    const [filterFastq, setFilterFastq] = useState<string | null>(null)
    const [filterEtl, setFilterEtl] = useState<string | null>(null)

    // Debounced search
    const [debouncedSearch] = useDebouncedValue(search, 1000)

    // Filter options
    const fastqFilterOptions = [
        { value: 'wait_for_approval', label: 'Chờ phê duyệt' },
        { value: 'approved', label: 'Đã phê duyệt' },
        { value: 'rejected', label: 'Từ chối' }
    ]

    const etlFilterOptions = [
        { value: 'not_yet_processing', label: 'Chưa xử lý' },
        { value: 'processing', label: 'Đang xử lý' },
        { value: 'completed', label: 'Hoàn thành' },
        { value: 'failed', label: 'Thất bại' },
        { value: 'wait_for_approval', label: 'Chờ phê duyệt' },
        { value: 'rejected', label: 'Từ chối' },
        { value: 'approved', label: 'Đã phê duyệt' }
    ]

    // Build filter object
    const filter: AnalysisFilter = useMemo(() => {
        const filterObj: AnalysisFilter = {}
        return filterObj
    }, [])

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
        dateTo: dateRange[1],
        filterFastq: filterFastq as 'wait_for_approval' | 'approved' | 'rejected' | null,
        filterEtl: filterEtl as
            | 'processing'
            | 'completed'
            | 'failed'
            | 'wait_for_approval'
            | 'rejected'
            | 'approved'
            | 'not_yet_processing'
            | null
    })

    // Mutations
    const processAnalysisMutation = useProcessAnalysis()

    // Reset page when search or filters change
    useEffect(() => {
        if (page > 1) setPage(1)
    }, [debouncedSearch, filter, dateRange, filterFastq, filterEtl])

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
        (fastqPairId: number) => {
            openRejectFastqModal({
                fastqPairId,
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
                accessor: 'labcode',
                title: 'Labcode',
                width: 120,
                render: (record) => (
                    <Text>{Array.isArray(record.labcode) ? record.labcode.join(', ') : record.labcode}</Text>
                ),
                titleClassName: 'bg-white',
                cellsClassName: 'bg-white'
            },
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
                title: 'Ngày Yêu Cầu',
                sortable: true,
                width: 130,
                render: (record) => new Date(record.requestDateAnalysis).toLocaleDateString('vi-VN')
            },
            {
                accessor: 'latestFastqPairFile.status',
                title: 'Trạng thái FastQ',
                width: 140,
                render: (record) => {
                    const status = record.latestFastqPairFile?.status
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
                        {record.latestFastqPairFile?.status === FastQFileStatus.WAIT_FOR_APPROVAL && (
                            <Tooltip label='Bắt đầu phân tích'>
                                <ActionIcon
                                    variant='light'
                                    color='green'
                                    onClick={() => handleProcessAnalysis(record.latestFastqPairFile!.id)}
                                    loading={processAnalysisMutation.isPending}
                                >
                                    <IconPlayerPlay size={16} />
                                </ActionIcon>
                            </Tooltip>
                        )}

                        {/* Reject FastQ Button - only show for files waiting for approval */}
                        {record.latestFastqPairFile?.status === FastQFileStatus.WAIT_FOR_APPROVAL && (
                            <Tooltip label='Từ chối FastQ'>
                                <ActionIcon
                                    variant='light'
                                    color='red'
                                    onClick={() => handleRejectFastq(record.latestFastqPairFile!.id)}
                                >
                                    <IconX size={16} />
                                </ActionIcon>
                            </Tooltip>
                        )}

                        {/* Retry ETL Result - only show for failed results with available FastQ */}
                        {record.latestEtlResult?.status === AnalysisStatus.FAILED &&
                            record.latestFastqPairFile?.fastqFileR1.id && (
                                <Tooltip label='Thử lại phân tích'>
                                    <ActionIcon
                                        variant='light'
                                        color='orange'
                                        onClick={() => handleRetryEtlResult(record.latestFastqPairFile!.id)}
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
            handleRetryEtlResult,
            processAnalysisMutation.isPending
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

            {/* Search and Filter Controls */}
            <Paper shadow='sm' p='lg' withBorder>
                <Stack gap='md'>
                    <Group grow>
                        <TextInput
                            placeholder='Tìm kiếm theo mã labcode, barcode'
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(event) => setSearch(event.currentTarget.value)}
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
                    <Group grow>
                        <div>
                            <Text size='sm' fw={500} mb='xs'>
                                Lọc theo trạng thái FastQ
                            </Text>
                            <Select
                                placeholder='Chọn trạng thái FastQ'
                                data={fastqFilterOptions}
                                value={filterFastq}
                                onChange={setFilterFastq}
                                clearable
                            />
                        </div>
                        <div>
                            <Text size='sm' fw={500} mb='xs'>
                                Lọc theo trạng thái ETL
                            </Text>
                            <Select
                                placeholder='Chọn trạng thái ETL'
                                data={etlFilterOptions}
                                value={filterEtl}
                                onChange={setFilterEtl}
                                clearable
                            />
                        </div>
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
