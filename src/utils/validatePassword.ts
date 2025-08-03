export interface PasswordValidationResult {
    isValid: boolean
    errors: string[]
}

export interface PasswordRequirements {
    minLength?: number
    requireLowercase?: boolean
    requireUppercase?: boolean
    requireNumbers?: boolean
    requireSpecialChars?: boolean
    specialChars?: string
}

const DEFAULT_REQUIREMENTS: Required<PasswordRequirements> = {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
}

export const validatePassword = (
    password: string,
    requirements: PasswordRequirements = {}
): PasswordValidationResult => {
    const config = { ...DEFAULT_REQUIREMENTS, ...requirements }
    const errors: string[] = []

    // Check minimum length
    if (password.length < config.minLength) {
        errors.push(`Mật khẩu phải có ít nhất ${config.minLength} ký tự`)
    }

    // Check lowercase letters
    if (config.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Mật khẩu phải chứa ít nhất một chữ cái thường')
    }

    // Check uppercase letters
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Mật khẩu phải chứa ít nhất một chữ cái hoa')
    }

    // Check numbers
    if (config.requireNumbers && !/\d/.test(password)) {
        errors.push('Mật khẩu phải chứa ít nhất một chữ số')
    }

    // Check special characters
    if (config.requireSpecialChars) {
        const specialCharRegex = new RegExp(`[${config.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`)
        if (!specialCharRegex.test(password)) {
            errors.push('Mật khẩu phải chứa ít nhất một ký tự đặc biệt (!@#$%^&*()_+-=[]{}|;:,.<>?)')
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

// Convenience function for form validation
export const passwordValidator = (value: string, requirements?: PasswordRequirements): string | null => {
    if (!value) return 'Mật khẩu là bắt buộc'

    const validation = validatePassword(value, requirements)
    if (!validation.isValid) {
        return validation.errors[0]
    }

    return null
}

// Function to get password requirements text
export const getPasswordRequirementsText = (requirements: PasswordRequirements = {}): string[] => {
    const config = { ...DEFAULT_REQUIREMENTS, ...requirements }
    const texts: string[] = []

    texts.push(`Ít nhất ${config.minLength} ký tự`)

    if (config.requireLowercase) {
        texts.push('Một chữ cái thường (a-z)')
    }

    if (config.requireUppercase) {
        texts.push('Một chữ cái hoa (A-Z)')
    }

    if (config.requireNumbers) {
        texts.push('Một chữ số (0-9)')
    }

    if (config.requireSpecialChars) {
        texts.push('Một ký tự đặc biệt (!@#$%^&*()_+-=[]{}|;:,.<>?)')
    }

    return texts
}
