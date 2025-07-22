import { useCallback, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Title, Group, Stack, Paper, Badge, ActionIcon, Alert, Text, Tooltip } from '@mantine/core'
import { DataTable, type DataTableColumn } from 'mantine-datatable'
import { IconAlertCircle, IconDownload, IconCheck, IconX as IconReject, IconEye } from '@tabler/icons-react'
import {
    validationEtlStatusConfig,
    ValidationEtlStatus,
    type ValidationFilter,
    type ValidationSessionWithLatestEtlResponse
} from '@/types/validation'
import { useValidationPatients, useDownloadValidationEtlResult } from '@/services/hook/validation.hook'
import { notifications } from '@mantine/notifications'
import { ListSearchFilter, type SelectOption } from '@/components/ListSearchFilter'
import { useListState } from '@/hooks/use-list-state'
import { openRejectEtlResultModal } from '@/components/RejectEtlResultModal'
import { openAcceptEtlResultModal } from '@/components/AcceptEtlResultModal'

const getStatusColor = (status: string) => {
    return validationEtlStatusConfig[status as keyof typeof validationEtlStatusConfig]?.color || 'gray'
}

const getStatusLabel = (status: string) => {
    return validationEtlStatusConfig[status as keyof typeof validationEtlStatusConfig]?.label || status
}

const ValidationPage = () => {
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
    } = useListState<ValidationFilter>({
        defaultSortBy: 'createdAt',
        defaultSortOrder: 'DESC'
    })

    // Status filter from the main filter object
    const statusFilter = filter.status || ''

    // Fetch data
    const {
        data: validationResponse,
        isLoading,
        error,
        isError,
        refetch
    } = useValidationPatients({
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
    const downloadEtlResultMutation = useDownloadValidationEtlResult()

    // Status options for the filter
    const statusOptions: SelectOption[] = [
        {
            value: ValidationEtlStatus.WAIT_FOR_APPROVAL,
            label: validationEtlStatusConfig[ValidationEtlStatus.WAIT_FOR_APPROVAL].label
        },
        {
            value: ValidationEtlStatus.REJECTED,
            label: validationEtlStatusConfig[ValidationEtlStatus.REJECTED].label
        },
        {
            value: ValidationEtlStatus.APPROVED,
            label: validationEtlStatusConfig[ValidationEtlStatus.APPROVED].label
        }
    ]

    const handleViewDetail = useCallback(
        (id: number) => {
            navigate(`/validation/${id}`)
        },
        [navigate]
    )

    const handleRefresh = useCallback(() => {
        refetch()
    }, [refetch])

    const handleDownloadEtlResult = useCallback(
        async (etlResultId: number) => {
            try {
                setIsDownloading(true)
                const response = await downloadEtlResultMutation.mutateAsync(etlResultId)
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

    const handleOpenRejectModal = useCallback(
        (etlResultId: number) => {
            openRejectEtlResultModal({
                etlResultId,
                onSuccess: () => {
                    refetch()
                }
            })
        },
        [refetch]
    )

    const handleOpenAcceptModal = useCallback(
        (etlResultId: number) => {
            openAcceptEtlResultModal({
                etlResultId,
                onSuccess: () => {
                    refetch()
                }
            })
        },
        [refetch]
    )

    const recordsPerPageOptions = [5, 10, 20, 50]

    // Extract data from response
    const validationData = validationResponse?.data || []
    const totalRecords = validationResponse?.meta?.total || 0

    const columns: DataTableColumn<ValidationSessionWithLatestEtlResponse>[] = useMemo(
        () => [
            {
                accessor: 'labcode',
                title: 'Labcode',
                sortable: true,
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
                width: 180,
                render: (record) => <Text fw={500}>{record.patient?.fullName || '-'}</Text>
            },

            {
                accessor: 'doctor.name',
                title: 'Bác sĩ',
                width: 150,
                render: (record) => record.doctor?.name || '-'
            },
            {
                accessor: 'requestDate',
                title: 'Ngày chỉ định',
                sortable: true,
                width: 120,
                render: (record) => new Date(record.requestDate).toLocaleDateString('vi-VN')
            },
            {
                accessor: 'latestEtlResult.status',
                title: 'Trạng thái',
                width: 120,
                render: (record) => {
                    const status = record.latestEtlResult?.status
                    if (!status) return '-'

                    return (
                        <Badge color={getStatusColor(status)} size='sm'>
                            {getStatusLabel(status)}
                        </Badge>
                    )
                }
            },
            {
                accessor: 'latestEtlResult.etlCompletedAt',
                title: 'Hoàn thành ETL',
                width: 130,
                render: (record) => {
                    if (!record.latestEtlResult?.etlCompletedAt) return '-'
                    return new Date(record.latestEtlResult.etlCompletedAt).toLocaleDateString('vi-VN')
                }
            },
            {
                accessor: 'actions',
                title: 'Thao tác',
                width: 180,
                render: (record) => {
                    const etlResult = record.latestEtlResult

                    return (
                        <Group gap='xs'>
                            <Tooltip label='Xem chi tiết'>
                                <ActionIcon
                                    size='sm'
                                    variant='light'
                                    color='blue'
                                    onClick={() => handleViewDetail(record.id)}
                                >
                                    <IconEye size={14} />
                                </ActionIcon>
                            </Tooltip>

                            {etlResult && (
                                <>
                                    {[
                                        ValidationEtlStatus.WAIT_FOR_APPROVAL,
                                        ValidationEtlStatus.REJECTED,
                                        ValidationEtlStatus.APPROVED
                                    ].includes(etlResult.status as ValidationEtlStatus) && (
                                        <Tooltip label='Tải xuống kết quả'>
                                            <ActionIcon
                                                size='sm'
                                                variant='light'
                                                color='blue'
                                                loading={isDownloading}
                                                onClick={() => handleDownloadEtlResult(etlResult.id)}
                                            >
                                                <IconDownload size={14} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}

                                    {etlResult.status === ValidationEtlStatus.WAIT_FOR_APPROVAL && (
                                        <>
                                            <Tooltip label='Phê duyệt'>
                                                <ActionIcon
                                                    size='sm'
                                                    variant='light'
                                                    color='green'
                                                    onClick={() => handleOpenAcceptModal(etlResult.id)}
                                                >
                                                    <IconCheck size={14} />
                                                </ActionIcon>
                                            </Tooltip>
                                            <Tooltip label='Từ chối'>
                                                <ActionIcon
                                                    size='sm'
                                                    variant='light'
                                                    color='red'
                                                    onClick={() => handleOpenRejectModal(etlResult.id)}
                                                >
                                                    <IconReject size={14} />
                                                </ActionIcon>
                                            </Tooltip>
                                        </>
                                    )}
                                </>
                            )}
                        </Group>
                    )
                }
            }
        ],
        [isDownloading, handleDownloadEtlResult, handleOpenAcceptModal, handleOpenRejectModal, handleViewDetail]
    )

    return (
        <Stack>
            <Group justify='space-between'>
                <Title order={2}>Xác thực kết quả ETL</Title>
            </Group>

            {/* Reusable Search and Filter Component */}
            <ListSearchFilter
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder='Tìm kiếm theo mã labcode, barcode...'
                statusFilter={statusFilter}
                onStatusFilterChange={(value) => updateFilter({ status: value || undefined })}
                statusOptions={statusOptions}
                statusPlaceholder='Trạng thái'
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onRefresh={handleRefresh}
                isLoading={isLoading}
                totalRecords={totalRecords}
                showRefreshButton={false} // We have it in the header
            />

            {/* Error Alert */}
            {isError && (
                <Alert icon={<IconAlertCircle size='1rem' />} title='Lỗi!' color='red' variant='light'>
                    {error?.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
                </Alert>
            )}

            {/* Data Table */}
            <Paper withBorder>
                <DataTable
                    records={validationData}
                    columns={columns}
                    totalRecords={totalRecords}
                    recordsPerPage={limit}
                    page={page}
                    onPageChange={setPage}
                    recordsPerPageLabel='Số bản ghi mỗi trang'
                    paginationText={({ from, to, totalRecords }) =>
                        `Hiển thị ${from} - ${to} của ${totalRecords} bản ghi`
                    }
                    recordsPerPageOptions={recordsPerPageOptions}
                    onRecordsPerPageChange={setLimit}
                    sortStatus={sortStatus}
                    onSortStatusChange={handleSort}
                    fetching={isLoading}
                    noRecordsText='Không có dữ liệu'
                    striped
                    highlightOnHover
                    minHeight={200}
                />
            </Paper>
        </Stack>
    )
}

export default ValidationPage
