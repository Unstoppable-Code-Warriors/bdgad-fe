import { useUser } from '@/services/hook/auth.hook'
import {
    Container,
    Paper,
    Title,
    Text,
    Badge,
    Loader,
    Group,
    Stack,
    Button,
    Grid,
    Box,
    Flex,
    Modal,
    PasswordInput
} from '@mantine/core'
import { IconUser, IconMail, IconPhone, IconMapPin, IconLock, IconEdit, IconShield } from '@tabler/icons-react'
//import { useNavigate } from 'react-router'
import { useState } from 'react'
import { authService } from '@/services/function/auth'
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications'
import { HTTPError } from 'ky';

const ProfilePage = () => {
    const { data, isLoading } = useUser()
    const userProfile = data?.data?.user
    //const navigate = useNavigate()
    const [changePasswordOpened, setChangePasswordOpened] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const handleChangePassword = async () => {
        try {
            const response = await authService.changePassword({
                currentPassword,
                newPassword,
                confirmPassword
            })
            // Show success notification
            showSuccessNotification({
                title: 'Đổi mật khẩu',
                message: response.message || 'Đổi mật khẩu thành công'
            })

            setChangePasswordOpened(false)
            // Reset form
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err: unknown) {
            console.error('Error changing password:', err)

            // Handle ky HTTPError to get response body
            if (err instanceof HTTPError) {
                // Check if the beforeError hook attached error data
                const errorData = (err as any).errorData
                if (errorData && typeof errorData === 'object') {
                    showErrorNotification({
                        title: 'Đổi mật khẩu thất bại',
                        message: errorData.message || 'Đổi mật khẩu thất bại'
                    })
                }
            }
        }
    }

    if (isLoading) {
        return (
            <Container size='lg' py='xl'>
                <Flex justify='center' align='center' style={{ minHeight: '400px' }}>
                    <Loader size='xl' />
                </Flex>
            </Container>
        )
    }

    if (!data) {
        return (
            <Container size='lg' py='xl'>
                <Flex justify='center' align='center' style={{ minHeight: '400px' }}>
                    <Text ta='center' c='dimmed' size='lg'>
                        Không thể tải thông tin người dùng
                    </Text>
                </Flex>
            </Container>
        )
    }

    const user = userProfile

    return (
        <Container size='lg' py='xl'>
            {/* Profile Information Section */}
            <Paper shadow='sm' p='xl' radius='lg'>
                <Group justify='space-between' mb='lg'>
                    <Box>
                        <Group gap='sm' mb='xs'>
                            <IconUser size={24} color='#2b2b2b' />
                            <Title order={2} c='dark'>
                                Thông tin hồ sơ
                            </Title>
                        </Group>
                        <Text size='sm' c='dimmed'>
                            Xem và cập nhật thông tin cá nhân của bạn
                        </Text>
                    </Box>
                    <Group gap='md'>
                        <Button
                            variant='outline'
                            color='dark'
                            radius='md'
                            leftSection={<IconLock size={16} />}
                            onClick={() => setChangePasswordOpened(true)}
                        >
                            Đổi mật khẩu
                        </Button>
                        <Button variant='filled' color='dark' radius='md' leftSection={<IconEdit size={16} />}>
                            Chỉnh sửa hồ sơ
                        </Button>
                    </Group>
                </Group>

                <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Box mb='lg'>
                            <Group gap='xs' mb='xs'>
                                <IconMail size={16} color='#228be6' />
                                <Text size='sm' fw={500} c='dark'>
                                    Email
                                </Text>
                            </Group>
                            <Box
                                p='md'
                                style={{
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef',
                                    borderRadius: '8px'
                                }}
                            >
                                <Text size='sm' c='dark'>
                                    {user?.email}
                                </Text>
                            </Box>
                        </Box>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6 }}></Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Box mb='lg'>
                            <Group gap='xs' mb='xs'>
                                <IconShield size={16} color='#228be6' />
                                <Text size='sm' fw={500} c='dark'>
                                    Trạng thái
                                </Text>
                            </Group>
                            <Badge
                                size='lg'
                                color={user?.status === 'active' ? 'green' : 'red'}
                                variant='light'
                                radius='md'
                                px='md'
                                py='sm'
                                style={{ fontSize: '14px' }}
                            >
                                {user?.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                            </Badge>
                        </Box>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Box mb='lg'>
                            <Group gap='xs' mb='xs'>
                                <IconUser size={16} color='#228be6' />
                                <Text size='sm' fw={500} c='dark'>
                                    Vai trò
                                </Text>
                            </Group>
                            <Group gap='xs'>
                                {user?.roles.map((role) => (
                                    <Badge
                                        key={role.id}
                                        size='lg'
                                        color='blue'
                                        variant='light'
                                        radius='md'
                                        px='md'
                                        py='sm'
                                        style={{ fontSize: '14px' }}
                                    >
                                        {role.name}
                                    </Badge>
                                ))}
                            </Group>
                        </Box>
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <Box mb='lg'>
                            <Group gap='xs' mb='xs'>
                                <IconUser size={16} color='#228be6' />
                                <Text size='sm' fw={500} c='dark'>
                                    Họ và tên
                                </Text>
                            </Group>
                            <Box
                                p='md'
                                style={{
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef',
                                    borderRadius: '8px'
                                }}
                            >
                                <Text size='sm' c='dark'>
                                    {user?.name}
                                </Text>
                            </Box>
                        </Box>
                    </Grid.Col>

                    {user?.metadata?.phone && (
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Box mb='lg'>
                                <Group gap='xs' mb='xs'>
                                    <IconPhone size={16} color='#228be6' />
                                    <Text size='sm' fw={500} c='dark'>
                                        Số điện thoại
                                    </Text>
                                </Group>
                                <Box
                                    p='md'
                                    style={{
                                        backgroundColor: '#f8f9fa',
                                        border: '1px solid #e9ecef',
                                        borderRadius: '8px'
                                    }}
                                >
                                    <Text size='sm' c='dark'>
                                        {user.metadata.phone}
                                    </Text>
                                </Box>
                            </Box>
                        </Grid.Col>
                    )}

                    {user?.metadata?.address && (
                        <Grid.Col span={{ base: 12, md: user?.metadata?.phone ? 6 : 12 }}>
                            <Box mb='lg'>
                                <Group gap='xs' mb='xs'>
                                    <IconMapPin size={16} color='#228be6' />
                                    <Text size='sm' fw={500} c='dark'>
                                        Địa chỉ
                                    </Text>
                                </Group>
                                <Box
                                    p='md'
                                    style={{
                                        backgroundColor: '#f8f9fa',
                                        border: '1px solid #e9ecef',
                                        borderRadius: '8px'
                                    }}
                                >
                                    <Text size='sm' c='dark'>
                                        {user.metadata.address}
                                    </Text>
                                </Box>
                            </Box>
                        </Grid.Col>
                    )}
                </Grid>
            </Paper>

            {/* Change Password Modal */}
            <Modal
                opened={changePasswordOpened}
                onClose={() => setChangePasswordOpened(false)}
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
                <Stack gap='lg'>
                    <Text size='sm' c='dimmed'>
                        Cập nhật mật khẩu của bạn để bảo vệ tài khoản
                    </Text>

                    <PasswordInput
                        label='Mật khẩu hiện tại'
                        placeholder='Nhập mật khẩu hiện tại'
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.currentTarget.value)}
                        required
                        radius='md'
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
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.currentTarget.value)}
                        required
                        radius='md'
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
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.currentTarget.value)}
                        required
                        radius='md'
                        error={confirmPassword !== '' && newPassword !== confirmPassword ? 'Mật khẩu không khớp' : null}
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
                            onClick={() => setChangePasswordOpened(false)}
                            radius='md'
                            color='red'
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleChangePassword}
                            disabled={
                                !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword
                            }
                            radius='md'
                            color='blue'
                        >
                            Đổi mật khẩu
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    )
}

export default ProfilePage
