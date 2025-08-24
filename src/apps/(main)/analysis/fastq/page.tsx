import { useCallback, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Title, TextInput, Group, Stack, Paper, Badge, ActionIcon, Alert, Tooltip, Text, Tabs } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { DataTable, type DataTableColumn, type DataTableSortStatus } from 'mantine-datatable'
import {
    IconSearch,
    IconCalendar,
    IconEye,
    IconX,
    IconAlertCircle,
    IconPlayerPlay,
    IconClock,
    IconCheck,
    IconBan
} from '@tabler/icons-react'
import { analysisStatusConfig, type AnalysisFilter } from '@/types/analysis'
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

const FastQManagementPage = () => {
    const navigate = useNavigate()

    // URL state management
    const [page, setPage] = useSearchParamState({ key: 'page', initValue: 1 })
    const [limit, setLimit] = useSearchParamState({ key: 'limit', initValue: 10 })
    const [search, setSearch] = useSearchParamState({ key: 'search', initValue: '' })
    const [sortBy, setSortBy] = useSearchParamState({ key: 'sortBy', initValue: 'createdAt' })
    const [sortOrder, setSortOrder] = useSearchParamState({ key: 'sortOrder', initValue: 'DESC' })
    const [activeTab, setActiveTab] = useSearchParamState({ key: 'status', initValue: 'wait_for_approval' })

    // Filters
    const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null])

    // Debounced search
    const [debouncedSearch] = useDebouncedValue(search, 1000)

    // Build filter object
    const filter: AnalysisFilter = useMemo(() => {
        return {}
    }, [])

    // Map activeTab to filterFastq
    const filterFastq = activeTab === 'all' ? null : (activeTab as 'wait_for_approval' | 'approved' | 'rejected')

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
        filterFastq,
        filterEtl: null
    })

    // Mutations
    const processAnalysisMutation = useProcessAnalysis()

    // Reset page when search or filters change
    useEffect(() => {
        if (page > 1) setPage(1)
    }, [debouncedSearch, filter, dateRange, activeTab])

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
    console.log(analysisData)

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
                width: 150,
                render: (record) => record.barcode || '-'
            },
            {
                accessor: 'technician.name',
                title: 'Kỹ thuật viên xét nghiệm',
                sortable: true,
                width: 180,
                render: (record) => {
                    return <Text>{record?.labTesting?.name || '-'}</Text>
                }
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
                accessor: 'latestFastqPairFile.status',
                title: 'Trạng thái FastQ file',
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

                        {record.latestFastqPairFile?.status === FastQFileStatus.WAIT_FOR_APPROVAL && (
                            <>
                                <Tooltip label='Phê duyệt và bắt đầu phân tích'>
                                    <ActionIcon
                                        variant='light'
                                        color='green'
                                        onClick={() => handleProcessAnalysis(record.latestFastqPairFile!.id)}
                                        loading={processAnalysisMutation.isPending}
                                    >
                                        <IconPlayerPlay size={16} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label='Từ chối FastQ'>
                                    <ActionIcon
                                        variant='light'
                                        color='red'
                                        onClick={() => handleRejectFastq(record.latestFastqPairFile!.id)}
                                    >
                                        <IconX size={16} />
                                    </ActionIcon>
                                </Tooltip>
                            </>
                        )}
                    </Group>
                )
            }
        ],
        [handleViewDetail, handleProcessAnalysis, handleRejectFastq, processAnalysisMutation.isPending]
    )

    return (
        <>
            <Stack gap='lg' p='md'>
                {/* Header */}
                <Group justify='space-between'>
                    <Title order={2}>Quản lý FastQ Files</Title>
                </Group>

                {/* Error Alert */}
                {isError && (
                    <Alert icon={<IconAlertCircle size={16} />} title='Lỗi tải dữ liệu' color='red' variant='light'>
                        {error?.message || 'Không thể tải danh sách FastQ. Vui lòng thử lại.'}
                    </Alert>
                )}

                {/* Tabs for different statuses */}
                <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'wait_for_approval')}>
                    <Tabs.List>
                        <Tabs.Tab value='wait_for_approval' leftSection={<IconClock size={16} />}>
                            Chờ phê duyệt
                        </Tabs.Tab>
                        <Tabs.Tab value='approved' leftSection={<IconCheck size={16} />}>
                            Đã phê duyệt
                        </Tabs.Tab>
                        <Tabs.Tab value='rejected' leftSection={<IconBan size={16} />}>
                            Từ chối
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

export default FastQManagementPage
