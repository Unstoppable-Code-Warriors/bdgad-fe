import { useState } from 'react'
import {
    Paper,
    TextInput,
    PasswordInput,
    Button,
    Title,
    Text,
    Anchor,
    Stack,
    Divider,
    Alert,
    Grid,
    Box
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconMail, IconLock, IconBrandGoogle, IconAlertCircle } from '@tabler/icons-react'
import { authService } from '@/services/function/auth'
import { loginOutside } from '@/stores/auth.store'
import { Link, useNavigate } from 'react-router'
import { emailValidator, normalizeEmail, suggestEmailCorrection } from '@/utils/validateEmail'
import { authNotifications } from '@/utils/notifications'
import { getLoginErrorMessage } from '@/utils/error'
import { getDefaultRouteByRole } from '@/utils/constant'
import { useGoogleAuth } from '@/hooks/use-google-auth'

interface LoginFormValues {
    email: string
    password: string
}

const LoginPage = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null)
    const navigate = useNavigate()

    // Google OAuth hook
    const { initiateGoogleLogin, loading: googleLoading } = useGoogleAuth()

    const form = useForm<LoginFormValues>({
        initialValues: {
            email: '',
            password: ''
        },
        validate: {
            email: emailValidator,
            password: (value) => {
                if (!value) return 'Mật khẩu là bắt buộc'
                return null
            }
        }
    })

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const email = event.currentTarget.value
        form.setFieldValue('email', email)

        // Check for email suggestions
        const suggestion = suggestEmailCorrection(email)
        setEmailSuggestion(suggestion)
    }

    const handleEmailSuggestionClick = () => {
        if (emailSuggestion) {
            form.setFieldValue('email', emailSuggestion)
            setEmailSuggestion(null)
        }
    }

    const handleLogin = async (values: LoginFormValues) => {
        setLoading(true)
        setError(null)
        setEmailSuggestion(null)

        try {
            const normalizedValues = {
                ...values,
                email: normalizeEmail(values.email)
            }

            const response = await authService.login(normalizedValues)
            if ('code' in response) {
                setError(getLoginErrorMessage(response.code as string))
            } else {
                loginOutside(response.data.token, response.data.user)
                authNotifications.loginSuccess()
                console.log('Login successful, redirecting to:', response.data)

                const defaultRoute = getDefaultRouteByRole(Number(response.data.user.roles[0].code))
                console.log('Login successful, redirecting to:', defaultRoute)
                navigate(defaultRoute)
            }
        } catch (err) {
            console.error('Error login:', err)
            setError('Lỗi đăng nhập. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setError(null)
        await initiateGoogleLogin()
    }

    const isLoading = loading || googleLoading

    return (
        <Box style={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden' }}>
            <Grid grow style={{ margin: 0, width: '100%', height: '100%' }}>
                {/* Left side - Image */}
                <Grid.Col span={6} style={{ padding: 0, position: 'relative', height: '110vh' }}>
                    <Box
                        style={{
                            height: '100%',
                            width: '100%',
                            background: `url('/assets/images/background-login.webp') center/cover`,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Overlay gradient for better text readability */}
                        <Box
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2rem'
                            }}
                        ></Box>
                    </Box>
                </Grid.Col>

                {/* Right side - Login Form */}
                <Grid.Col
                    span={6}
                    style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Box style={{ width: '100%', maxWidth: 480, padding: '2rem' }}>
                        <Title ta='center' order={2} mb='md' c='dark'>
                            Chào mừng bạn!
                        </Title>
                        <Text c='dimmed' size='sm' ta='center' mb='xl'>
                            Đăng nhập vào tài khoản của bạn để tiếp tục
                        </Text>

                        <Paper withBorder shadow='lg' p={40} radius='md'>
                            {error && (
                                <Alert icon={<IconAlertCircle size='1rem' />} color='red' mb='md' variant='light'>
                                    {error}
                                </Alert>
                            )}

                            <form onSubmit={form.onSubmit(handleLogin)}>
                                <Stack gap='md'>
                                    <div>
                                        <TextInput
                                            label='Email'
                                            placeholder='your@email.com'
                                            leftSection={<IconMail size='1rem' />}
                                            {...form.getInputProps('email')}
                                            onChange={handleEmailChange}
                                            disabled={isLoading}
                                            size='md'
                                        />

                                        {/* Email suggestion */}
                                        {emailSuggestion && (
                                            <Text
                                                size='xs'
                                                c='blue'
                                                mt='xs'
                                                style={{ cursor: 'pointer' }}
                                                onClick={handleEmailSuggestionClick}
                                            >
                                                Ý bạn là: {emailSuggestion}?
                                            </Text>
                                        )}
                                    </div>

                                    <PasswordInput
                                        label='Mật khẩu'
                                        placeholder='Mật khẩu của bạn'
                                        leftSection={<IconLock size='1rem' />}
                                        {...form.getInputProps('password')}
                                        disabled={isLoading}
                                        size='md'
                                    />

                                    <Button
                                        type='submit'
                                        fullWidth
                                        mt='md'
                                        loading={loading}
                                        disabled={isLoading}
                                        size='md'
                                    >
                                        Đăng nhập
                                    </Button>

                                    <Text ta='center' mt='xs'>
                                        <Anchor component={Link} to='/auth/forgot-password' c='dimmed' size='sm'>
                                            Quên mật khẩu?
                                        </Anchor>
                                    </Text>

                                    <Divider label='Hoặc tiếp tục với' labelPosition='center' my='lg' />

                                    <Button
                                        variant='outline'
                                        fullWidth
                                        leftSection={<IconBrandGoogle size='1rem' />}
                                        onClick={handleGoogleLogin}
                                        loading={googleLoading}
                                        disabled={isLoading}
                                        size='md'
                                    >
                                        Đăng nhập với Google
                                    </Button>
                                </Stack>
                            </form>
                        </Paper>
                    </Box>
                </Grid.Col>
            </Grid>
        </Box>
    )
}

export default LoginPage
