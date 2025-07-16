export const validateCitizenId = (citizenId: string): string | null => {
    if (!citizenId || !citizenId.trim()) {
        return 'Số CCCD là bắt buộc'
    }

    const trimmedId = citizenId.trim()

    // Check if contains only numbers
    if (!/^\d+$/.test(trimmedId)) {
        return 'Số CCCD chỉ được chứa số'
    }

    // Check length (12 digits for new CCCD)
    if (trimmedId.length !== 12) {
        return 'Số CCCD phải có đúng 12 số'
    }

    return null
}

export const formatCitizenId = (citizenId: string): string => {
    return citizenId.replace(/\D/g, '').slice(0, 12)
}
