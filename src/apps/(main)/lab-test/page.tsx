import { useCallback, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Title, TextInput, Select, Group, Stack, Paper, Button, Badge, Text, ActionIcon, Alert } from '@mantine/core'
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
    IconDownload
} from '@tabler/icons-react'
import { statusConfig, LAB_TEST_STATUS, type LabTestFilter, type LabTestStatus } from '@/types/lab-test.types'
import { useLabTestSessions } from '@/services/hook/lab-test.hook'
import { labTestService } from '@/services/function/lab-test'
import { useDebouncedValue } from '@mantine/hooks'
import { useSearchParamState } from '@/hooks/use-search-params'
import { notifications } from '@mantine/notifications'
import type { LabTestSessionListItem } from '@/types/lab-test'

const getStatusColor = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.color || 'gray'
}

const getStatusLabel = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.label || status
}

const LabTestPage = () => {
    const navigate = useNavigate()
    const [isDownloading, setIsDownloading] = useState(false)

    const [searchTerm, setSearchTerm] = useSearchParamState({
        key: 'search',
        initValue: ''
    })
    const [page, setPage] = useSearchParamState({
        key: 'page',
        initValue: 1
    })
    const [recordsPerPage, setRecordsPerPage] = useSearchParamState({
        key: 'recordsPerPage',
        initValue: 10
    })
    const [sortBy, setSortBy] = useSearchParamState({
        key: 'sortBy',
        initValue: 'createdAt'
    })
    const [sortOrder, setSortOrder] = useSearchParamState({
        key: 'sortOrder',
        initValue: 'desc'
    })
    const [filters, setFilters] = useSearchParamState<LabTestFilter>({
        key: 'filters',
        initValue: {}
    })
    const [dateRanges, setDateRanges] = useState<[string | null, string | null]>([null, null])
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
    const [debouncedSearchTerm] = useDebouncedValue(localSearchTerm, 500)

    useEffect(() => {
        setSearchTerm(debouncedSearchTerm)
    }, [debouncedSearchTerm, setSearchTerm])

    // Fetch data using the hook with proper search params
    const {
        data: labTestResponse,
        isLoading,
        isError,
        error,
        refetch
    } = useLabTestSessions({
        search: searchTerm,
        page,
        limit: recordsPerPage,
        sortBy,
        sortOrder,
        filter: filters,
        dateFrom: dateRanges[0],
        dateTo: dateRanges[1]
    })

    const handleViewDetail = useCallback(
        (id: number) => {
            navigate(`/lab-test/${id}`)
        },
        [navigate]
    )

    const handleRefresh = useCallback(() => {
        refetch()
    }, [refetch])

    const handleSort = useCallback(
        (sortStatus: DataTableSortStatus<LabTestSessionListItem>) => {
            setSortBy(sortStatus.columnAccessor)
            setSortOrder(sortStatus.direction)
        },
        [setSortBy, setSortOrder]
    )

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
    const totalRecords = labTestResponse?.meta?.total || 0

    const columns: DataTableColumn<LabTestSessionListItem>[] = useMemo(
        () => [
            {
                accessor: 'labcode',
                title: 'Mã xét nghiệm',
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
                width: 120,
                render: (record) => (
                    <Text size='sm' ff='monospace'>
                        {record.barcode}
                    </Text>
                )
            },
            {
                accessor: 'patient.personalId',
                title: 'Số CCCD',
                width: 140,
                render: (record) => (
                    <Text size='sm' ff='monospace'>
                        {record.patient.personalId}
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
                accessor: 'patient.healthInsuranceCode',
                title: 'Mã BHYT',
                width: 140,
                render: (record) => (
                    <Text size='sm' ff='monospace'>
                        {record.patient.healthInsuranceCode}
                    </Text>
                )
            },
            {
                accessor: 'doctor.name',
                title: 'Bác sĩ chỉ định',
                width: 150
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
                        <Text size='xs' c='dimmed'>
                            -
                        </Text>
                    )
            },
            {
                accessor: 'latestFastqFile.status',
                title: 'Trạng thái',
                width: 120,
                render: (record) => (
                    <Badge color={getStatusColor(record?.latestFastqFile?.status || '')} variant='light' size='sm'>
                        {getStatusLabel(record?.latestFastqFile?.status || '')}
                    </Badge>
                )
            },
            {
                accessor: 'actions',
                title: 'Thao tác',
                width: 100,
                textAlign: 'center',
                render: (record) => (
                    <Group gap='xs' justify='center'>
                        <ActionIcon variant='light' color='blue' onClick={() => handleViewDetail(record.id)}>
                            <IconEye size={16} />
                        </ActionIcon>
                    </Group>
                )
            }
        ],
        [handleDownloadFastQ, isDownloading, handleViewDetail]
    )
    return (
        <Stack gap='lg'>
            {/* Header */}
            <Group justify='space-between'>
                <Title order={2}>Quản lý xét nghiệm</Title>
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
                    {error?.message || 'Không thể tải danh sách xét nghiệm. Vui lòng thử lại.'}
                </Alert>
            )}

            {/* Search and Filters */}
            <Paper p='md' withBorder shadow='sm'>
                <Stack gap='md'>
                    <Group>
                        <TextInput
                            placeholder='Tìm kiếm theo tên, CCCD...'
                            leftSection={<IconSearch size={16} />}
                            value={localSearchTerm}
                            onChange={(e) => setLocalSearchTerm(e.currentTarget.value)}
                            rightSection={
                                localSearchTerm ? (
                                    <ActionIcon variant='subtle' onClick={() => setLocalSearchTerm('')}>
                                        <IconX size={16} />
                                    </ActionIcon>
                                ) : null
                            }
                            disabled={isLoading}
                            data-autofocus
                            className='grow-1'
                        />

                        <Select
                            placeholder='Lọc theo trạng thái'
                            leftSection={<IconFilter size={16} />}
                            data={Object.values(LAB_TEST_STATUS).map((status) => ({
                                value: status,
                                label: statusConfig[status as keyof typeof statusConfig]?.label || status
                            }))}
                            value={filters.status}
                            onChange={(value) => {
                                if (!value) {
                                    setFilters({})
                                } else {
                                    setFilters({ ...filters, status: value as LabTestStatus })
                                }
                            }}
                            clearable
                            disabled={isLoading}
                        />

                        <DatePickerInput
                            type='range'
                            placeholder='Chọn khoảng thời gian'
                            leftSection={<IconCalendar size={16} />}
                            value={dateRanges}
                            onChange={setDateRanges}
                            clearable
                            maxDate={new Date()}
                            disabled={isLoading}
                        />
                    </Group>
                    {(Object.keys(filters).length > 0 || dateRanges[0] || dateRanges[1]) && (
                        <Group>
                            <Button
                                variant='light'
                                color='gray'
                                leftSection={<IconX size={16} />}
                                onClick={() => {
                                    setFilters({})
                                    setDateRanges([null, null])
                                }}
                                size='sm'
                                disabled={isLoading}
                            >
                                Xóa bộ lọc
                            </Button>
                            <Text size='sm' c='dimmed'>
                                Tìm thấy {totalRecords} kết quả
                            </Text>
                        </Group>
                    )}
                </Stack>
            </Paper>

            {/* Data Table */}
            <Paper withBorder shadow='sm'>
                <DataTable
                    records={labTestData}
                    columns={columns}
                    totalRecords={totalRecords}
                    recordsPerPage={recordsPerPage}
                    recordsPerPageOptions={recordsPerPageOptions}
                    onRecordsPerPageChange={setRecordsPerPage}
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
                    sortStatus={{
                        sortKey: sortBy,
                        columnAccessor: sortBy,
                        direction: sortOrder as 'asc' | 'desc'
                    }}
                    onSortStatusChange={handleSort}
                />
            </Paper>
        </Stack>
    )
}

export default LabTestPage
