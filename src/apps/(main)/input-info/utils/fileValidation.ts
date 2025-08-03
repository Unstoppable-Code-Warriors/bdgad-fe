import { FileCategory, VALIDATION_RULES, FILE_CATEGORY_OPTIONS, type FileCategoryDto } from '@/types/categorized-upload'

export interface ValidationResult {
    isValid: boolean
    errors: { [index: number]: string }
    globalErrors: string[]
    summary: string
}

export const validateCategorizedFiles = (files: File[], fileCategories: FileCategoryDto[]): ValidationResult => {
    const errors: { [index: number]: string } = {}
    const globalErrors: string[] = []

    // Check if file count matches categories count
    if (files.length !== fileCategories.length) {
        globalErrors.push(`Số lượng file (${files.length}) phải bằng số lượng phân loại (${fileCategories.length})`)
    }

    // Check if at least one file exists
    if (files.length === 0) {
        globalErrors.push('Cần ít nhất một file')
        return {
            isValid: false,
            errors,
            globalErrors,
            summary: 'Chưa có file nào được chọn'
        }
    }

    // Validate each file and category
    const categoryCount: { [key: string]: number } = {}
    const specialCategories: FileCategory[] = []

    files.forEach((file, index) => {
        const category = fileCategories[index]

        // Check file size
        if (file.size > VALIDATION_RULES.MAX_FILE_SIZE) {
            const maxSizeMB = VALIDATION_RULES.MAX_FILE_SIZE / 1024 / 1024
            errors[index] = `File quá lớn. Kích thước tối đa: ${maxSizeMB}MB`
        }

        // Check file type
        if (!VALIDATION_RULES.ALLOWED_FILE_TYPES.includes(file.type as any)) {
            errors[index] = 'Loại file không được hỗ trợ'
        }

        // Check if category is selected
        if (!category || !category.category) {
            errors[index] = 'Vui lòng chọn loại file'
            return
        }

        // Count categories
        categoryCount[category.category] = (categoryCount[category.category] || 0) + 1

        // Check for duplicates in special categories
        if (category.category !== FileCategory.GENERAL) {
            specialCategories.push(category.category)
            if (categoryCount[category.category] > VALIDATION_RULES.MAX_FILES_PER_CATEGORY) {
                errors[index] = `Chỉ được phép tối đa ${VALIDATION_RULES.MAX_FILES_PER_CATEGORY} file cho loại này`
            }
        }
    })

    // Check if at least one special category is present
    const hasSpecialFile = specialCategories.length > 0
    if (!hasSpecialFile) {
        globalErrors.push('Cần ít nhất một file đặc biệt (không phải file chung)')
    }

    // Check for required categories (if specified)

    const isValid = Object.keys(errors).length === 0 && globalErrors.length === 0
    const summary = isValid
        ? `✓ Hợp lệ: ${files.length} file, ${specialCategories.length} file đặc biệt`
        : `✗ Có ${Object.keys(errors).length + globalErrors.length} lỗi cần khắc phục`

    return {
        isValid,
        errors,
        globalErrors,
        summary
    }
}

export const getFileValidationMessage = (file: File): string | null => {
    if (file.size > VALIDATION_RULES.MAX_FILE_SIZE) {
        const maxSizeMB = VALIDATION_RULES.MAX_FILE_SIZE / 1024 / 1024
        return `File quá lớn (${(file.size / 1024 / 1024).toFixed(2)}MB > ${maxSizeMB}MB)`
    }

    if (!VALIDATION_RULES.ALLOWED_FILE_TYPES.includes(file.type as any)) {
        return `Loại file không được hỗ trợ: ${file.type}`
    }

    return null
}

export const generateDefaultFileCategories = (files: File[]): FileCategoryDto[] => {
    return files.map((file) => {
        // Try to guess category based on filename
        const fileName = file.name.toLowerCase()
        let category: FileCategory

        if (fileName.includes('prenatal') || fileName.includes('nipt') || fileName.includes('sàng lọc')) {
            category = FileCategory.PRENATAL_SCREENING
        } else if (fileName.includes('cancer') || fileName.includes('ung thư') || fileName.includes('bcare')) {
            category = FileCategory.HEREDITARY_CANCER
        } else if (fileName.includes('gene') || fileName.includes('mutation') || fileName.includes('đột biến')) {
            category = FileCategory.GENE_MUTATION
        } else {
            // Default to general
            category = FileCategory.GENERAL
        }

        // Get priority from FILE_CATEGORY_OPTIONS
        const categoryOption = FILE_CATEGORY_OPTIONS.find((opt) => opt.value === category)
        const priority = categoryOption?.priority || 5

        return {
            category,
            priority,
            fileName: file.name
        }
    })
}
