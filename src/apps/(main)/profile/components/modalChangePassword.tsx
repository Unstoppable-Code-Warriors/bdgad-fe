import { useState } from 'react'
import {
    Modal,
    PasswordInput,
    Button,
    Group,
    Stack,
    Text,
    List,
    ThemeIcon,
    Box
} from '@mantine/core'
import { IconLock, IconCheck, IconX } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { authService } from '@/services/function/auth'
import { showSuccessNotification } from '@/utils/notifications'
import { showErrorChangePasswordNotification } from '@/utils/errorNotification'
import { validatePassword } from '@/utils/validatePassword'
import { HTTPError } from 'ky'

interface ModalChangePasswordProps {
    opened: boolean
    onClose: () => void
}

const ModalChangePassword = ({ opened, onClose }: ModalChangePasswordProps) => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const form = useForm({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        },
        validate: {
            currentPassword: (value) => (value.length === 0 ? 'Mật khẩu hiện tại không được để trống' : null),
            newPassword: (value) => {
                const validation = validatePassword(value)
                if (!validation.isValid) {
                    return validation.errors[0]
                }
                return null
            },
            confirmPassword: (value, values) => {
                if (value.length === 0) {
                    return 'Xác nhận mật khẩu không được để trống'
                }
                if (value !== values.newPassword) {
                    return 'Mật khẩu mới và xác nhận mật khẩu không khớp'
                }
                return null
            }
        }
    })


    const handleChangePassword = async (values: typeof form.values) => {
        try {
            setIsLoading(true)
            const response = await authService.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword
            })
            
            if (response.code) {
              switch (response.code) {
                case 'USER_NOT_AUTHENTICATED':
                    setError('Bạn chưa đăng nhập tài khoản')
                  break
                case 'USER_NOT_FOUND':
                  setError('Không tìm thấy thông tin tài khoản')
                  break
                case 'ACCOUNT_INACTIVE':
                  setError('Tài khoản đã bị vô hiệu hóa')
                  break
                case 'PASSWORD_MISMATCH':
                  setError('Mật khẩu hiện tại không chính xác')
                  break
                case 'SAME_PASSWORD':
                  setError('Mật khẩu mới không được trùng với mật khẩu hiện tại')
                  break
                default:
                  setError('Lỗi đổi mật khẩu không xác định')
              }
            } else {
                showSuccessNotification({
                    title: 'Đổi mật khẩu',
                    message: 'Đổi mật khẩu thành công'
                })
                handleClose()
            }
            
        } catch (err: unknown) {
            console.error('Error changing password:', err)
            if (err instanceof HTTPError) {
                const errorData = (err as any).errorData
                if (errorData && typeof errorData === 'object' && errorData.code) {
                    showErrorChangePasswordNotification(errorData.code)
                } else {
                    showErrorChangePasswordNotification('UNKNOWN_ERROR')
                }
            } else {
                showErrorChangePasswordNotification('UNKNOWN_ERROR')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        form.reset()
        onClose()
    }

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={
                <Group gap='sm'>
                    <IconLock size={20} color='#228be6' />
                    <Text fw={600}>Đổi mật khẩu</Text>
                </Group>
            }
            size='md'
            centered
            radius='lg'
        >
            <form onSubmit={form.onSubmit(handleChangePassword)}>
                <Stack gap='lg'>
                    <Text size='sm' c='dimmed'>
                        Cập nhật mật khẩu của bạn để bảo vệ tài khoản
                    </Text>
                    {error && <Text size='sm' c='red'>{error}</Text>}

                    <PasswordInput
                        label='Mật khẩu hiện tại'
                        placeholder='Nhập mật khẩu hiện tại'
                        required
                        radius='md'
                        {...form.getInputProps('currentPassword')}
                        styles={{
                            input: {
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #e9ecef',
                                '&:focus': {
                                    borderColor: '#228be6',
                                    backgroundColor: 'white'
                                }
                            }
                        }}
                    />

                    <PasswordInput
                        label='Mật khẩu mới'
                        placeholder='Nhập mật khẩu mới'
                        required
                        radius='md'
                        {...form.getInputProps('newPassword')}
                        styles={{
                            input: {
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #e9ecef',
                                '&:focus': {
                                    borderColor: '#228be6',
                                    backgroundColor: 'white'
                                }
                            }
                        }}
                    />

                    {form.values.newPassword && (
                        <Box>
                            <Text size='sm' fw={500} mb={5}>
                                Yêu cầu mật khẩu:
                            </Text>
                            <List spacing='xs' size='sm'>
                                {[
                                    { text: 'Ít nhất 8 ký tự', test: (pwd: string) => pwd.length >= 8 },
                                    { text: 'Một chữ cái thường (a-z)', test: (pwd: string) => /[a-z]/.test(pwd) },
                                    { text: 'Một chữ cái hoa (A-Z)', test: (pwd: string) => /[A-Z]/.test(pwd) },
                                    { text: 'Một chữ số (0-9)', test: (pwd: string) => /\d/.test(pwd) },
                                    { text: 'Một ký tự đặc biệt (!@#$%^&*)', test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd) }
                                ].map((req, index) => {
                                    const isMet = req.test(form.values.newPassword)
                                    
                                    return (
                                        <List.Item
                                            key={index}
                                            icon={
                                                <ThemeIcon
                                                    color={isMet ? 'green' : 'red'}
                                                    size={16}
                                                    radius='xl'
                                                    variant='light'
                                                >
                                                    {isMet ? <IconCheck size={10} /> : <IconX size={10} />}
                                                </ThemeIcon>
                                            }
                                        >
                                            <Text size='sm' c={isMet ? 'green' : 'red'}>
                                                {req.text}
                                            </Text>
                                        </List.Item>
                                    )
                                })}
                            </List>
                        </Box>
                    )}
                    

                    <PasswordInput
                        label='Xác nhận mật khẩu mới'
                        placeholder='Nhập lại mật khẩu mới'
                        required
                        radius='md'
                        {...form.getInputProps('confirmPassword')}
                        styles={{
                            input: {
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #e9ecef',
                                '&:focus': {
                                    borderColor: '#228be6',
                                    backgroundColor: 'white'
                                }
                            }
                        }}
                    />

                    <Group justify='flex-end' gap='md' mt='lg'>
                        <Button
                            variant='outline'
                            onClick={handleClose}
                            radius='md'
                            color='red'
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type='submit'
                            loading={isLoading}
                            radius='md'
                            color='blue'
                        >
                            Đổi mật khẩu
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    )
}

export default ModalChangePassword 