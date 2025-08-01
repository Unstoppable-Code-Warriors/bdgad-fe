import { useCallback, useState, useMemo } from 'react'
import { useDebouncedValue } from '@mantine/hooks'
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

const getStatusColor = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.color || 'gray'
}

const getStatusLabel = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.label || status
}

const LabTestPage = () => {
    const navigate = useNavigate()
    const [isDownloading, setIsDownloading] = useState(false)

    // Replace useListState with direct state management
    const [search, setSearch] = useState('')
    const [debouncedSearch] = useDebouncedValue(search, 500)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [sortStatus, setSortStatus] = useState({
        columnAccessor: 'createdAt',
        direction: 'desc' as 'asc' | 'desc'
    })
    const [filter, setFilter] = useState<LabTestFilter>({})
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])

    // Helper functions
    const handleSort = useCallback((newSortStatus: any) => {
        setSortStatus(newSortStatus)
        setPage(1)
    }, [])

    const updateFilter = useCallback((newFilter: Partial<LabTestFilter>) => {
        setFilter((prev) => ({ ...prev, ...newFilter }))
        setPage(1)
    }, [])

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
                    <Text>{Array.isArray(record.labcode) ? record.labcode.join(', ') : record.labcode}</Text>
                ),
                titleClassName: 'bg-white',
                cellsClassName: 'bg-white'
            },
            {
                accessor: 'barcode',
                title: 'Barcode',
                width: 120,
                render: (record) => <Text>{record.barcode}</Text>
            },
            {
                accessor: 'doctor.name',
                title: 'Bác sĩ',
                width: 150,
                render: (record) => <Text size='sm'>{record?.doctor?.name || 'Chưa được chỉ định'}</Text>
            },
            {
                accessor: 'analysis.name',
                title: 'KTV Phân tích',
                width: 150,
                render: (record) => (
                    <Text size='sm'>
                        {record?.analysis?.name
                            ? record?.analysis?.name === 'Unknown'
                                ? 'Chưa được chỉ định'
                                : record?.analysis?.name
                            : 'Chưa được chỉ định'}
                    </Text>
                )
            },
            {
                accessor: 'requestDate',
                title: 'Ngày yêu cầu',
                width: 120,
                render: (record) => <Text size='sm'>{new Date(record.requestDate).toLocaleDateString('vi-VN')}</Text>
            },
            {
                accessor: 'fastq',
                title: 'FastQ Files',
                width: 120,
                textAlign: 'center',
                render: (record) => {
                    const fastqPair = record?.latestFastqFilePair
                    if (!fastqPair?.fastqFileR1?.id) {
                        return <Text size='sm'>-</Text>
                    }

                    return (
                        <Group gap={4} justify='center'>
                            <Button
                                variant='light'
                                color='teal'
                                size='xs'
                                leftSection={<IconDownload size={12} />}
                                onClick={() => handleDownloadFastQ(fastqPair.fastqFileR1.id)}
                                loading={isDownloading}
                            >
                                R1
                            </Button>
                            {fastqPair.fastqFileR2?.id && (
                                <Button
                                    variant='light'
                                    color='blue'
                                    size='xs'
                                    leftSection={<IconDownload size={12} />}
                                    onClick={() => handleDownloadFastQ(fastqPair.fastqFileR2.id)}
                                    loading={isDownloading}
                                >
                                    R2
                                </Button>
                            )}
                        </Group>
                    )
                }
            },
            {
                accessor: 'latestFastqFilePair.status',
                title: 'Trạng thái',
                width: 120,
                render: (record) => (
                    <Badge color={getStatusColor(record?.latestFastqFilePair?.status || '')} variant='light' size='sm'>
                        {getStatusLabel(record?.latestFastqFilePair?.status || 'Chưa tải lên')}
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

    const handlePageChange = useCallback(
        (newPage: number) => {
            setPage(newPage)
        },
        [page]
    )

    const handleLimitChange = useCallback((newLimit: number) => {
        setLimit(newLimit)
        setPage(1)
    }, [])

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
                onDateRangeChange={(value) => {
                    if (Array.isArray(value) && (typeof value[0] === 'string' || typeof value[1] === 'string')) {
                        setDateRange([
                            value[0] ? new Date(value[0] as string) : null,
                            value[1] ? new Date(value[1] as string) : null
                        ])
                    } else {
                        setDateRange(value as [Date | null, Date | null])
                    }
                }}
                onRefresh={handleRefresh}
                isLoading={isLoading}
                totalRecords={totalRecords}
                showRefreshButton={false}
            />

            {/* Data Table */}
            <Paper withBorder shadow='sm'>
                <DataTable
                    records={labTestData}
                    columns={columns}
                    totalRecords={totalRecords}
                    recordsPerPage={limit}
                    recordsPerPageOptions={recordsPerPageOptions}
                    onRecordsPerPageChange={handleLimitChange}
                    page={page}
                    onPageChange={handlePageChange}
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
                    pinFirstColumn
                    pinLastColumn
                />
            </Paper>
        </Stack>
    )
}

export default LabTestPage
