import { useState, useEffect } from 'react'
import { Paper, PasswordInput, Button, Title, Text, Anchor, Container, Stack, Alert, List } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconLock, IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react'
import { authService } from '@/services/function/auth'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { passwordValidator, validatePassword, getPasswordRequirementsText } from '@/utils/validatePassword'
import { authNotifications, showSuccessNotification } from '@/utils/notifications'
import { showErrorResetPasswordNotification } from '@/utils/errorNotification'

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
            newPassword: (value) => passwordValidator(value),
            confirmPassword: (value, values) => {
                if (!value) return 'Please confirm your password'
                if (value !== values.newPassword) return 'Passwords do not match'
                return null
            }
        }
    })

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
            await new Promise(resolve => setTimeout(resolve, 1000))
            const response = await authService.resetPassword({
                token,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword
            })

            if ('code' in response) {
                showErrorResetPasswordNotification(response.code as string)
            } else {
                showSuccessNotification({
                    title: 'Đặt lại mật khẩu',
                    message: 'Đặt lại mật khẩu thành công'
                })
            }

            setSuccess(true)
            authNotifications.passwordResetSuccess()
        } catch (err) {
            console.error(err)
            const errorMessage = 'Failed to reset password. The token may be expired or invalid.'
            setError(errorMessage)
            authNotifications.passwordResetError()
        } finally {
            setLoading(false)
        }
    }

    const handleGoToLogin = () => {
        navigate('/auth/login')
    }

    // Get password validation result for display
    const passwordValidation = form.values.newPassword 
        ? validatePassword(form.values.newPassword) 
        : null

    const passwordRequirements = getPasswordRequirementsText()

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
                            <div>
                                <PasswordInput
                                    label='New Password'
                                    placeholder='Enter your new password'
                                    leftSection={<IconLock size='1rem' />}
                                    {...form.getInputProps('newPassword')}
                                />
                                
                                {/* Password Requirements */}
                                <Paper p='sm' mt='xs' bg='gray.0' radius='sm'>
                                    <Text size='xs' fw={500} mb='xs' c='dimmed'>
                                        Password must contain:
                                    </Text>
                                    <List size='xs' spacing='2px'>
                                        {passwordRequirements.map((req, index) => {
                                            let isValid = false
                                            if (form.values.newPassword && passwordValidation) {
                                                switch (index) {
                                                    case 0: // Length
                                                        isValid = form.values.newPassword.length >= 8
                                                        break
                                                    case 1: // Lowercase
                                                        isValid = /[a-z]/.test(form.values.newPassword)
                                                        break
                                                    case 2: // Uppercase
                                                        isValid = /[A-Z]/.test(form.values.newPassword)
                                                        break
                                                    case 3: // Number
                                                        isValid = /\d/.test(form.values.newPassword)
                                                        break
                                                    case 4: // Special char
                                                        isValid = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(form.values.newPassword)
                                                        break
                                                }
                                            }
                                            
                                            return (
                                                <List.Item 
                                                    key={index}
                                                    icon={
                                                        isValid ? (
                                                            <IconCheck size='0.8rem' color='green' />
                                                        ) : (
                                                            <IconX size='0.8rem' color='red' />
                                                        )
                                                    }
                                                >
                                                    <Text size='xs' c={isValid ? 'green' : 'red'}>
                                                        {req}
                                                    </Text>
                                                </List.Item>
                                            )
                                        })}
                                    </List>
                                </Paper>
                            </div>

                            <PasswordInput
                                label='Confirm New Password'
                                placeholder='Confirm your new password'
                                leftSection={<IconLock size='1rem' />}
                                {...form.getInputProps('confirmPassword')}
                            />

                            <Button 
                                type='submit' 
                                fullWidth 
                                mt='md' 
                                loading={loading} 
                                disabled={loading || (!!passwordValidation && !passwordValidation.isValid)}
                            >
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
