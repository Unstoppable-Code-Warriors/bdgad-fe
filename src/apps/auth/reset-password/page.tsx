import { useState, useEffect } from 'react'
import { Paper, PasswordInput, Button, Title, Text, Anchor, Container, Stack, Alert, List } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconLock, IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react'
import { authService } from '@/services/function/auth'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { passwordValidator, validatePassword, getPasswordRequirementsText } from '@/utils/validatePassword'
import { authNotifications } from '@/utils/notifications'
import { getResetPasswordErrorMessage } from '@/utils/error'

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
                if (!value) return 'Vui lòng xác nhận mật khẩu'
                if (value !== values.newPassword) return 'Mật khẩu xác nhận không khớp'
                return null
            }
        }
    })

    useEffect(() => {
        if (!token) {
            setError('Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.')
        }
    }, [token])

    const handleResetPassword = async (values: ResetPasswordFormValues) => {
        if (!token) {
            setError('Mã xác thực không hợp lệ hoặc đã hết hạn.')
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
                setError(getResetPasswordErrorMessage(response.code as string))
            } else {
                authNotifications.passwordResetSuccess()
                setSuccess(true)
            }
        } catch (err) {
            console.error(err)
            setError('Đã xảy ra lỗi khi đặt lại mật khẩu. Mã xác thực có thể đã hết hạn hoặc không hợp lệ.')
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
                    Đặt lại mật khẩu thành công
                </Title>
                <Text c='dimmed' size='sm' ta='center' mb='xl'>
                    Mật khẩu của bạn đã được cập nhật thành công
                </Text>

                <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
                    <Alert icon={<IconCheck size='1rem' />} color='green' mb='md' variant='light'>
                        Mật khẩu của bạn đã được đặt lại thành công!
                    </Alert>

                    <Stack gap='md'>
                        <Text size='sm' c='dimmed' ta='center'>
                            Bạn có thể đăng nhập với mật khẩu mới của mình.
                        </Text>

                        <Button fullWidth onClick={handleGoToLogin}>
                            Đi đến trang đăng nhập
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        )
    }

    return (
        <Container size={420} my={40}>
            <Title ta='center' order={1} mb='md'>
                Đặt lại mật khẩu
            </Title>
            <Text c='dimmed' size='sm' ta='center' mb='xl'>
                Nhập mật khẩu mới của bạn bên dưới
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
                            Liên kết đặt lại này không hợp lệ hoặc đã hết hạn.
                        </Text>
                        <Anchor component={Link} to='/auth/forgot-password' ta='center'>
                            Yêu cầu đặt lại mật khẩu mới
                        </Anchor>
                        <Anchor component={Link} to='/auth/login' ta='center' c='dimmed' size='sm'>
                            Quay lại đăng nhập
                        </Anchor>
                    </Stack>
                ) : (
                    <form onSubmit={form.onSubmit(handleResetPassword)}>
                        <Stack gap='md'>
                            <div>
                                <PasswordInput
                                    label='Mật khẩu mới'
                                    placeholder='Nhập mật khẩu mới của bạn'
                                    leftSection={<IconLock size='1rem' />}
                                    {...form.getInputProps('newPassword')}
                                />
                                
                                {/* Password Requirements */}
                                <Paper p='sm' mt='xs' bg='gray.0' radius='sm'>
                                    <Text size='xs' fw={500} mb='xs' c='dimmed'>
                                        Mật khẩu phải chứa:
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
                                label='Xác nhận mật khẩu mới'
                                placeholder='Xác nhận mật khẩu mới của bạn'
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
                                Đặt lại mật khẩu
                            </Button>

                            <Text ta='center' mt='xs'>
                                <Anchor component={Link} to='/auth/login' c='dimmed' size='sm'>
                                    Quay lại đăng nhập
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
