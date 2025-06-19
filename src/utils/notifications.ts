import { notifications } from '@mantine/notifications'

export interface NotificationOptions {
    title: string
    message: string
    position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center'
    autoClose?: number | false
}

export const showSuccessNotification = ({
    title,
    message,
    position = 'top-right',
    autoClose = 3000
}: NotificationOptions) => {
    notifications.show({
        title,
        message,
        color: 'green',
        position,
        autoClose
    })
}

export const showErrorNotification = ({
    title,
    message,
    position = 'top-right',
    autoClose = 5000
}: NotificationOptions) => {
    notifications.show({
        title,
        message,
        color: 'red',
        position,
        autoClose
    })
}

export const showWarningNotification = ({
    title,
    message,
    position = 'top-right',
    autoClose = 4000
}: NotificationOptions) => {
    notifications.show({
        title,
        message,
        color: 'yellow',
        position,
        autoClose
    })
}

export const showInfoNotification = ({
    title,
    message,
    position = 'top-right',
    autoClose = 3000
}: NotificationOptions) => {
    notifications.show({
        title,
        message,
        color: 'blue',
        position,
        autoClose
    })
}

export const authNotifications = {
    loginSuccess: () => showSuccessNotification({
        title: 'Login successful',
        message: 'You have been logged in successfully',
        autoClose: 1000
    }),
    
    loginError: () => showErrorNotification({
        title: 'Login failed',
        message: 'Invalid email or password. Please try again.'
    }),
    
    logoutSuccess: () => showSuccessNotification({
        title: 'Logged out',
        message: 'You have been logged out successfully'
    }),
    
    registerSuccess: () => showSuccessNotification({
        title: 'Registration successful',
        message: 'Your account has been created successfully'
    }),
    
    registerError: () => showErrorNotification({
        title: 'Registration failed',
        message: 'Failed to create account. Please try again.'
    }),
    
    passwordResetSuccess: () => showSuccessNotification({
        title: 'Password reset successful',
        message: 'Your password has been updated successfully'
    }),
    
    passwordResetError: () => showErrorNotification({
        title: 'Password reset failed',
        message: 'Failed to reset password. The token may be expired or invalid.'
    }),
    
    forgotPasswordSuccess: () => showSuccessNotification({
        title: 'Reset link sent',
        message: 'Check your email for password reset instructions'
    }),
    
    forgotPasswordError: () => showErrorNotification({
        title: 'Failed to send reset link',
        message: 'Please check your email address and try again.'
    }),

    passwordCreateSuccess: () => showSuccessNotification({
        title: 'Mật khẩu đã được tạo',
        message: 'Mật khẩu mới đã được tạo thành công',
    }),
    passwordCreateError: () => showErrorNotification({
        title: 'Tạo mật khẩu thất bại',
        message: 'Đã xảy ra lỗi khi tạo mật khẩu mới. Vui lòng thử lại.',
    }),
}