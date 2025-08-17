/**
 * Calculate ETL progress percentage based on start time and 40-hour target
 * @param startTime - The start time of the ETL process
 * @returns Progress percentage (0-100)
 */
export const calculateEtlProgress = (startTime: string | null): number => {
    if (!startTime) {
        return 0
    }

    const start = new Date(startTime)
    const now = new Date()
    const targetDurationHours = 40

    // Calculate elapsed time in milliseconds
    const elapsedMs = now.getTime() - start.getTime()

    // Convert to hours
    const elapsedHours = elapsedMs / (1000 * 60 * 60)

    // Calculate percentage (max 100%)
    const progress = Math.min((elapsedHours / targetDurationHours) * 100, 100)

    return Math.round(progress)
}

/**
 * Get remaining time until ETL completion (40 hours)
 * @param startTime - The start time of the ETL process
 * @returns Remaining time in hours and minutes, or null if completed
 */
export const getRemainingEtlTime = (startTime: string | null): { hours: number; minutes: number } | null => {
    if (!startTime) {
        return null
    }

    const start = new Date(startTime)
    const now = new Date()
    const targetDurationHours = 40

    // Calculate elapsed time in milliseconds
    const elapsedMs = now.getTime() - start.getTime()

    // Convert to hours
    const elapsedHours = elapsedMs / (1000 * 60 * 60)

    // If already completed or exceeded target time
    if (elapsedHours >= targetDurationHours) {
        return null
    }

    const remainingHours = targetDurationHours - elapsedHours
    const hours = Math.floor(remainingHours)
    const minutes = Math.round((remainingHours - hours) * 60)

    return { hours, minutes }
}

/**
 * Format remaining time as string
 * @param remainingTime - Remaining time object with hours and minutes
 * @returns Formatted time string
 */
export const formatRemainingTime = (remainingTime: { hours: number; minutes: number } | null): string => {
    if (!remainingTime) {
        return 'Hoàn thành'
    }

    const { hours, minutes } = remainingTime

    if (hours === 0) {
        return `${minutes} phút`
    }

    if (minutes === 0) {
        return `${hours} giờ`
    }

    return `${hours} giờ ${minutes} phút`
}
