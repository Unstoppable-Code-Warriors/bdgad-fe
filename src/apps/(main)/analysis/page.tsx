import { useCallback, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Title, Group, Stack, Paper, Button, Badge, ActionIcon, Alert } from '@mantine/core'
import { DataTable, type DataTableColumn } from 'mantine-datatable'
import { IconEye, IconRefresh, IconAlertCircle, IconDownload, IconPlayerPlay } from '@tabler/icons-react'
import { analysisStatusConfig, AnalysisStatus, type AnalysisFilter } from '@/types/analysis'
import { useAnalysisSessions, useProcessAnalysis, useDownloadEtlResult } from '@/services/hook/analysis.hook'
import { notifications } from '@mantine/notifications'
import type { AnalysisSessionListItem } from '@/types/analysis'
import { FastQFileStatus } from '@/types/lab-test.types'
import { ListSearchFilter, type SelectOption } from '@/components/ListSearchFilter'
import { useListState } from '@/hooks/use-list-state'

const getStatusColor = (status: string) => {
    return analysisStatusConfig[status as keyof typeof analysisStatusConfig]?.color || 'gray'
}

const getStatusLabel = (status: string) => {
    return analysisStatusConfig[status as keyof typeof analysisStatusConfig]?.label || status
}

const AnalysisPage = () => {
    const navigate = useNavigate()
    const [isDownloading, setIsDownloading] = useState(false)

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
    } = useListState<AnalysisFilter>({
        defaultSortBy: 'createdAt',
        defaultSortOrder: 'DESC'
    })

    // Fetch data
    const {
        data: analysisResponse,
        isLoading,
        error,
        isError,
        refetch
    } = useAnalysisSessions({
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
    const processAnalysisMutation = useProcessAnalysis()
    const downloadEtlResultMutation = useDownloadEtlResult()

    // Status options for the filter
    const statusOptions: SelectOption[] = [
        { value: AnalysisStatus.PROCESSING, label: 'Đang xử lý' },
        { value: AnalysisStatus.COMPLETED, label: 'Hoàn thành' },
        { value: AnalysisStatus.FAILED, label: 'Thất bại' }
    ]

    const handleViewDetail = useCallback(
        (id: number) => {
            navigate(`/analysis/${id}`)
        },
        [navigate]
    )

    const handleRefresh = useCallback(() => {
        refetch()
    }, [refetch])

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

    const recordsPerPageOptions = [5, 10, 20, 50]

    // Extract data from response
    const analysisData = analysisResponse?.data || []
    const totalRecords = analysisResponse?.meta?.total || 0

    const columns: DataTableColumn<AnalysisSessionListItem>[] = useMemo(
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
                title: 'Trạng thái phân tích',
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
                        {record.latestFastqFile?.status === FastQFileStatus.WAIT_FOR_APPROVAL && (
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
                        {record.latestEtlResult?.status === AnalysisStatus.COMPLETED && (
                            <ActionIcon
                                variant='light'
                                color='teal'
                                onClick={() => handleDownloadEtlResult(record.latestEtlResult!.id)}
                                loading={isDownloading}
                            >
                                <IconDownload size={16} />
                            </ActionIcon>
                        )}

                        {/* Retry ETL Result - only show for failed results with available FastQ */}
                        {record.latestEtlResult?.status === AnalysisStatus.FAILED && record.latestFastqFile?.id && (
                            <ActionIcon
                                variant='light'
                                color='orange'
                                onClick={() => handleRetryEtlResult(record.latestFastqFile!.id)}
                                loading={processAnalysisMutation.isPending}
                                title='Thử lại phân tích'
                            >
                                <IconRefresh size={16} />
                            </ActionIcon>
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

            {/* Reusable Search and Filter Component */}
            <ListSearchFilter
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder='Tìm kiếm theo CCCD hoặc tên bệnh nhân...'
                statusFilter={filter.etlStatus}
                onStatusFilterChange={(value) => updateFilter({ etlStatus: value || undefined })}
                statusOptions={statusOptions}
                statusPlaceholder='Lọc theo trạng thái phân tích'
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onRefresh={handleRefresh}
                isLoading={isLoading}
                totalRecords={totalRecords}
                showRefreshButton={false} // We have it in the header
            />

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
                    sortStatus={sortStatus}
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
