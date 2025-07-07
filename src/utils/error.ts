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

export const getChangePasswordErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'USER_NOT_AUTHENTICATED':
            return 'Bạn chưa đăng nhập tài khoản'
        case 'USER_NOT_FOUND':
            return 'Không tìm thấy thông tin tài khoản'
        case 'ACCOUNT_INACTIVE':
            return 'Tài khoản đã bị vô hiệu hóa'
        case 'PASSWORD_MISMATCH':
            return 'Mật khẩu hiện tại không chính xác'
        case 'SAME_PASSWORD':
            return 'Mật khẩu mới không được trùng với mật khẩu hiện tại'
        default:
            return 'Lỗi đổi mật khẩu không xác định'
    }
}

export const getResetPasswordErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'INVALID_TOKEN':
            return 'Mã xác thực không hợp lệ'
        case 'TOKEN_EXPIRED':
            return 'Mã xác thực đã hết hạn'
        case 'USER_NOT_FOUND':
            return 'Không tìm thấy thông tin tài khoản'
        case 'ACCOUNT_INACTIVE':
            return 'Tài khoản đã bị vô hiệu hóa'
        case 'SAME_PASSWORD':
            return 'Mật khẩu mới không được trùng với mật khẩu hiện tại'
        case 'EMAIL_SEND_FAILED':
            return 'Lỗi gửi email đặt lại mật khẩu'
        default:
            return 'Lỗi đặt lại mật khẩu không xác định'
    }
}

export const getUpdateProfileErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'USER_NOT_AUTHENTICATED':
            return 'Bạn chưa đăng nhập tài khoản'
        case 'USER_NOT_FOUND':
            return 'Không tìm thấy thông tin tài khoản'
        case 'ACCOUNT_INACTIVE':
            return 'Tài khoản đã bị vô hiệu hóa'
        case 'INVALID_PHONE':
            return 'Số điện thoại không hợp lệ'
        case 'INVALID_NAME':
            return 'Tên không hợp lệ'
        case 'INVALID_ADDRESS':
            return 'Địa chỉ không hợp lệ'
        case 'PHONE_ALREADY_EXISTS':
            return 'Số điện thoại đã được sử dụng'
        default:
            return 'Lỗi cập nhật thông tin tài khoản không xác định'
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