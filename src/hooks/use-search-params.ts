import { useSearchParams as useRouterSearchParams } from 'react-router'
import { useCallback, useMemo } from 'react'

export const useSearchParams = <T extends Record<string, any>>() => {
    const [searchParams, setSearchParams] = useRouterSearchParams()

    const getParam = useCallback(
        (key: string): string | null => {
            return searchParams.get(key)
        },
        [searchParams]
    )

    const getParams = useCallback((): Partial<T> => {
        const params: Partial<T> = {}
        searchParams.forEach((value, key) => {
            try {
                // Try to parse JSON for complex values, fallback to string
                params[key as keyof T] = JSON.parse(value) as T[keyof T]
            } catch {
                params[key as keyof T] = value as T[keyof T]
            }
        })
        return params
    }, [searchParams])

    const setParam = useCallback(
        (key: string, value: string | number | boolean | null) => {
            setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev)
                if (value === null || value === undefined || value === '') {
                    newParams.delete(key)
                } else {
                    newParams.set(key, String(value))
                }
                return newParams
            })
        },
        [setSearchParams]
    )

    const setParams = useCallback(
        (params: Partial<T>) => {
            setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev)
                Object.entries(params).forEach(([key, value]) => {
                    if (value === null || value === undefined || value === '') {
                        newParams.delete(key)
                    } else {
                        newParams.set(key, String(value))
                    }
                })
                return newParams
            })
        },
        [setSearchParams]
    )

    const clearParams = useCallback(
        (keys?: string[]) => {
            setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev)
                if (keys) {
                    keys.forEach((key) => newParams.delete(key))
                } else {
                    return new URLSearchParams()
                }
                return newParams
            })
        },
        [setSearchParams]
    )

    return {
        getParam,
        getParams,
        setParam,
        setParams,
        clearParams,
        searchParams
    }
}

interface UseSearchParamStateOptions<T> {
    key: string
    initValue: T
    serialize?: (value: T) => string
    deserialize?: (value: string) => T
}

export const useSearchParamState = <T>({
    key,
    initValue,
    serialize,
    deserialize
}: UseSearchParamStateOptions<T>): [T, (value: T) => void] => {
    const [searchParams, setSearchParams] = useRouterSearchParams()

    // Default serialization/deserialization functions
    const defaultSerialize = useCallback((value: T): string => {
        if (typeof value === 'string') return value
        if (typeof value === 'number' || typeof value === 'boolean') return String(value)
        return JSON.stringify(value)
    }, [])

    const defaultDeserialize = useCallback(
        (value: string): T => {
            // Handle basic types
            if (typeof initValue === 'string') return value as T
            if (typeof initValue === 'number') {
                const parsed = Number(value)
                return (isNaN(parsed) ? initValue : parsed) as T
            }
            if (typeof initValue === 'boolean') {
                return (value === 'true') as T
            }

            // Try to parse JSON for complex types
            try {
                return JSON.parse(value) as T
            } catch {
                return initValue
            }
        },
        [initValue]
    )

    const serializeFn = serialize || defaultSerialize
    const deserializeFn = deserialize || defaultDeserialize

    // Get current value from URL params
    const value = useMemo(() => {
        const paramValue = searchParams.get(key)
        if (paramValue === null) return initValue
        return deserializeFn(paramValue)
    }, [searchParams, key, initValue, deserializeFn])

    // Set value in URL params
    const setValue = useCallback(
        (newValue: T) => {
            setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev)

                // Check if value should be removed from URL
                const shouldRemove =
                    newValue === null ||
                    newValue === undefined ||
                    newValue === '' ||
                    (typeof newValue === 'string' && newValue.trim() === '') ||
                    (Array.isArray(newValue) && newValue.length === 0) ||
                    (typeof newValue === 'object' && newValue !== null && Object.keys(newValue).length === 0)

                if (shouldRemove) {
                    newParams.delete(key)
                } else {
                    newParams.set(key, serializeFn(newValue))
                }
                return newParams
            })
        },
        [setSearchParams, key, serializeFn]
    )

    return [value, setValue]
}

// Specialized hook for date ranges
export const useDateRangeSearchParam = (
    fromKey = 'dateFrom',
    toKey = 'dateTo'
): [[string | null, string | null], (value: [string | null, string | null] | null) => void] => {
    const [dateFrom, setDateFrom] = useSearchParamState<string>({
        key: fromKey,
        initValue: ''
    })
    const [dateTo, setDateTo] = useSearchParamState<string>({
        key: toKey,
        initValue: ''
    })

    const dateRange = useMemo<[string | null, string | null]>(() => {
        return [dateFrom || null, dateTo || null]
    }, [dateFrom, dateTo])

    const setDateRange = useCallback(
        (value: [string | null, string | null] | null) => {
            const [from, to] = value || [null, null]
            setDateFrom(from || '')
            setDateTo(to || '')
        },
        [setDateFrom, setDateTo]
    )

    return [dateRange, setDateRange]
}

// Hook for managing complex filter objects
export const useFilterSearchParam = <T extends Record<string, any>>(
    key = 'filter',
    defaultFilter: T = {} as T
): [T, (filter: Partial<T>) => void, (filterKey: keyof T, value: any) => void, () => void] => {
    const [filter, setFilter] = useSearchParamState<T>({
        key,
        initValue: defaultFilter,
        serialize: (value) => {
            // Only serialize non-empty filter objects
            const cleanFilter = Object.fromEntries(
                Object.entries(value).filter(
                    ([, v]) =>
                        v !== null &&
                        v !== undefined &&
                        v !== '' &&
                        !(Array.isArray(v) && v.length === 0) &&
                        !(typeof v === 'object' && v !== null && Object.keys(v).length === 0)
                )
            )
            return Object.keys(cleanFilter).length > 0 ? JSON.stringify(cleanFilter) : ''
        },
        deserialize: (value) => {
            try {
                const parsed = JSON.parse(value)
                return typeof parsed === 'object' && parsed !== null ? parsed : defaultFilter
            } catch {
                return defaultFilter
            }
        }
    })

    // Update entire filter object
    const updateFilter = useCallback(
        (newFilter: Partial<T>) => {
            const updatedFilter = { ...filter, ...newFilter }
            // Remove empty values
            Object.keys(updatedFilter).forEach((key) => {
                const value = updatedFilter[key]
                if (
                    value === '' ||
                    value === null ||
                    value === undefined ||
                    (Array.isArray(value) && value.length === 0) ||
                    (typeof value === 'object' && value !== null && Object.keys(value).length === 0)
                ) {
                    delete updatedFilter[key]
                }
            })
            setFilter(updatedFilter as T)
        },
        [filter, setFilter]
    )

    // Update a single filter property
    const updateFilterProperty = useCallback(
        (filterKey: keyof T, value: any) => {
            const newFilter = { ...filter }
            if (
                value === '' ||
                value === null ||
                value === undefined ||
                (Array.isArray(value) && value.length === 0) ||
                (typeof value === 'object' && value !== null && Object.keys(value).length === 0)
            ) {
                delete newFilter[filterKey]
            } else {
                newFilter[filterKey] = value
            }
            setFilter(newFilter)
        },
        [filter, setFilter]
    )

    // Clear all filters
    const clearFilter = useCallback(() => {
        setFilter(defaultFilter)
    }, [setFilter, defaultFilter])

    return [filter, updateFilter, updateFilterProperty, clearFilter]
}
