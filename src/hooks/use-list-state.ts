import { useCallback, useEffect, useState, useMemo } from 'react'
import { useDebouncedValue } from '@mantine/hooks'
import { useSearchParamState } from '@/hooks/use-search-params'
import type { DataTableSortStatus } from 'mantine-datatable'

export type SortOrder = 'ASC' | 'DESC' | 'asc' | 'desc'

export interface UseListStateOptions<TFilter extends Record<string, any> = {}> {
    // Default values
    defaultPage?: number
    defaultLimit?: number
    defaultSearch?: string
    defaultSortBy?: string
    defaultSortOrder?: SortOrder
    defaultFilter?: TFilter

    // Debounce
    searchDebounce?: number

    // Auto reset page on filter change
    autoResetPage?: boolean
}

export interface UseListStateReturn<TFilter extends Record<string, any> = {}> {
    // Search
    search: string
    debouncedSearch: string
    setSearch: (value: string) => void

    // Pagination
    page: number
    setPage: (value: number) => void
    limit: number
    setLimit: (value: number) => void

    // Sorting
    sortBy: string
    setSortBy: (value: string) => void
    sortOrder: string
    setSortOrder: (value: string) => void
    sortStatus: {
        columnAccessor: string
        direction: 'asc' | 'desc'
    }
    handleSort: <T>(sortStatus: DataTableSortStatus<T>) => void

    // Filtering
    filter: TFilter
    setFilter: (value: TFilter) => void
    updateFilter: (updates: Partial<TFilter>) => void
    clearFilter: () => void

    // Date range (commonly used)
    dateRange: [string | null, string | null]
    setDateRange: (value: [string | null, string | null] | [Date | null, Date | null]) => void

    // Utility
    resetPage: () => void
    hasActiveFilters: boolean
}

export const useListState = <TFilter extends Record<string, any> = {}>({
    defaultPage = 1,
    defaultLimit = 10,
    defaultSearch = '',
    defaultSortBy = 'createdAt',
    defaultSortOrder = 'DESC',
    defaultFilter = {} as TFilter,
    searchDebounce = 500,
    autoResetPage = true
}: UseListStateOptions<TFilter> = {}): UseListStateReturn<TFilter> => {
    // URL-persisted state
    const [page, setPage] = useSearchParamState({
        key: 'page',
        initValue: defaultPage
    })

    const [limit, setLimit] = useSearchParamState({
        key: 'limit',
        initValue: defaultLimit
    })

    const [search, setSearch] = useSearchParamState({
        key: 'search',
        initValue: defaultSearch
    })

    const [sortBy, setSortBy] = useSearchParamState({
        key: 'sortBy',
        initValue: defaultSortBy
    })

    const [sortOrder, setSortOrder] = useSearchParamState({
        key: 'sortOrder',
        initValue: defaultSortOrder as string
    })

    const [filter, setFilter] = useSearchParamState<TFilter>({
        key: 'filter',
        initValue: defaultFilter
    })

    // Local state for date range (not URL-persisted by default)
    const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null])

    // Debounced search
    const [debouncedSearch] = useDebouncedValue(search, searchDebounce)

    // Auto reset page when search or filters change
    useEffect(() => {
        if (autoResetPage && page > 1) {
            setPage(1)
        }
    }, [debouncedSearch, filter, dateRange, autoResetPage, page, setPage])

    // Sort status for DataTable
    const sortStatus = useMemo(
        () => ({
            columnAccessor: sortBy as string,
            direction: (sortOrder as string).toLowerCase() as 'asc' | 'desc'
        }),
        [sortBy, sortOrder]
    )

    // Handle sort change from DataTable
    const handleSort = useCallback(
        <T>(newSortStatus: DataTableSortStatus<T>) => {
            setSortBy(String(newSortStatus.columnAccessor))
            setSortOrder(newSortStatus.direction.toUpperCase())
        },
        [setSortBy, setSortOrder]
    )

    // Filter utilities
    const updateFilter = useCallback(
        (updates: Partial<TFilter>) => {
            const newFilter = { ...filter, ...updates }
            // Remove empty values
            Object.keys(newFilter).forEach((key) => {
                const value = newFilter[key]
                if (
                    value === '' ||
                    value === null ||
                    value === undefined ||
                    (Array.isArray(value) && value.length === 0) ||
                    (typeof value === 'object' && value !== null && Object.keys(value).length === 0)
                ) {
                    delete newFilter[key]
                }
            })
            setFilter(newFilter)
        },
        [filter, setFilter]
    )

    const clearFilter = useCallback(() => {
        setFilter(defaultFilter)
    }, [setFilter, defaultFilter])

    // Reset page utility
    const resetPage = useCallback(() => {
        setPage(defaultPage)
    }, [setPage, defaultPage])

    // Check if there are active filters
    const hasActiveFilters = useMemo(() => {
        const hasFilterValues = Object.keys(filter).length > 0
        const hasDateRange = dateRange[0] || dateRange[1]
        return hasFilterValues || !!hasDateRange
    }, [filter, dateRange])

    // Handle date range change with both Date and string support
    const handleDateRangeChange = useCallback(
        (value: [string | null, string | null] | [Date | null, Date | null]) => {
            if (value[0] instanceof Date || value[1] instanceof Date) {
                // Convert Date objects to ISO strings
                const stringRange: [string | null, string | null] = [
                    value[0] instanceof Date ? value[0].toISOString().split('T')[0] : value[0],
                    value[1] instanceof Date ? value[1].toISOString().split('T')[0] : value[1]
                ]
                setDateRange(stringRange)
            } else {
                setDateRange(value as [string | null, string | null])
            }
        },
        [setDateRange]
    )

    return {
        // Search
        search: search as string,
        debouncedSearch: debouncedSearch as string,
        setSearch,

        // Pagination
        page: page as number,
        setPage,
        limit: limit as number,
        setLimit,

        // Sorting
        sortBy: sortBy as string,
        setSortBy,
        sortOrder: sortOrder as string,
        setSortOrder,
        sortStatus,
        handleSort,

        // Filtering
        filter,
        setFilter,
        updateFilter,
        clearFilter,

        // Date range
        dateRange,
        setDateRange: handleDateRangeChange,

        // Utility
        resetPage,
        hasActiveFilters
    }
}
