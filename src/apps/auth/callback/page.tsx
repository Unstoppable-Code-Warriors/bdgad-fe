import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { Container, Paper, Text, Loader, Alert, Stack, ThemeIcon } from '@mantine/core'
import { IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react'
import { setTokensOutside } from '@/stores/auth.store'
import { authNotifications } from '@/utils/notifications'

const CallbackPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [processing, setProcessing] = useState(true)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const token = searchParams.get('token')
                const status = searchParams.get('status')
                const errorParam = searchParams.get('error')
                const message = searchParams.get('message')

                if (status === 'success' && token) {
                    // Successful authentication
                    setTokensOutside(token)
                    setSuccess(true)
                    setProcessing(false)

                    authNotifications.loginSuccess()

                    // Redirect to home after a short delay
                    setTimeout(() => {
                        navigate('/', { replace: true })
                    }, 1500)
                } else if (errorParam) {
                    // Authentication failed
                    let error = ''

                    if (errorParam == 'ACCOUNT_INACTIVE') {
                        error = 'Tài khoản của bạn bị tạm dừng hoạt động.'
                    }
                    const errorMessage = message ? decodeURIComponent(message) : 'Đăng nhập Google thất bại'
                    setError(error || errorMessage)
                    setProcessing(false)

                    // Redirect to login after a delay
                    setTimeout(() => {
                        navigate('/auth/login', { replace: true })
                    }, 3000)
                } else {
                    // Invalid callback parameters
                    setError('Phản hồi không hợp lệ từ Google OAuth')
                    setProcessing(false)

                    setTimeout(() => {
                        navigate('/auth/login', { replace: true })
                    }, 3000)
                }
            } catch (err) {
                console.error('OAuth callback error:', err)
                setError('Có lỗi xảy ra trong quá trình xử lý đăng nhập Google')
                setProcessing(false)

                setTimeout(() => {
                    navigate('/auth/login', { replace: true })
                }, 3000)
            }
        }

        handleCallback()
    }, [searchParams, navigate])

    if (processing) {
        return (
            <Container size={420} my={40}>
                <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
                    <Stack align='center' gap='md'>
                        <Loader size='lg' />
                        <Text ta='center'>Đang xử lý đăng nhập Google...</Text>
                        <Text size='sm' c='dimmed' ta='center'>
                            Vui lòng đợi trong giây lát
                        </Text>
                    </Stack>
                </Paper>
            </Container>
        )
    }

    if (success) {
        return (
            <Container size={420} my={40}>
                <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
                    <Stack align='center' gap='md'>
                        <ThemeIcon color='green' size={64} radius='xl'>
                            <IconCheck size={32} />
                        </ThemeIcon>
                        <Text ta='center' size='lg' fw={500}>
                            Đăng nhập thành công!
                        </Text>
                        <Text size='sm' c='dimmed' ta='center'>
                            Bạn sẽ được chuyển hướng đến trang chủ...
                        </Text>
                    </Stack>
                </Paper>
            </Container>
        )
    }

    if (error) {
        return (
            <Container size={420} my={40}>
                <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
                    <Stack align='center' gap='md'>
                        <ThemeIcon color='red' size={64} radius='xl'>
                            <IconX size={32} />
                        </ThemeIcon>
                        <Text ta='center' size='lg' fw={500} c='red'>
                            Đăng nhập thất bại
                        </Text>
                        <Alert icon={<IconAlertCircle size='1rem' />} color='red' variant='light'>
                            {error}
                        </Alert>
                        <Text size='sm' c='dimmed' ta='center'>
                            Bạn sẽ được chuyển về trang đăng nhập...
                        </Text>
                    </Stack>
                </Paper>
            </Container>
        )
    }

    return null
}

export default CallbackPage
