import { useCallback, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Title, Group, Stack, Paper, Button, Badge, Text, ActionIcon, Alert, Tooltip } from '@mantine/core'
import { DataTable, type DataTableColumn } from 'mantine-datatable'
import { IconEye, IconAlertCircle, IconDownload } from '@tabler/icons-react'
import { statusConfig, LAB_TEST_STATUS, type LabTestFilter, type LabTestStatus } from '@/types/lab-test.types'
import { useLabTestSessions } from '@/services/hook/lab-test.hook'
import { labTestService } from '@/services/function/lab-test'
import { notifications } from '@mantine/notifications'
import type { LabTestSessionListItem } from '@/types/lab-test'
import { ListSearchFilter, type SelectOption } from '@/components/ListSearchFilter'
import { useListState } from '@/hooks/use-list-state'

const getStatusColor = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.color || 'gray'
}

const getStatusLabel = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.label || status
}

const LabTestPage = () => {
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
    } = useListState<LabTestFilter>({
        defaultSortBy: 'createdAt',
        defaultSortOrder: 'desc'
    })

    // Fetch data using the hook with proper search params
    const {
        data: labTestResponse,
        isLoading,
        isError,
        error,
        refetch
    } = useLabTestSessions({
        search: debouncedSearch,
        page,
        limit,
        sortBy: sortStatus.columnAccessor,
        sortOrder: sortStatus.direction,
        filter,
        dateFrom: dateRange[0],
        dateTo: dateRange[1]
    })

    // const sendToAnalysisMutation = useSendToAnalysis()

    // Status options for the filter
    const statusOptions: SelectOption[] = Object.values(LAB_TEST_STATUS).map((status) => ({
        value: status,
        label: statusConfig[status as keyof typeof statusConfig]?.label || status
    }))

    const handleViewDetail = useCallback(
        (id: number) => {
            navigate(`/lab-test/${id}`)
        },
        [navigate]
    )

    const handleRefresh = useCallback(() => {
        refetch()
    }, [refetch])

    const handleDownloadFastQ = useCallback(async (fastqFileId: number) => {
        try {
            setIsDownloading(true)
            const response = await labTestService.downloadFastQ(fastqFileId)
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
    }, [])

    // const handleSendToAnalysis = useCallback(async (fastqFileId: number) => {
    //     if (!fastqFileId) {
    //         notifications.show({
    //             title: 'Lỗi',
    //             message: 'Không tìm thấy file FastQ để gửi phân tích',
    //             color: 'red'
    //         })
    //         return
    //     }

    //     sendToAnalysisMutation.mutate(fastqFileId, {
    //         onSuccess: () => {
    //             notifications.show({
    //                 title: 'Thành công',
    //                 message: 'File FastQ đã được gửi phân tích thành công',
    //                 color: 'green'
    //             })
    //         },
    //         onError: (error: any) => {
    //             notifications.show({
    //                 title: 'Lỗi gửi phân tích',
    //                 message: error.message || 'Không thể gửi file FastQ để phân tích',
    //                 color: 'red'
    //             })
    //         }
    //     })
    // }, [])

    const recordsPerPageOptions = [5, 10, 20, 50]

    // Extract data from response
    const labTestData = labTestResponse?.data || []
    const totalRecords = labTestResponse?.meta?.total || 0

    const columns: DataTableColumn<LabTestSessionListItem>[] = useMemo(
        () => [
            {
                accessor: 'labcode',
                title: 'Labcode',
                width: 120,
                render: (record) => (
                    <Text fw={500} c='blue'>
                        {record.labcode}
                    </Text>
                ),
                titleClassName: 'bg-white',
                cellsClassName: 'bg-white'
            },
            {
                accessor: 'barcode',
                title: 'Barcode',
                width: 120,
                render: (record) => (
                    <Text size='sm' ff='monospace'>
                        {record.barcode}
                    </Text>
                )
            },
            {
                accessor: 'patient.fullName',
                title: 'Tên bệnh nhân',
                width: 180,
                render: (record) => <Text fw={500}>{record.patient.fullName}</Text>
            },
            {
                accessor: 'doctor.name',
                title: 'Bác sĩ',
                width: 150
            },
            {
                accessor: 'analysis.name',
                title: 'KTV Phân tích',
                width: 150,
                render: (record) => (
                    <Text size='sm'>{record.analysis ? record.analysis.name : 'Chưa được chỉ định'}</Text>
                )
            },
            {
                accessor: 'requestDate',
                title: 'Ngày chỉ định',
                width: 120,
                render: (record) => <Text size='sm'>{new Date(record.requestDate).toLocaleDateString('vi-VN')}</Text>
            },
            {
                accessor: 'fastq',
                title: 'FastQ File',
                width: 120,
                textAlign: 'center',
                render: (record) =>
                    record?.latestFastqFile?.id ? (
                        <Button
                            variant='light'
                            color='teal'
                            size='xs'
                            leftSection={<IconDownload size={14} />}
                            onClick={() => handleDownloadFastQ(record.latestFastqFile.id)}
                            loading={isDownloading}
                        >
                            FastQ
                        </Button>
                    ) : (
                        <Text size='sm'>-</Text>
                    )
            },
            {
                accessor: 'latestFastqFile.status',
                title: 'Trạng thái',
                width: 120,
                render: (record) => (
                    <Badge color={getStatusColor(record?.latestFastqFile?.status || '')} variant='light' size='sm'>
                        {getStatusLabel(record?.latestFastqFile?.status || 'Chưa tải lên')}
                    </Badge>
                )
            },
            {
                accessor: 'actions',
                title: 'Thao tác',
                width: 100,
                textAlign: 'center',
                render: (record) => (
                    <Group gap='xs' justify='center' bg={'white'}>
                        <Tooltip label='Xem chi tiết'>
                            <ActionIcon variant='light' color='blue' onClick={() => handleViewDetail(record.id)}>
                                <IconEye size={16} />
                            </ActionIcon>
                        </Tooltip>
                        {/* {record.latestFastqFile?.status === 'uploaded' && (
                            <Tooltip label='Gửi phân tích'>
                                <ActionIcon
                                    variant='light'
                                    color='green'
                                    onClick={() => handleSendToAnalysis(record.latestFastqFile.id)}
                                >
                                    <IconSend size={16} />
                                </ActionIcon>
                            </Tooltip>
                        )} */}
                    </Group>
                ),
                titleClassName: 'bg-white',
                cellsClassName: 'bg-white'
            }
        ],
        [handleDownloadFastQ, isDownloading, handleViewDetail]
    )

    return (
        <Stack gap='lg'>
            {/* Header */}
            <Group justify='space-between'>
                <Title order={2}>Quản lý xét nghiệm</Title>
            </Group>

            {/* Error Alert */}
            {isError && (
                <Alert icon={<IconAlertCircle size={16} />} title='Lỗi tải dữ liệu' color='red' variant='light'>
                    {error?.message || 'Không thể tải danh sách xét nghiệm. Vui lòng thử lại.'}
                </Alert>
            )}

            {/* Reusable Search and Filter Component */}
            <ListSearchFilter
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder='Tìm kiếm theo mã labcode, barcode...'
                statusFilter={filter.status}
                onStatusFilterChange={(value) => updateFilter({ status: (value as LabTestStatus) || undefined })}
                statusOptions={statusOptions}
                statusPlaceholder='Lọc theo trạng thái'
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onRefresh={handleRefresh}
                isLoading={isLoading}
                totalRecords={totalRecords}
                showRefreshButton={false} // We have it in the header
            />

            {/* Data Table */}
            <Paper withBorder shadow='sm'>
                <DataTable
                    records={labTestData}
                    columns={columns}
                    totalRecords={totalRecords}
                    recordsPerPage={limit}
                    recordsPerPageOptions={recordsPerPageOptions}
                    onRecordsPerPageChange={setLimit}
                    page={page}
                    onPageChange={setPage}
                    paginationActiveBackgroundColor='blue'
                    loadingText='Đang tải...'
                    noRecordsText='Không có dữ liệu'
                    recordsPerPageLabel='Số bản ghi mỗi trang'
                    paginationText={({ from, to, totalRecords }) =>
                        `Hiển thị ${from} - ${to} của ${totalRecords} bản ghi`
                    }
                    minHeight={200}
                    verticalSpacing='sm'
                    horizontalSpacing='md'
                    highlightOnHover
                    withTableBorder
                    withColumnBorders
                    striped
                    fetching={isLoading}
                    sortStatus={sortStatus}
                    onSortStatusChange={handleSort}
                    pinLastColumn
                    pinFirstColumn
                />
            </Paper>
        </Stack>
    )
}

export default LabTestPage
