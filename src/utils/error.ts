export interface ErrorResponse {
    code: string
    message: string
}

export const getLoginErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'INVALID_CREDENTIALS':
            return 'Email hoặc mật khẩu không chính xác'
        case 'ACCOUNT_INACTIVE':
            return 'Tài khoản đã bị vô hiệu hóa'
        case 'EMAIL_NOT_VERIFIED':
            return 'Email chưa được xác thực'
        case 'ACCOUNT_LOCKED':
            return 'Tài khoản đã bị khóa'
        case 'TOO_MANY_ATTEMPTS':
            return 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau'
        default:
            return 'Lỗi đăng nhập không xác định'
    }
}

export const getForgotPasswordErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'EMAIL_NOT_FOUND':
            return 'Email không tồn tại trong hệ thống'
        case 'ACCOUNT_INACTIVE':
            return 'Tài khoản đã bị vô hiệu hóa'
        case 'EMAIL_SEND_FAILED':
            return 'Lỗi gửi email đặt lại mật khẩu'
        default:
            return 'Lỗi quên mật khẩu không xác định'
    }
}

export const handleAuthError = (error: any): string => {
    if (error?.code) {
        return getLoginErrorMessage(error.code)
    }
    
    if (error?.message) {
        return error.message
    }
    
    return 'Đã xảy ra lỗi không xác định'
}