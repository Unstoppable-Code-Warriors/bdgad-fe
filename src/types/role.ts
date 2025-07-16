export interface Role {
    id: string
    name: string
    description?: string
}

// Vietnamese translations for role names
export const roleTranslations: { [key: string]: string } = {
    'admin': 'Quản trị viên',
    'staff': 'Nhân viên',
    'Lab Testing Technician': 'Kỹ thuật viên xét nghiệm',
    'Validation Technician': 'Kỹ thuật viên thẩm định', 
    'Analysis Technician': 'Kỹ thuật viên phân tích',
    'Doctor': 'Bác sĩ',
}

export const translateRole = (roleName: string): string => {
    if (!roleName) return ''
    
    // First try exact match
    if (roleTranslations[roleName]) {
        return roleTranslations[roleName]
    }
    
    // Then try lowercase match
    if (roleTranslations[roleName.toLowerCase()]) {
        return roleTranslations[roleName.toLowerCase()]
    }
    
    // Return original if no translation found
    return roleName
}
