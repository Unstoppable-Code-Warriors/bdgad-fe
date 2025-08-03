export interface EmailValidationResult {
    isValid: boolean
    errors: string[]
}

// RFC 5322 compliant email regex (simplified version)
const EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

// Common email domains for additional validation
const COMMON_DOMAINS = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'live.com',
    'icloud.com',
    'aol.com',
    'protonmail.com',
    'mail.com',
    'zoho.com'
]

export const validateEmail = (email: string): EmailValidationResult => {
    const errors: string[] = []

    // Check if email is provided
    if (!email) {
        errors.push('Email is required')
        return { isValid: false, errors }
    }

    // Check basic format
    if (!EMAIL_REGEX.test(email)) {
        errors.push('Please enter a valid email address')
        return { isValid: false, errors }
    }

    // Check for common issues
    if (email.includes('..')) {
        errors.push('Email cannot contain consecutive dots')
    }

    if (email.startsWith('.') || email.endsWith('.')) {
        errors.push('Email cannot start or end with a dot')
    }

    if (email.includes(' ')) {
        errors.push('Email cannot contain spaces')
    }

    // Check length constraints
    if (email.length > 254) {
        errors.push('Email address is too long (maximum 254 characters)')
    }

    const [localPart, domain] = email.split('@')

    if (localPart && localPart.length > 64) {
        errors.push('Email local part is too long (maximum 64 characters)')
    }

    if (domain && domain.length > 253) {
        errors.push('Email domain is too long (maximum 253 characters)')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

export const emailValidator = (value: string): string | null => {
    const validation = validateEmail(value)
    if (!validation.isValid) {
        return validation.errors[0]
    }
    return null
}

export const isCommonEmailDomain = (email: string): boolean => {
    if (!email || !email.includes('@')) return false

    const domain = email.split('@')[1]?.toLowerCase()
    return COMMON_DOMAINS.includes(domain)
}

// Function to suggest common email domain corrections
export const suggestEmailCorrection = (email: string): string | null => {
    if (!email || !email.includes('@')) return null

    const [localPart, domain] = email.split('@')
    const domainLower = domain?.toLowerCase()

    // Common typos and their corrections
    const typoCorrections: Record<string, string> = {
        'gmial.com': 'gmail.com',
        'gmai.com': 'gmail.com',
        'gmail.co': 'gmail.com',
        'yahooo.com': 'yahoo.com',
        'yaho.com': 'yahoo.com',
        'hotmai.com': 'hotmail.com',
        'hotmial.com': 'hotmail.com',
        'outlok.com': 'outlook.com',
        'outloook.com': 'outlook.com'
    }

    if (domainLower && typoCorrections[domainLower]) {
        return `${localPart}@${typoCorrections[domainLower]}`
    }

    return null
}

// Function to normalize email (lowercase, trim)
export const normalizeEmail = (email: string): string => {
    return email.trim().toLowerCase()
}
