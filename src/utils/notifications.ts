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
    // Auth
    loginSuccess: () =>
        showSuccessNotification({
            title: 'Đăng nhập thành công',
            message: 'Bạn đã đăng nhập thành công',
            autoClose: 1000
        }),

    loginError: () =>
        showErrorNotification({
            title: 'Đăng nhập thất bại',
            message: 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.'
        }),

    logoutSuccess: () =>
        showSuccessNotification({
            title: 'Đăng xuất thành công',
            message: 'Bạn đã đăng xuất thành công'
        }),

    registerSuccess: () =>
        showSuccessNotification({
            title: 'Đăng ký thành công',
            message: 'Tài khoản của bạn đã được tạo thành công'
        }),

    registerError: () =>
        showErrorNotification({
            title: 'Đăng ký thất bại',
            message: 'Không thể tạo tài khoản. Vui lòng thử lại.'
        }),

    passwordResetSuccess: () =>
        showSuccessNotification({
            title: 'Đặt lại mật khẩu thành công',
            message: 'Mật khẩu của bạn đã được cập nhật thành công'
        }),

    passwordResetError: () =>
        showErrorNotification({
            title: 'Đặt lại mật khẩu thất bại',
            message: 'Không thể đặt lại mật khẩu. Token có thể đã hết hạn hoặc không hợp lệ.'
        }),

    forgotPasswordSuccess: () =>
        showSuccessNotification({
            title: 'Đã gửi liên kết đặt lại',
            message: 'Kiểm tra email của bạn để biết hướng dẫn đặt lại mật khẩu'
        }),

    forgotPasswordError: () =>
        showErrorNotification({
            title: 'Không thể gửi liên kết đặt lại',
            message: 'Vui lòng kiểm tra địa chỉ email và thử lại.'
        }),

    passwordCreateSuccess: () =>
        showSuccessNotification({
            title: 'Mật khẩu đã được tạo',
            message: 'Mật khẩu mới đã được tạo thành công'
        }),
    passwordCreateError: () =>
        showErrorNotification({
            title: 'Tạo mật khẩu thất bại',
            message: 'Đã xảy ra lỗi khi tạo mật khẩu mới. Vui lòng thử lại.'
        }),
    //Profile
    changePasswordSuccess: () =>
        showSuccessNotification({
            title: 'Đổi mật khẩu thành công',
            message: 'Mật khẩu của bạn đã được đổi thành công'
        }),
    changePasswordError: () =>
        showErrorNotification({
            title: 'Đổi mật khẩu thất bại',
            message: 'Không thể đổi mật khẩu. Vui lòng thử lại.'
        }),
    currentPasswordError: () =>
        showErrorNotification({
            title: 'Mật khẩu hiện tại không đúng',
            message: 'Không thể đổi mật khẩu. Vui lòng thử lại.'
        }),
    changeSamePassword: () =>
        showWarningNotification({
            title: 'Mật khẩu mới giống mật khẩu cũ',
            message: 'Vui lòng nhập mật khẩu mới khác với mật khẩu hiện tại.'
        })
    // General Files
}
