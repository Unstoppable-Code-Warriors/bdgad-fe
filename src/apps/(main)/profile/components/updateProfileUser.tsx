import React, { useEffect, useState } from 'react'
import {
    Paper,
    Title,
    Text,
    Badge,
    Group,
    Button,
    Grid,
    Box,
    TextInput
} from '@mantine/core'
import { IconUser, IconMail, IconPhone, IconMapPin, IconLock, IconShield, IconDeviceFloppy } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/function/auth'
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications'
import { HTTPError } from 'ky'
import { showErrorUpdateProfileNotification } from '@/utils/errorNotification'

interface UpdateProfileUserProps {
    userProfile: any
    onChangePassword: () => void
}

const UpdateProfileUser: React.FC<UpdateProfileUserProps> = ({ userProfile, onChangePassword }) => {
    const queryClient = useQueryClient()
    const [isLoadingUpdateProfile, setIsLoadingUpdateProfile] = useState<boolean>(false)

    // Form for profile updates
    const form = useForm({
        initialValues: {
            name: userProfile?.name || '',
            phone: userProfile?.metadata?.phone || '',
            address: userProfile?.metadata?.address || ''
        },
        validate: {
            name: (value) => {
                if (value.length < 3) {
                    return 'Tên phải có ít nhất 3 ký tự'
                }
                if (value.length > 50) {
                    return 'Tên không được vượt quá 50 ký tự'
                }
                // Check if contains only letters and single spaces between words
                if (!/^[a-zA-ZÀ-ỹ]+(\s[a-zA-ZÀ-ỹ]+)*$/.test(value)) {
                    return 'Tên chỉ được chứa chữ cái và 1 khoảng trắng giữa các từ'
                }
                return null
            },
            phone: (value) => {
                if (!value) return null // Phone is optional
                
                if (!value.startsWith('+')) {
                    return 'Số điện thoại phải bắt đầu bằng dấu + và mã quốc gia'
                }
                if (value.length < 12 || value.length > 13) {
                    return 'Số điện thoại phải có từ 12 đến 13 ký tự'
                }
                // Check if contains only + at start and numbers, no spaces
                if (!/^\+\d{11,12}$/.test(value)) {
                    return 'Số điện thoại chỉ được chứa dấu + và các chữ số, không có khoảng trắng'
                }
                return null
            },
            address: (value) => {
                if (!value) return null // Address is optional
                
                if (value.length > 200) {
                    return 'Địa chỉ không được vượt quá 200 ký tự'
                }
                // Check if contains only allowed characters: letters (including Vietnamese), numbers, spaces, comma, period, slash
                if (!/^[a-zA-ZÀ-ỹ0-9\s,./]*$/.test(value)) {
                    return 'Địa chỉ chỉ được chứa chữ cái, số, khoảng trắng và các ký tự: , . /'
                }
                return null
            }
        }
    })

    // Update form values when user data loads
    useEffect(() => {
        if (userProfile) {
            form.setValues({
                name: userProfile.name || '',
                phone: userProfile.metadata?.phone || '',
                address: userProfile.metadata?.address || ''
            })
        }
    }, [userProfile])

    const handleUpdateProfile = async (values: typeof form.values) => {
        try {
            setIsLoadingUpdateProfile(true)
            await new Promise(resolve => setTimeout(resolve, 1000))
            const response = await authService.updateProfile({
                name: values.name,
                phone: values.phone,
                address: values.address
            })

            if ('code' in response) {
                showErrorUpdateProfileNotification(response.code as string)
            } else {
            showSuccessNotification({
                title: 'Cập nhật thông tin',
                message: 'Cập nhật thông tin thành công'
            })
            }
            // Refresh user data
            queryClient.invalidateQueries({ queryKey: ['user'] })
        } catch (err: unknown) {
            console.error('Error updating profile:', err)
            if (err instanceof HTTPError) {
                const errorData = (err as any).errorData
                if (errorData && typeof errorData === 'object') {
                    showErrorNotification({
                        title: 'Cập nhật thất bại',
                        message: errorData.message || 'Không thể cập nhật thông tin'
                    })
                }
            }
        } finally {
            setIsLoadingUpdateProfile(false)
        }
    }

    return (
        <form onSubmit={form.onSubmit(handleUpdateProfile)}>
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
                            onClick={onChangePassword}
                        >
                            Đổi mật khẩu
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
                                className='cursor-not-allowed'
                            >
                                <Text size='sm' c='dark'>
                                    {userProfile.email}
                                </Text>
                            </Box>
                        </Box>
                    </Grid.Col>

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
                                color={userProfile.status === 'active' ? 'green' : 'red'}
                                variant='light'
                                radius='md'
                                px='md'
                                py='sm'
                                style={{ fontSize: '14px' }}
                            >
                                {userProfile.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                            </Badge>
                        </Box>
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput
                            label={
                                <Group gap='xs'>
                                    <IconUser size={16} color='#228be6' />
                                    <Text size='sm' fw={500} c='dark'>
                                        Họ và tên
                                    </Text>
                                </Group>
                            }
                            disabled={isLoadingUpdateProfile}
                            placeholder='Nhập họ và tên'
                            radius='md'
                            {...form.getInputProps('name')}
                            styles={{
                                input: {
                                    backgroundColor: 'transparent',
                                    border: '1px solid #e9ecef',
                                    '&:focus': {
                                        borderColor: '#228be6',
                                        backgroundColor: 'white'
                                    }
                                }
                            }}
                            className="max-w-[32rem]"
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Box mb='lg'>
                            <Group gap='xs' mb='xs'>
                                <IconUser size={16} color='#228be6' />
                                <Text size='sm' fw={500} c='dark'>
                                    Vai trò
                                </Text>
                            </Group>
                            <Group gap='xs'>
                                {userProfile.roles?.map((role: any) => (
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

                    

                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                            label={
                                <Group gap='xs'>
                                    <IconPhone size={16} color='#228be6' />
                                    <Text size='sm' fw={500} c='dark'>
                                        Số điện thoại
                                    </Text>
                                </Group>
                            }
                            placeholder='Nhập số điện thoại'
                            radius='md'
                            {...form.getInputProps('phone')}
                            disabled={isLoadingUpdateProfile}
                            styles={{
                                input: {
                                    backgroundColor: 'transparent',
                                    border: '1px solid #e9ecef',
                                    '&:focus': {
                                        borderColor: '#228be6',
                                        backgroundColor: 'white'
                                    }
                                }
                            }}
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                            label={
                                <Group gap='xs'>
                                    <IconMapPin size={16} color='#228be6' />
                                    <Text size='sm' fw={500} c='dark'>
                                        Địa chỉ
                                    </Text>
                                </Group>
                            }
                            disabled={isLoadingUpdateProfile}
                            placeholder='Nhập địa chỉ'
                            radius='md'
                            {...form.getInputProps('address')}
                            styles={{
                                input: {
                                    backgroundColor: 'transparent',
                                    border: '1px solid #e9ecef',
                                    '&:focus': {
                                        borderColor: '#228be6',
                                        backgroundColor: 'white'
                                    }
                                }
                            }}
                        />
                    </Grid.Col>
                </Grid>

                {/* Save Button */}
                <Group justify='flex-end' mt='xl'>
                    <Button
                        type='submit'
                        leftSection={<IconDeviceFloppy size={16} />}
                        loading={isLoadingUpdateProfile}
                        radius='md'
                        size='md'
                    >
                        Lưu thay đổi
                    </Button>
                </Group>
            </Paper>
        </form>
    )
}

export default UpdateProfileUser 