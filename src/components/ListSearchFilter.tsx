import { type ReactNode } from 'react'
import { Group, Stack, Paper, TextInput, Select, Button, ActionIcon, Text } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconSearch, IconCalendar, IconFilter, IconX, IconRefresh } from '@tabler/icons-react'

export interface SelectOption {
    value: string
    label: string
}

export interface ListSearchFilterProps {
    // Search
    searchValue: string
    onSearchChange: (value: string) => void
    searchPlaceholder?: string

    // Status filter
    statusFilter?: string
    onStatusFilterChange?: (value: string | null) => void
    statusOptions?: SelectOption[]
    statusPlaceholder?: string

    // Date range
    dateRange?: [Date | null, Date | null] | [string | null, string | null]
    onDateRangeChange?: (value: [Date | null, Date | null] | [string | null, string | null]) => void

    // Actions
    onRefresh?: () => void
    onClearFilters?: () => void

    // UI state
    isLoading?: boolean
    totalRecords?: number

    // Additional filters
    additionalFilters?: ReactNode

    // Layout
    variant?: 'default' | 'compact'
    showRefreshButton?: boolean
    showClearFilters?: boolean
}

export const ListSearchFilter = ({
    searchValue,
    onSearchChange,
    searchPlaceholder = 'Tìm kiếm...',

    statusFilter,
    onStatusFilterChange,
    statusOptions,
    statusPlaceholder = 'Lọc theo trạng thái',

    dateRange,
    onDateRangeChange,

    onRefresh,
    onClearFilters,

    isLoading = false,
    totalRecords,

    additionalFilters,

    variant = 'default',
    showRefreshButton = true,
    showClearFilters = true
}: ListSearchFilterProps) => {
    // Check for active filters including additional filters (passed via onClearFilters callback)
    const hasActiveFilters =
        searchValue ||
        statusFilter ||
        (dateRange && (dateRange[0] || dateRange[1])) ||
        (additionalFilters && onClearFilters) // If there are additional filters, assume they might be active

    const handleClearAll = () => {
        onSearchChange('')
        onStatusFilterChange?.(null)
        onDateRangeChange?.([null, null])
        onClearFilters?.()
    }

    return (
        <Paper p={variant === 'compact' ? 'sm' : 'md'} withBorder shadow='sm'>
            <Stack gap='sm'>
                <Group>
                    <TextInput
                        placeholder={searchPlaceholder}
                        leftSection={<IconSearch size={16} />}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.currentTarget.value)}
                        rightSection={
                            searchValue ? (
                                <ActionIcon variant='subtle' onClick={() => onSearchChange('')}>
                                    <IconX size={16} />
                                </ActionIcon>
                            ) : null
                        }
                        disabled={isLoading}
                        style={{ flexGrow: 1 }}
                        data-autofocus
                    />
                    {showRefreshButton && onRefresh && (
                        <Button
                            variant='light'
                            leftSection={<IconRefresh size={16} />}
                            onClick={onRefresh}
                            loading={isLoading}
                        >
                            Làm mới
                        </Button>
                    )}
                    {statusOptions && onStatusFilterChange && (
                        <Select
                            placeholder={statusPlaceholder}
                            leftSection={<IconFilter size={16} />}
                            data={[{ value: '', label: 'Tất cả trạng thái' }, ...statusOptions]}
                            value={statusFilter || ''}
                            onChange={onStatusFilterChange}
                            clearable
                            disabled={isLoading}
                            rightSection={
                                statusFilter && (
                                    <ActionIcon
                                        size='xs'
                                        variant='transparent'
                                        onClick={() => onStatusFilterChange(null)}
                                    >
                                        <IconX size={12} />
                                    </ActionIcon>
                                )
                            }
                        />
                    )}
                    {onDateRangeChange && (
                        <DatePickerInput
                            type='range'
                            placeholder='Chọn khoảng thời gian'
                            leftSection={<IconCalendar size={16} />}
                            value={dateRange}
                            onChange={onDateRangeChange}
                            clearable
                            maxDate={new Date()}
                            disabled={isLoading}
                        />
                    )}
                </Group>

                <Group>{additionalFilters}</Group>
            </Stack>
        </Paper>
    )
}

export default ListSearchFilter
