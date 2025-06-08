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
import { notifications } from '@mantine/notifications'

interface LoginFormValues {
    email: string
    password: string
}

const LoginPage = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const form = useForm<LoginFormValues>({
        initialValues: {
            email: '',
            password: ''
        },
        validate: {
            email: (value) => {
                if (!value) return 'Email is required'
                if (!/^\S+@\S+$/.test(value)) return 'Invalid email format'
                return null
            },
            password: (value) => {
                if (!value) return 'Password is required'
                if (value.length < 8) return 'Password must be at least 8 characters'
                return null
            }
        }
    })

    const handleLogin = async (values: LoginFormValues) => {
        setLoading(true)
        setError(null)

        try {
            const response = await authService.login(values)
            setTokensOutside(response.token)
            navigate('/')
            notifications.show({
                title: 'Login successful',
                message: 'You have been logged in successfully',
                color: 'green'
            })
        } catch (err) {
            console.error(err)

            setError('Invalid email or password. Please try again.')
            notifications.show({
                title: 'Login failed',
                message: 'Invalid email or password. Please try again.',
                color: 'red'
            })
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

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // For demo purposes - you'll need to implement actual Google OAuth
            // Example: const response = await authService.loginWithGoogle()
        } catch (err) {
            setError('Failed to login with Google. Please try again.')
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
                        <TextInput
                            label='Email'
                            placeholder='your@email.com'
                            leftSection={<IconMail size='1rem' />}
                            {...form.getInputProps('email')}
                        />

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
