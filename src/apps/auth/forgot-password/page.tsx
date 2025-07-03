import { useState } from 'react'
import { Paper, TextInput, Button, Title, Text, Anchor, Container, Stack, Alert } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconMail, IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { authService } from '@/services/function/auth'
import { Link } from 'react-router'
import { showSuccessNotification } from '@/utils/notifications'
import { HTTPError } from 'ky';
import { showErrorForgotPasswordNotification } from '@/utils/errorNotification'

interface ForgotPasswordFormValues {
    email: string
}

const ForgotPasswordPage = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const form = useForm<ForgotPasswordFormValues>({
        initialValues: {
            email: ''
        },
        validate: {
            email: (value) => {
                if (!value) return 'Email is required'
                if (!/^\S+@\S+$/.test(value)) return 'Invalid email format'
                return null
            }
        }
    })

    const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
        setLoading(true)
        setError(null)

        try {
            const redirectUrl = `${window.location.origin}/auth`

            const response = await authService.forgotPassword({
                email: values.email,
                redirectUrl
            })
            if ('code' in response) {
                showErrorForgotPasswordNotification(response.code as string)
            } else {
            showSuccessNotification({
                title: 'Đặt lại mật khẩu',
                message: 'Đặt lại mật khẩu thành công'
            })}
            setSuccess(true)
            

        } catch (err) {
            console.error('Error forgot password:', err)
            if (err instanceof HTTPError) {
                const errorData = (err as any).errorData
                if (errorData && typeof errorData === 'object') {
                    setError(errorData.message || 'Đặt lại mật khẩu thất bại')
                }
            }

        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <Container size={420} my={40}>
                <Title ta='center' order={1} mb='md'>
                    Check your email
                </Title>
                <Text c='dimmed' size='sm' ta='center' mb='xl'>
                    We've sent a password reset link to {form.values.email}
                </Text>

                <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
                    <Alert icon={<IconCheck size='1rem' />} color='green' mb='md' variant='light'>
                        Password reset email sent successfully!
                    </Alert>

                    <Stack gap='md'>
                        <Text size='sm' c='dimmed' ta='center'>
                            Didn't receive the email? Check your spam folder or try again.
                        </Text>

                        <Button
                            variant='outline'
                            fullWidth
                            onClick={() => {
                                setSuccess(false)
                                form.reset()
                                setError(null)
                            }}
                        >
                            Try again
                        </Button>

                        <Text ta='center' mt='xs'>
                            <Anchor component={Link} to='/auth/login' c='dimmed' size='sm'>
                                Back to login
                            </Anchor>
                        </Text>
                    </Stack>
                </Paper>
            </Container>
        )
    }

    return (
        <Container size={420} my={40}>
            <Title ta='center' order={1} mb='md'>
                Forgot your password?
            </Title>
            <Text c='dimmed' size='sm' ta='center' mb='xl'>
                Enter your email address and we'll send you a link to reset your password
            </Text>

            <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
                {error && (
                    <Alert icon={<IconAlertCircle size='1rem' />} color='red' mb='md' variant='light'>
                        {error}
                    </Alert>
                )}

                <form onSubmit={form.onSubmit(handleForgotPassword)}>
                    <Stack gap='md'>
                        <TextInput
                            label='Email'
                            placeholder='your@email.com'
                            leftSection={<IconMail size='1rem' />}
                            {...form.getInputProps('email')}
                        />

                        <Button type='submit' fullWidth mt='md' loading={loading} disabled={loading}>
                            Send reset link
                        </Button>

                        <Text ta='center' mt='xs'>
                            <Anchor component={Link} to='/auth/login' c='dimmed' size='sm'>
                                Back to login
                            </Anchor>
                        </Text>
                    </Stack>
                </form>
            </Paper>
        </Container>
    )
}

export default ForgotPasswordPage
