import { useCallback, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Title, TextInput, Select, Group, Stack, Paper, Button, Badge, ActionIcon, Alert } from '@mantine/core'
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
import { analysisStatusConfig, ANALYSIS_STATUS, type AnalysisFilter } from '@/types/analysis'
import { useAnalysisSessions, useProcessAnalysis, useDownloadEtlResult } from '@/services/hook/analysis.hook'
import { useDebouncedValue } from '@mantine/hooks'
import { useSearchParamState } from '@/hooks/use-search-params'
import { notifications } from '@mantine/notifications'
import type { AnalysisSessionListItem } from '@/types/analysis'

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
    const [dateFromFilter, setDateFromFilter] = useState<Date | null>(null)
    const [dateToFilter, setDateToFilter] = useState<Date | null>(null)

    // Debounced search
    const [debouncedSearch] = useDebouncedValue(search, 500)

    // Build filter object
    const filter: AnalysisFilter = useMemo(() => {
        const filterObj: AnalysisFilter = {}
        if (etlStatusFilter) filterObj.etlStatus = etlStatusFilter
        return filterObj
    }, [etlStatusFilter])

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
        dateFrom: dateFromFilter,
        dateTo: dateToFilter
    })

    // Mutations
    const processAnalysisMutation = useProcessAnalysis()
    const downloadEtlResultMutation = useDownloadEtlResult()

    // Reset page when search or filters change
    useEffect(() => {
        if (page > 1) setPage(1)
    }, [debouncedSearch, filter, dateFromFilter, dateToFilter])

    const handleViewDetail = useCallback(
        (id: number) => {
            navigate(`/analysis/${id}`)
        },
        [navigate]
    )

    const handleRefresh = useCallback(() => {
        refetch()
    }, [refetch])

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

    const recordsPerPageOptions = [5, 10, 20, 50]

    // Extract data from response
    const analysisData = analysisResponse?.data || []
    const totalRecords = analysisResponse?.meta?.total || 0

    const columns: DataTableColumn<AnalysisSessionListItem>[] = useMemo(
        () => [
            {
                accessor: 'labcode',
                title: 'Mã phòng thí nghiệm',
                sortable: true,
                width: 180
            },
            {
                accessor: 'barcode',
                title: 'Mã vạch',
                sortable: true,
                width: 150
            },
            {
                accessor: 'patient.personalId',
                title: 'CCCD/CMND',
                sortable: true,
                width: 150,
                render: (record) => record.patient?.personalId || '-'
            },
            {
                accessor: 'patient.fullName',
                title: 'Họ tên bệnh nhân',
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
                accessor: 'requestDate',
                title: 'Ngày yêu cầu',
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
                        <ActionIcon variant='light' color='blue' onClick={() => handleViewDetail(record.id)}>
                            <IconEye size={16} />
                        </ActionIcon>

                        {/* Process Analysis Button - only show for approved FastQ files */}
                        {record.latestFastqFile?.status === ANALYSIS_STATUS.APPROVED &&
                            (!record.latestEtlResult ||
                                record.latestEtlResult.status !== ANALYSIS_STATUS.PROCESSING) && (
                                <ActionIcon
                                    variant='light'
                                    color='green'
                                    onClick={() => handleProcessAnalysis(record.latestFastqFile!.id)}
                                    loading={processAnalysisMutation.isPending}
                                >
                                    <IconPlayerPlay size={16} />
                                </ActionIcon>
                            )}

                        {/* Download ETL Result - only show for completed results */}
                        {record.latestEtlResult?.status === ANALYSIS_STATUS.COMPLETED && (
                            <ActionIcon
                                variant='light'
                                color='teal'
                                onClick={() => handleDownloadEtlResult(record.latestEtlResult!.id)}
                                loading={isDownloading}
                            >
                                <IconDownload size={16} />
                            </ActionIcon>
                        )}
                    </Group>
                )
            }
        ],
        [
            handleViewDetail,
            handleProcessAnalysis,
            handleDownloadEtlResult,
            processAnalysisMutation.isPending,
            isDownloading
        ]
    )

    return (
        <Stack gap='lg'>
            {/* Header */}
            <Group justify='space-between'>
                <Title order={2}>Quản lý phân tích</Title>
                <Button
                    leftSection={<IconRefresh size={16} />}
                    variant='light'
                    onClick={handleRefresh}
                    loading={isLoading}
                >
                    Làm mới
                </Button>
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
                            placeholder='Tìm kiếm theo CCCD hoặc tên bệnh nhân...'
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(event) => setSearch(event.currentTarget.value)}
                        />
                        <Select
                            placeholder='Lọc theo trạng thái ETL'
                            leftSection={<IconFilter size={16} />}
                            data={[
                                { value: '', label: 'Tất cả trạng thái' },
                                { value: ANALYSIS_STATUS.PROCESSING, label: 'Đang xử lý' },
                                { value: ANALYSIS_STATUS.COMPLETED, label: 'Hoàn thành' },
                                { value: ANALYSIS_STATUS.FAILED, label: 'Thất bại' }
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
                        />
                    </Group>

                    <Group grow>
                        <DatePickerInput
                            placeholder='Từ ngày'
                            leftSection={<IconCalendar size={16} />}
                            value={dateFromFilter}
                            onChange={setDateFromFilter}
                            clearable
                        />
                        <DatePickerInput
                            placeholder='Đến ngày'
                            leftSection={<IconCalendar size={16} />}
                            value={dateToFilter}
                            onChange={setDateToFilter}
                            clearable
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
                    onRecordsPerPageChange={setLimit}
                    sortStatus={{
                        columnAccessor: sortBy as string,
                        direction: (sortOrder as string).toLowerCase() as 'asc' | 'desc'
                    }}
                    onSortStatusChange={handleSort}
                    fetching={isLoading}
                    noRecordsText='Không có dữ liệu phân tích'
                    minHeight={150}
                    verticalSpacing='md'
                    striped
                    highlightOnHover
                />
            </Paper>
        </Stack>
    )
}

export default AnalysisPage
