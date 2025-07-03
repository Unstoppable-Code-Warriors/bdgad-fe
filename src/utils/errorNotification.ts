import { showNotification } from "@mantine/notifications"

export const showErrorNotification = (message: string, title: string = 'Lỗi') => {
    showNotification({
        title,
        message,
        color: 'red'
    })
    
}

export const showErrorLoginNotification = (code: string) => {
    switch (code) {
        case 'INVALID_CREDENTIALS':
            showErrorNotification('Tài khoản hoặc mật khẩu không chính xác', 'Lỗi đăng nhập')
            break
        case 'ACCOUNT_INACTIVE':
            showErrorNotification('Tài khoản đã bị vô hiệu hóa', 'Lỗi đăng nhập')
            break
        default:
            showErrorNotification('Lỗi đăng nhập không xác định', 'Lỗi đăng nhập')
    }
}

export const showErrorGetProfileNotification = (code: string) => {
    switch (code) {
        case 'USER_NOT_AUTHENTICATED':
            showErrorNotification('Bạn chưa đăng nhập tài khoản', 'Lỗi lấy thông tin tài khoản')
            break
        case 'USER_NOT_FOUND':
            showErrorNotification('Không tìm thấy thông tin tài khoản', 'Lỗi lấy thông tin tài khoản') 
            break
        case 'ACCOUNT_INACTIVE':
            showErrorNotification('Tài khoản đã bị vô hiệu hóa', 'Lỗi lấy thông tin tài khoản')
            break
        default:
            showErrorNotification('Lỗi lấy thông tin tài khoản không xác định', 'Lỗi lấy thông tin tài khoản')
    }
}

export const showErrorVerifyTokenNotification = (code: string) => {
    switch (code) {
        case 'INVALID_TOKEN':
            showErrorNotification('Mã xác thực không hợp lệ', 'Lỗi xác thực tài khoản')
            break
        default:
            showErrorNotification('Lỗi xác thực tài khoản không xác định', 'Lỗi xác thực tài khoản')
    }
}

export const showErrorChangePasswordNotification = (code: string) => {
    switch (code) {
        case 'USER_NOT_AUTHENTICATED':
            showErrorNotification('Bạn chưa đăng nhập tài khoản', 'Lỗi thay đổi mật khẩu')
            break
        case 'USER_NOT_FOUND':
            showErrorNotification('Không tìm thấy thông tin tài khoản', 'Lỗi thay đổi mật khẩu')
            break
        case 'ACCOUNT_INACTIVE':
            showErrorNotification('Tài khoản đã bị vô hiệu hóa', 'Lỗi thay đổi mật khẩu')
            break
        case 'PASSWORD_MISMATCH':
            showErrorNotification('Mật khẩu hiện tại không chính xác', 'Lỗi thay đổi mật khẩu')
            break
        case 'SAME_PASSWORD':
            showErrorNotification('Mật khẩu mới không được trùng với mật khẩu hiện tại', 'Lỗi thay đổi mật khẩu')
            break
        default:
            showErrorNotification('Lỗi thay đổi mật khẩu không xác định', 'Lỗi thay đổi mật khẩu')
    }
}

export const showErrorForgotPasswordNotification = (code: string) => {
    switch (code) {
        case 'EMAIL_NOT_FOUND':
            showErrorNotification('Email không tồn tại', 'Lỗi quên mật khẩu')
            break
        case 'ACCOUNT_INACTIVE':
            showErrorNotification('Tài khoản đã bị vô hiệu hóa', 'Lỗi quên mật khẩu')
            break
        default:
            showErrorNotification('Lỗi quên mật khẩu không xác định', 'Lỗi quên mật khẩu')
    }
}

export const showErrorResetPasswordNotification = (code: string) => {
    switch (code) {
        case 'INVALID_TOKEN':
            showErrorNotification('Mã xác thực không hợp lệ', 'Lỗi đặt lại mật khẩu')
            break
        case 'TOKEN_EXPIRED':
            showErrorNotification('Mã xác thực đã hết hạn', 'Lỗi đặt lại mật khẩu')
            break
        case 'USER_NOT_FOUND':
            showErrorNotification('Không tìm thấy thông tin tài khoản', 'Lỗi đặt lại mật khẩu')
            break
        case 'ACCOUNT_INACTIVE':
            showErrorNotification('Tài khoản đã bị vô hiệu hóa', 'Lỗi đặt lại mật khẩu')
            break
        case 'SAME_PASSWORD':
            showErrorNotification('Mật khẩu mới không được trùng với mật khẩu hiện tại', 'Lỗi đặt lại mật khẩu')
            break
        case 'EMAIL_SEND_FAILED':
            showErrorNotification('Lỗi gửi email đặt lại mật khẩu', 'Lỗi đặt lại mật khẩu')
            break
        default:
            showErrorNotification('Lỗi đặt lại mật khẩu không xác định', 'Lỗi đặt lại mật khẩu')
    }
}

export const showErrorUpdateProfileNotification = (code: string) => {
    switch (code) {
        case 'USER_NOT_AUTHENTICATED':
            showErrorNotification('Bạn chưa đăng nhập tài khoản', 'Lỗi cập nhật thông tin tài khoản')
            break
        case 'USER_NOT_FOUND':
            showErrorNotification('Không tìm thấy thông tin tài khoản', 'Lỗi cập nhật thông tin tài khoản')
            break
        case 'ACCOUNT_INACTIVE':
            showErrorNotification('Tài khoản đã bị vô hiệu hóa', 'Lỗi cập nhật thông tin tài khoản')
            break
        default:
            showErrorNotification('Lỗi cập nhật thông tin tài khoản không xác định', 'Lỗi cập nhật thông tin tài khoản')
    }
}



