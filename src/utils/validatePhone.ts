export const validatePhone = (phone: string): string | null => {
    if (!phone) return null // Phone is optional
    
    const cleanPhone = phone.replace(/\D/g, '')
    
    if (cleanPhone.length !== 10) {
        return 'Số điện thoại phải có đúng 10 chữ số'
    }
        
    return null
}

export const formatPhone = (phone: string): string => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Format as XXX XXX XXXX
    if (cleanPhone.length >= 6) {
        return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')
    } else if (cleanPhone.length >= 3) {
        return cleanPhone.replace(/(\d{3})(\d+)/, '$1 $2')
    }
    
    return cleanPhone
}

export const normalizePhone = (phone: string): string => {
    // Remove all spaces and special characters, keep only numbers
    return phone.replace(/\D/g, '')
}