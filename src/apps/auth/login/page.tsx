import { useState } from 'react'
import {
    Paper,
    TextInput,
    PasswordInput,
    Button,
    Title,
    Text,
    Anchor,
    Container,
    Stack,
    Divider,
    Alert
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconMail, IconLock, IconBrandGoogle, IconAlertCircle } from '@tabler/icons-react'
import { authService } from '@/services/function/auth'
import { setTokensOutside } from '@/stores/auth.store'
import { Link, useNavigate } from 'react-router'
import { emailValidator, normalizeEmail, suggestEmailCorrection } from '@/utils/validateEmail'
import { authNotifications } from '@/utils/notifications'
import { getLoginErrorMessage } from '@/utils/error'
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
                setTokensOutside(response.data.token)
                authNotifications.loginSuccess()
                navigate('/')
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

    // Determine if any loading state is active
    const isLoading = loading || googleLoading

    return (
        <Container size={420} my={40}>
            <Title ta='center' order={1} mb='md'>
                Chào mừng trở lại!
            </Title>
            <Text c='dimmed' size='sm' ta='center' mb='xl'>
                Đăng nhập vào tài khoản của bạn để tiếp tục
            </Text>

            <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
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
                        />

                        <Button type='submit' fullWidth mt='md' loading={loading} disabled={isLoading}>
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
                        >
                            Đăng nhập với Google
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Container>
    )
}

export default LoginPage
