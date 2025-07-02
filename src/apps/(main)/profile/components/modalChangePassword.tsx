import { useState } from 'react'
import {
    Modal,
    PasswordInput,
    Button,
    Group,
    Stack,
    Text
} from '@mantine/core'
import { IconLock } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { authService } from '@/services/function/auth'
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications'
import { HTTPError } from 'ky'

interface ModalChangePasswordProps {
    opened: boolean
    onClose: () => void
}

const ModalChangePassword = ({ opened, onClose }: ModalChangePasswordProps) => {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        },
        validate: {
            currentPassword: (value) => (value.length === 0 ? 'Mật khẩu hiện tại không được để trống' : null),
            newPassword: (value) => {
                if (value.length < 8) {
                    return 'Mật khẩu phải có ít nhất 8 ký tự'
                }
                if (!/(?=.*[a-z])/.test(value)) {
                    return 'Mật khẩu phải chứa ít nhất một chữ cái thường'
                }
                if (!/(?=.*[A-Z])/.test(value)) {
                    return 'Mật khẩu phải chứa ít nhất một chữ cái hoa'
                }
                if (!/(?=.*\d)/.test(value)) {
                    return 'Mật khẩu phải chứa ít nhất một số'
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
            await new Promise(resolve => setTimeout(resolve, 1000))
            const response = await authService.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword
            })
            
            showSuccessNotification({
                title: 'Đổi mật khẩu',
                message: response.message || 'Đổi mật khẩu thành công'
            })
            
            handleClose()
        } catch (err: unknown) {
            console.error('Error changing password:', err)
            if (err instanceof HTTPError) {
                const errorData = (err as any).errorData
                if (errorData && typeof errorData === 'object') {
                    showErrorNotification({
                        title: 'Đổi mật khẩu thất bại',
                        message: errorData.message || 'Đổi mật khẩu thất bại'
                    })
                }
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