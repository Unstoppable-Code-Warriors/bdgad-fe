import { useState } from 'react'
import { authService } from '@/services/function/auth'
import { showErrorNotification } from '@/utils/notifications'

export const useGoogleAuth = () => {
    const [loading, setLoading] = useState(false)

    const initiateGoogleLogin = async () => {
        setLoading(true)

        try {
            // Construct the callback URL for this application
            const callbackUrl = `${window.location.origin}/auth/callback`

            // Call the auth service to get the Google OAuth URL
            const response = await authService.initiateGoogleOAuth(callbackUrl)

            if (response.data?.oauthUrl) {
                // Redirect to Google OAuth
                window.location.href = response.data.oauthUrl
            } else {
                throw new Error('Failed to get OAuth URL from server')
            }
        } catch (error) {
            console.error('Google OAuth initiation error:', error)

            // Show error notification
            showErrorNotification({
                title: 'Đăng nhập Google thất bại',
                message: 'Không thể khởi tạo đăng nhập Google. Vui lòng thử lại.'
            })

            setLoading(false)
        }
    }

    return {
        initiateGoogleLogin,
        loading
    }
}
