import { useCallback, useState, useMemo } from 'react'
import { useDebouncedValue } from '@mantine/hooks'
import { useNavigate } from 'react-router'
import { Title, Group, Stack, Paper, Button, Badge, Text, ActionIcon, Alert, Tooltip, Tabs } from '@mantine/core'
import { DataTable, type DataTableColumn } from 'mantine-datatable'
import { IconEye, IconAlertCircle, IconDownload } from '@tabler/icons-react'
import { statusConfig, LAB_TEST_STATUS, type LabTestFilter, type LabTestStatus } from '@/types/lab-test.types'
import { useLabTestSessions } from '@/services/hook/lab-test.hook'
import { labTestService } from '@/services/function/lab-test'
import { notifications } from '@mantine/notifications'
import type { LabTestSessionListItem } from '@/types/lab-test'
import { ListSearchFilter } from '@/components/ListSearchFilter'
import {
    cancerScreeningPackageOptions,
    niptPackageOptions,
    cancerPanelOptions,
    formTypeOptions,
    sampleTypeOptions
} from '@/types/prescription-form'

const createMappingFromOptions = (options: Array<{ value: string; label: string }>): Record<string, string> => {
    const mapping: Record<string, string> = {}
    options.forEach((option) => {
        mapping[option.value] = option.label
    })
    return mapping
}

const packageTypeMapping: Record<string, string> = {
    // Cancer screening packages
    ...createMappingFromOptions(cancerScreeningPackageOptions),
    // NIPT packages
    ...createMappingFromOptions(niptPackageOptions),
    // Cancer panels
    ...createMappingFromOptions(cancerPanelOptions),
    // Form types
    ...createMappingFromOptions(formTypeOptions)
}

const sampleTypeMapping = Object.fromEntries(sampleTypeOptions.map((option) => [option.value, option.label]))

const getDescriptionLabcodeName = (value: string | undefined, mapping: Record<string, string>): string => {
    if (!value) return '-'
    return mapping[value] || value
}

const getStatusColor = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.color || 'gray'
}

const getStatusLabel = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.label || status
}

const LabTestPage = () => {
    const navigate = useNavigate()
    const [isDownloading, setIsDownloading] = useState(false)
    const [activeTab, setActiveTab] = useState<string>('processing')

    // Replace useListState with direct state management
    const [search, setSearch] = useState('')
    const [debouncedSearch] = useDebouncedValue(search, 500)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [sortStatus, setSortStatus] = useState({
        columnAccessor: 'createdAt',
        direction: 'desc' as 'asc' | 'desc'
    })
    const [filter] = useState<LabTestFilter>({})
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
    const [processingStatusFilter, setProcessingStatusFilter] = useState<string | null>(null)

    // Helper functions
    const handleSort = useCallback((newSortStatus: any) => {
        setSortStatus(newSortStatus)
        setPage(1)
    }, [])

    const handleTabChange = useCallback((value: string | null) => {
        if (value) {
            setActiveTab(value)
            setPage(1)
            setProcessingStatusFilter(null) // Reset processing filter when tab changes
        }
    }, [])

    // Define processing status options for lab testing
    const processingStatusOptions = [
        { value: LAB_TEST_STATUS.NOT_UPLOADED, label: statusConfig[LAB_TEST_STATUS.NOT_UPLOADED].label },
        { value: LAB_TEST_STATUS.UPLOADED, label: statusConfig[LAB_TEST_STATUS.UPLOADED].label },
        { value: LAB_TEST_STATUS.WAIT_FOR_APPROVAL, label: statusConfig[LAB_TEST_STATUS.WAIT_FOR_APPROVAL].label }
    ]

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
        filter: {
            ...filter,
            ...(activeTab === 'processing' && processingStatusFilter
                ? { status: processingStatusFilter as LabTestStatus }
                : {})
        },
        dateFrom: dateRange[0],
        dateTo: dateRange[1],
        filterGroup: activeTab as 'processing' | 'rejected' | 'approved'
    })

    // const sendToAnalysisMutation = useSendToAnalysis()

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

    const recordsPerPageOptions = [5, 10, 20, 50]

    // Extract data from response
    const labTestData = labTestResponse?.data || []
    console.log('Debug: ', labTestData)
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
                accessor: 'labcodeDescription',
                title: 'Mô tả Labcode',
                width: 150,
                render: (record) => {
                    const packageName = getDescriptionLabcodeName(record.packageType, packageTypeMapping)
                    const sampleName = getDescriptionLabcodeName(record.sampleType, sampleTypeMapping)

                    if (packageName !== '-' && sampleName !== '-') {
                        return <Text size='sm'>{`${packageName} - ${sampleName}`}</Text>
                    } else if (packageName !== '-') {
                        return <Text size='sm'>{packageName}</Text>
                    } else if (sampleName !== '-') {
                        return <Text size='sm'>{sampleName}</Text>
                    } else {
                        return <Text size='sm'>-</Text>
                    }
                }
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
                width: 120,
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
                render: (record) => {
                    const dbDate = record.requestDateLabTesting
                    const d = new Date(dbDate)

                    return (
                        <Text size='sm'>
                            {d.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                        </Text>
                    )
                }
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

            {/* Status Group Tabs */}
            <Tabs value={activeTab} onChange={handleTabChange}>
                <Tabs.List>
                    <Tabs.Tab value='processing'>Đang xử lý</Tabs.Tab>
                    <Tabs.Tab value='rejected'>Từ chối</Tabs.Tab>
                    <Tabs.Tab value='approved'>Đã phê duyệt</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value='processing' pt='md'>
                    {/* Reusable Search and Filter Component with Processing Status Filter */}
                    <ListSearchFilter
                        searchValue={search}
                        onSearchChange={setSearch}
                        searchPlaceholder='Tìm kiếm theo mã labcode, barcode...'
                        statusFilter={processingStatusFilter}
                        onStatusFilterChange={setProcessingStatusFilter}
                        statusOptions={processingStatusOptions}
                        statusPlaceholder='Lọc theo trạng thái xử lý'
                        dateRange={dateRange}
                        onDateRangeChange={(value) => {
                            if (
                                Array.isArray(value) &&
                                (typeof value[0] === 'string' || typeof value[1] === 'string')
                            ) {
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
                </Tabs.Panel>

                <Tabs.Panel value='rejected' pt='md'>
                    {/* Reusable Search and Filter Component */}
                    <ListSearchFilter
                        searchValue={search}
                        onSearchChange={setSearch}
                        searchPlaceholder='Tìm kiếm theo mã labcode, barcode...'
                        dateRange={dateRange}
                        onDateRangeChange={(value) => {
                            if (
                                Array.isArray(value) &&
                                (typeof value[0] === 'string' || typeof value[1] === 'string')
                            ) {
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
                </Tabs.Panel>

                <Tabs.Panel value='approved' pt='md'>
                    {/* Reusable Search and Filter Component */}
                    <ListSearchFilter
                        searchValue={search}
                        onSearchChange={setSearch}
                        searchPlaceholder='Tìm kiếm theo mã labcode, barcode...'
                        dateRange={dateRange}
                        onDateRangeChange={(value) => {
                            if (
                                Array.isArray(value) &&
                                (typeof value[0] === 'string' || typeof value[1] === 'string')
                            ) {
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
                </Tabs.Panel>
            </Tabs>

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
