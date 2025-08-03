import { useState } from 'react'
import { Paper, TextInput, Button, Title, Text, Anchor, Container, Stack, Alert } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconMail, IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { authService } from '@/services/function/auth'
import { Link } from 'react-router'
import { authNotifications } from '@/utils/notifications'
import { getForgotPasswordErrorMessage } from '@/utils/error'
import { emailValidator, normalizeEmail, suggestEmailCorrection } from '@/utils/validateEmail'

interface ForgotPasswordFormValues {
    email: string
}

const ForgotPasswordPage = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null)

    const form = useForm<ForgotPasswordFormValues>({
        initialValues: {
            email: ''
        },
        validate: {
            email: emailValidator
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

    const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
        setLoading(true)
        setError(null)
        setEmailSuggestion(null)

        try {
            const redirectUrl = `${window.location.origin}/auth`

            const normalizedValues = {
                ...values,
                email: normalizeEmail(values.email)
            }

            const response = await authService.forgotPassword({
                email: normalizedValues.email,
                redirectUrl
            })

            if ('code' in response) {
                setError(getForgotPasswordErrorMessage(response.code as string))
            } else {
                authNotifications.forgotPasswordSuccess()
                setSuccess(true)
            }
        } catch (err) {
            console.error('Error forgot password:', err)
            setError('Đã xảy ra lỗi khi gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <Container size={420} my={40}>
                <Title ta='center' order={1} mb='md'>
                    Kiểm tra email của bạn
                </Title>
                <Text c='dimmed' size='sm' ta='center' mb='xl'>
                    Chúng tôi đã gửi liên kết đặt lại mật khẩu đến {form.values.email}
                </Text>

                <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
                    <Alert icon={<IconCheck size='1rem' />} color='green' mb='md' variant='light'>
                        Đã gửi email đặt lại mật khẩu thành công!
                    </Alert>

                    <Stack gap='md'>
                        <Text size='sm' c='dimmed' ta='center'>
                            Không nhận được email? Kiểm tra thư mục spam hoặc thử lại.
                        </Text>

                        <Button
                            variant='outline'
                            fullWidth
                            onClick={() => {
                                setSuccess(false)
                                form.reset()
                                setError(null)
                                setEmailSuggestion(null)
                            }}
                        >
                            Thử lại
                        </Button>

                        <Text ta='center' mt='xs'>
                            <Anchor component={Link} to='/auth/login' c='dimmed' size='sm'>
                                Quay lại đăng nhập
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
                Quên mật khẩu?
            </Title>
            <Text c='dimmed' size='sm' ta='center' mb='xl'>
                Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu
            </Text>

            <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
                {error && (
                    <Alert icon={<IconAlertCircle size='1rem' />} color='red' mb='md' variant='light'>
                        {error}
                    </Alert>
                )}

                <form onSubmit={form.onSubmit(handleForgotPassword)}>
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
                                    Ý bạn là: {emailSuggestion}?
                                </Text>
                            )}
                        </div>

                        <Button type='submit' fullWidth mt='md' loading={loading} disabled={loading}>
                            Gửi liên kết đặt lại
                        </Button>

                        <Text ta='center' mt='xs'>
                            <Anchor component={Link} to='/auth/login' c='dimmed' size='sm'>
                                Quay lại đăng nhập
                            </Anchor>
                        </Text>
                    </Stack>
                </form>
            </Paper>
        </Container>
    )
}

export default ForgotPasswordPage
