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
import { authNotifications, showErrorNotification } from '@/utils/notifications'
import { HTTPError } from 'ky'

interface LoginFormValues {
    email: string
    password: string
}

const LoginPage = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null)
    const navigate = useNavigate()

    const form = useForm<LoginFormValues>({
        initialValues: {
            email: '',
            password: ''
        },
        validate: {
            email: emailValidator,
            password: (value) => {
                if (!value) return 'Password is required'
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

            setTokensOutside(response.data.token)
            navigate('/')
            authNotifications.loginSuccess()
        } catch (err) {
            console.error('Error login:', err)
            if (err instanceof HTTPError) {
                const errorData = (err as any).errorData
                if (errorData && typeof errorData === 'object') {
                    setError(errorData.message || 'Lỗi xác thực')
                }
            }
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setLoading(true)
        setError(null)

        try {
            // TODO: Implement Google OAuth logic here
            console.log('Google login attempt')

            await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (err) {
            setError('Failed to login with Google. Please try again.')
            showErrorNotification({
                title: 'Google login failed',
                message: 'Failed to login with Google. Please try again.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container size={420} my={40}>
            <Title ta='center' order={1} mb='md'>
                Welcome back!
            </Title>
            <Text c='dimmed' size='sm' ta='center' mb='xl'>
                Sign in to your account to continue
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
                                    Did you mean: {emailSuggestion}?
                                </Text>
                            )}
                        </div>

                        <PasswordInput
                            label='Password'
                            placeholder='Your password'
                            leftSection={<IconLock size='1rem' />}
                            {...form.getInputProps('password')}
                        />

                        <Button type='submit' fullWidth mt='md' loading={loading} disabled={loading}>
                            Sign in
                        </Button>

                        <Text ta='center' mt='xs'>
                            <Anchor component={Link} to='/auth/forgot-password' c='dimmed' size='sm'>
                                Forgot your password?
                            </Anchor>
                        </Text>

                        <Divider label='Or continue with' labelPosition='center' my='lg' />

                        <Button
                            variant='outline'
                            fullWidth
                            leftSection={<IconBrandGoogle size='1rem' />}
                            onClick={handleGoogleLogin}
                            loading={loading}
                            disabled={loading}
                        >
                            Continue with Google
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Container>
    )
}

export default LoginPage
