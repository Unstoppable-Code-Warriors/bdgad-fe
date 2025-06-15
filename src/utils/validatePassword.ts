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
        errors.push(`Password must be at least ${config.minLength} characters long`)
    }

    // Check lowercase letters
    if (config.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
    }

    // Check uppercase letters
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
    }

    // Check numbers
    if (config.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number')
    }

    // Check special characters
    if (config.requireSpecialChars) {
        const specialCharRegex = new RegExp(`[${config.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`)
        if (!specialCharRegex.test(password)) {
            errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)')
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

// Convenience function for form validation
export const passwordValidator = (value: string, requirements?: PasswordRequirements): string | null => {
    if (!value) return 'Password is required'
    
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

    texts.push(`At least ${config.minLength} characters`)
    
    if (config.requireLowercase) {
        texts.push('One lowercase letter (a-z)')
    }
    
    if (config.requireUppercase) {
        texts.push('One uppercase letter (A-Z)')
    }
    
    if (config.requireNumbers) {
        texts.push('One number (0-9)')
    }
    
    if (config.requireSpecialChars) {
        texts.push('One special character (!@#$%^&*()_+-=[]{}|;:,.<>?)')
    }

    return texts
}