import { useCallback, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Title, TextInput, Group, Stack, Paper, Badge, ActionIcon, Alert, Tooltip, Text, Tabs, Select } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { DataTable, type DataTableColumn, type DataTableSortStatus } from 'mantine-datatable'
import {
    IconSearch,
    IconCalendar,
    IconEye,
    IconRefresh,
    IconAlertCircle,
    IconLoader,
    IconCheck,
} from '@tabler/icons-react'
import { analysisStatusConfig, AnalysisStatus, type AnalysisFilter } from '@/types/analysis'
import { useAnalysisSessions, useProcessAnalysis } from '@/services/hook/analysis.hook'
import { useDebouncedValue } from '@mantine/hooks'
import { useSearchParamState } from '@/hooks/use-search-params'
import { notifications } from '@mantine/notifications'
import type { AnalysisSessionListItem } from '@/types/analysis'
import { EtlResultActionsCenter } from '@/components/EtlResultActionsCenter'

const getStatusColor = (status: string) => {
    return analysisStatusConfig[status as keyof typeof analysisStatusConfig]?.color || 'gray'
}

const getStatusLabel = (status: string) => {
    return analysisStatusConfig[status as keyof typeof analysisStatusConfig]?.label || status
}

const ETLManagementPage = () => {
    const navigate = useNavigate()

    // URL state management - separate search for each tab
    const [page, setPage] = useSearchParamState({ key: 'page', initValue: 1 })
    const [limit, setLimit] = useSearchParamState({ key: 'limit', initValue: 10 })
    const [searchProcessing, setSearchProcessing] = useSearchParamState({ key: 'searchProcessing', initValue: '' })
    const [searchResults, setSearchResults] = useSearchParamState({ key: 'searchResults', initValue: '' })
    const [sortBy, setSortBy] = useSearchParamState({ key: 'sortBy', initValue: 'createdAt' })
    const [sortOrder, setSortOrder] = useSearchParamState({ key: 'sortOrder', initValue: 'DESC' })
    const [activeTab, setActiveTab] = useSearchParamState({ key: 'tab', initValue: 'processing' })
    const [statusFilterProcessing, setStatusFilterProcessing] = useSearchParamState({ 
        key: 'statusProcessing', 
        initValue: 'not_yet_processing' 
    })
    const [statusFilterResults, setStatusFilterResults] = useSearchParamState({ 
        key: 'statusResults', 
        initValue: 'wait_for_approval' 
    })

    // Get current status filter based on active tab
    const statusFilter = activeTab === 'processing' ? statusFilterProcessing : statusFilterResults
    const setStatusFilter = activeTab === 'processing' ? setStatusFilterProcessing : setStatusFilterResults

    // Get current search based on active tab
    const search = activeTab === 'processing' ? searchProcessing : searchResults
    const setSearch = activeTab === 'processing' ? setSearchProcessing : setSearchResults

    // Separate date range state for each tab
    const [dateRangeProcessing, setDateRangeProcessing] = useState<[string | null, string | null]>([null, null])
    const [dateRangeResults, setDateRangeResults] = useState<[string | null, string | null]>([null, null])
    
    // Get current date range based on active tab
    const dateRange = activeTab === 'processing' ? dateRangeProcessing : dateRangeResults
    const setDateRange = activeTab === 'processing' ? setDateRangeProcessing : setDateRangeResults

    // Debounced search
    const [debouncedSearch] = useDebouncedValue(search, 1000)

    // Build filter object
    const filter: AnalysisFilter = useMemo(() => {
        const filterObj: AnalysisFilter = {}
        
        if (debouncedSearch) {
            filterObj.search = debouncedSearch
        }
        
        if (dateRange[0] && dateRange[1]) {
            filterObj.dateFrom = dateRange[0]
            filterObj.dateTo = dateRange[1]
        }
        
        return filterObj
    }, [debouncedSearch, dateRange])

    // Map activeTab and statusFilter to filterEtl
    const getFilterEtl = () => {
        if (!statusFilter) return null
        
        if (activeTab === 'processing') {
            return statusFilter as 'not_yet_processing' | 'processing' | 'completed' | 'failed'
        } else if (activeTab === 'results') {
            return statusFilter as 'wait_for_approval' | 'approved' | 'rejected'
        }
        return null
    }
    
    const filterEtl = getFilterEtl()

    // Get status options based on active tab
    const getStatusOptions = () => {
        if (activeTab === 'processing') {
            return [
                { value: 'not_yet_processing', label: 'Chưa xử lý' },
                { value: 'processing', label: 'Đang xử lý' },
                { value: 'completed', label: 'Hoàn thành' },
                { value: 'failed', label: 'Thất bại' }
            ]
        } else {
            return [
                { value: 'wait_for_approval', label: 'Chờ phê duyệt' },
                { value: 'approved', label: 'Đã phê duyệt' },
                { value: 'rejected', label: 'Từ chối' }
            ]
        }
    }

    // Fetch data
    const {
        data: analysisResponse,
        isLoading,
        error,
        isError
    } = useAnalysisSessions({
        page: page as number,
        limit: limit as number,
        search: debouncedSearch as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as string,
        dateFrom: dateRange[0],
        dateTo: dateRange[1],
        filterFastq: null,
        filterEtl
    })

    // Mutations
    const processAnalysisMutation = useProcessAnalysis()

    // Reset page when search or filters change
    useEffect(() => {
        if (page > 1) setPage(1)
    }, [debouncedSearch, filter, dateRange, activeTab, statusFilter])

    const handleViewDetail = useCallback(
        (id: number) => {
            const currentParams = new URLSearchParams()
            currentParams.set('page', String(page))
            currentParams.set('limit', String(limit))
            currentParams.set('tab', String(activeTab))
            if (searchProcessing) currentParams.set('searchProcessing', String(searchProcessing))
            if (searchResults) currentParams.set('searchResults', String(searchResults))
            if (statusFilterProcessing) currentParams.set('statusProcessing', String(statusFilterProcessing))
            if (statusFilterResults) currentParams.set('statusResults', String(statusFilterResults))
            if (sortBy) currentParams.set('sortBy', String(sortBy))
            if (sortOrder) currentParams.set('sortOrder', String(sortOrder))
            if (dateRangeProcessing[0]) currentParams.set('dateFromProcessing', dateRangeProcessing[0])
            if (dateRangeProcessing[1]) currentParams.set('dateToProcessing', dateRangeProcessing[1])
            if (dateRangeResults[0]) currentParams.set('dateFromResults', dateRangeResults[0])
            if (dateRangeResults[1]) currentParams.set('dateToResults', dateRangeResults[1])
            
            navigate(`/analysis/${id}?returnTo=/analysis/etl&${currentParams.toString()}`)
        },
        [navigate, page, limit, activeTab, searchProcessing, searchResults, statusFilterProcessing, statusFilterResults, sortBy, sortOrder, dateRangeProcessing, dateRangeResults]
    )

    const handleSort = useCallback(
        (sortStatus: DataTableSortStatus<AnalysisSessionListItem>) => {
            setSortBy(sortStatus.columnAccessor)
            setSortOrder(sortStatus.direction.toUpperCase())
        },
        [setSortBy, setSortOrder]
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
                )
            },
            {
                accessor: 'barcode',
                title: 'Barcode',
                sortable: true,
                width: 100,
                render: (record) => record.barcode || '-'
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
                title: 'Ngày yêu cầu',
                width: 120,
                render: (record) => {
                    const dbDate = record.requestDateAnalysis
                    const d = new Date(dbDate)
                    return <Text size='sm'>{d.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</Text>
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
                accessor: 'etlActions',
                title: 'Kết quả ETL',
                width: 200,
                render: (record) => (
                    <EtlResultActionsCenter
                        htmlResult={record.latestEtlResult?.htmlResult || null}
                        excelResult={record.latestEtlResult?.excelResult || null}
                        status={record.latestEtlResult?.status || null}
                        justify='center'
                    />
                )
            },
            {
                accessor: 'actions',
                title: 'Thao tác',
                width: 100,
                textAlign: 'center',
                render: (record) => (
                    <Group gap='xs' justify='center'>
                        <Tooltip label='Xem chi tiết'>
                            <ActionIcon variant='light' color='blue' onClick={() => handleViewDetail(record.id)}>
                                <IconEye size={16} />
                            </ActionIcon>
                        </Tooltip>

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
                )
            }
        ],
        [handleViewDetail, handleRetryEtlResult, processAnalysisMutation.isPending]
    )

    return (
        <>
            <Stack gap='lg' p='md'>
                {/* Header */}
                <Group justify='space-between'>
                    <Title order={2}>Quản lý kết quả ETL</Title>
                </Group>

                {/* Error Alert */}
                {isError && (
                    <Alert icon={<IconAlertCircle size={16} />} title='Lỗi tải dữ liệu' color='red' variant='light'>
                        {error?.message || 'Không thể tải danh sách kết quả ETL. Vui lòng thử lại.'}
                    </Alert>
                )}

                {/* Tabs for different ETL categories */}
                <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'processing')}>
                    <Tabs.List>
                        <Tabs.Tab value='processing' leftSection={<IconLoader size={16} />}>
                            Đang xử lý
                        </Tabs.Tab>
                        <Tabs.Tab value='results' leftSection={<IconCheck size={16} />}>
                            Kết quả ETL
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value={activeTab} pt='md'>
                        {/* Search and Filter Controls */}
                        <Paper shadow='sm' p='lg' withBorder mb='lg'>
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
                                <Select
                                    placeholder='Chọn trạng thái'
                                    data={getStatusOptions()}
                                    value={statusFilter}
                                    onChange={(value) => setStatusFilter(value || '')}
                                    clearable
                                />
                            </Group>
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
                                noRecordsText='Không có dữ liệu'
                                minHeight={150}
                                verticalSpacing='md'
                                striped
                                highlightOnHover
                            />
                        </Paper>
                    </Tabs.Panel>
                </Tabs>
            </Stack>
        </>
    )
}

export default ETLManagementPage
