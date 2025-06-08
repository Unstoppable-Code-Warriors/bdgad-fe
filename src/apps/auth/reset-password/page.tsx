import { useState, useEffect } from 'react'
import { Paper, PasswordInput, Button, Title, Text, Anchor, Container, Stack, Alert } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconLock, IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { authService } from '@/services/function/auth'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { notifications } from '@mantine/notifications'

interface ResetPasswordFormValues {
    newPassword: string
    confirmPassword: string
}

const ResetPasswordPage = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')

    const form = useForm<ResetPasswordFormValues>({
        initialValues: {
            newPassword: '',
            confirmPassword: ''
        },
        validate: {
            newPassword: (value) => {
                if (!value) return 'Password is required'
                if (value.length < 8) return 'Password must be at least 8 characters'
                return null
            },
            confirmPassword: (value, values) => {
                if (!value) return 'Please confirm your password'
                if (value !== values.newPassword) return 'Passwords do not match'
                return null
            }
        }
    })

    // Check if token exists on component mount
    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token. Please request a new password reset.')
        }
    }, [token])

    const handleResetPassword = async (values: ResetPasswordFormValues) => {
        if (!token) {
            setError('Invalid or missing reset token.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            await authService.resetPassword({
                token,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword
            })

            setSuccess(true)
            notifications.show({
                title: 'Password reset successful',
                message: 'Your password has been updated successfully',
                color: 'green',
                icon: <IconCheck size='1rem' />
            })
        } catch (err) {
            console.error(err)
            const errorMessage = 'Failed to reset password. The token may be expired or invalid.'
            setError(errorMessage)
            notifications.show({
                title: 'Password reset failed',
                message: errorMessage,
                color: 'red'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleGoToLogin = () => {
        navigate('/auth/login')
    }

    if (success) {
        return (
            <Container size={420} my={40}>
                <Title ta='center' order={1} mb='md'>
                    Password Reset Complete
                </Title>
                <Text c='dimmed' size='sm' ta='center' mb='xl'>
                    Your password has been successfully updated
                </Text>

                <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
                    <Alert icon={<IconCheck size='1rem' />} color='green' mb='md' variant='light'>
                        Your password has been reset successfully!
                    </Alert>

                    <Stack gap='md'>
                        <Text size='sm' c='dimmed' ta='center'>
                            You can now sign in with your new password.
                        </Text>

                        <Button fullWidth onClick={handleGoToLogin}>
                            Go to Login
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        )
    }

    return (
        <Container size={420} my={40}>
            <Title ta='center' order={1} mb='md'>
                Reset Your Password
            </Title>
            <Text c='dimmed' size='sm' ta='center' mb='xl'>
                Enter your new password below
            </Text>

            <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
                {error && (
                    <Alert icon={<IconAlertCircle size='1rem' />} color='red' mb='md' variant='light'>
                        {error}
                    </Alert>
                )}

                {!token ? (
                    <Stack gap='md'>
                        <Text ta='center' c='dimmed'>
                            This reset link is invalid or has expired.
                        </Text>
                        <Anchor component={Link} to='/auth/forgot-password' ta='center'>
                            Request a new password reset
                        </Anchor>
                        <Anchor component={Link} to='/auth/login' ta='center' c='dimmed' size='sm'>
                            Back to login
                        </Anchor>
                    </Stack>
                ) : (
                    <form onSubmit={form.onSubmit(handleResetPassword)}>
                        <Stack gap='md'>
                            <PasswordInput
                                label='New Password'
                                placeholder='Enter your new password'
                                leftSection={<IconLock size='1rem' />}
                                {...form.getInputProps('newPassword')}
                            />

                            <PasswordInput
                                label='Confirm New Password'
                                placeholder='Confirm your new password'
                                leftSection={<IconLock size='1rem' />}
                                {...form.getInputProps('confirmPassword')}
                            />

                            <Button type='submit' fullWidth mt='md' loading={loading} disabled={loading}>
                                Reset Password
                            </Button>

                            <Text ta='center' mt='xs'>
                                <Anchor component={Link} to='/auth/login' c='dimmed' size='sm'>
                                    Back to login
                                </Anchor>
                            </Text>
                        </Stack>
                    </form>
                )}
            </Paper>
        </Container>
    )
}

export default ResetPasswordPage
