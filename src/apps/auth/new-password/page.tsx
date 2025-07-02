import { useState, useEffect } from 'react'
import { Paper, PasswordInput, Button, Title, Text, Anchor, Container, Stack, Alert, List } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconLock, IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react'
import { authService } from '@/services/function/auth'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { passwordValidator, validatePassword, getPasswordRequirementsText } from '@/utils/validatePassword'
import { showSuccessNotification } from '@/utils/notifications'
import { HTTPError } from 'ky'

interface NewPasswordFormValues {
    newPassword: string
    confirmPassword: string
}

const NewPasswordPage = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')

    const form = useForm<NewPasswordFormValues>({
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
            setError('Link tạo mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng liên hệ quản trị viên.')
        }
    }, [token])

    const handleCreatePassword = async (values: NewPasswordFormValues) => {
        if (!token) {
            setError('Link tạo mất khẩu không hợp lệ.')
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

            showSuccessNotification({
                title: 'Tạo mật khẩu thành công',
                message: response.message || 'Mật khẩu của bạn đã được tạo thành công'
            })

            setSuccess(true)
        } catch (err) {
            console.error("Lỗi tạo lại mật khẩu :",err)
            if (err instanceof HTTPError) {
                const errorData = (err as any).errorData
                if (errorData && typeof errorData === 'object') {
                    setError(errorData.message || 'Mật khẩu của bạn đã được tạo thành công')
                }
            }
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
                    Tạo mật khẩu thành công
                </Title>
                <Text c='dimmed' size='sm' ta='center' mb='xl'>
                    Mật khẩu của bạn đã được tạo thành công
                </Text>

                <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
                    <Alert icon={<IconCheck size='1rem' />} color='green' mb='md' variant='light'>
                        Mật khẩu đã được tạo thành công!
                    </Alert>

                    <Stack gap='md'>
                        <Text size='sm' c='dimmed' ta='center'>
                            Bây giờ bạn có thể đăng nhập vào hệ thống với mật khẩu vừa tạo.
                        </Text>

                        <Button fullWidth onClick={handleGoToLogin}>
                            Đăng nhập ngay
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        )
    }

    return (
        <Container size={420} my={40}>
            <Title ta='center' order={1} mb='md'>
                Tạo mật khẩu mới
            </Title>
            <Text c='dimmed' size='sm' ta='center' mb='xl'>
                Vui lòng tạo mật khẩu cho tài khoản của bạn
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
                            Link tạo mật khẩu này không hợp lệ hoặc đã hết hạn.
                        </Text>
                        <Text ta='center' size='sm' c='dimmed'>
                            Vui lòng liên hệ quản trị viên để được hỗ trợ.
                        </Text>
                        <Anchor component={Link} to='/auth/login' ta='center' c='dimmed' size='sm'>
                            Quay lại đăng nhập
                        </Anchor>
                    </Stack>
                ) : (
                    <form onSubmit={form.onSubmit(handleCreatePassword)}>
                        <Stack gap='md'>
                            <div>
                                <PasswordInput
                                    label='Mật khẩu mới'
                                    placeholder='Nhập mật khẩu mới'
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
                                label='Xác nhận mật khẩu'
                                placeholder='Nhập lại mật khẩu mới'
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
                                Tạo mật khẩu
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

export default NewPasswordPage