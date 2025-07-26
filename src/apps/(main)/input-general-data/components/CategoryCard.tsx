import { useState } from 'react'
import {
    Card,
    Text,
    Group,
    ActionIcon,
    Menu,
    rem,
    Badge,
    Stack,
    Button,
    Modal,
    TextInput,
    Textarea,
    Alert,
    Tooltip
} from '@mantine/core'
import { IconDots, IconEdit, IconTrash, IconFolder, IconAlertCircle } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useForm } from '@mantine/form'
import type { CategoryGeneralFile, UpdateCategoryRequest } from '@/types/general-file'
import {
    useUpdateCategoryGeneralFile,
    useDeleteCategoryGeneralFile
} from '@/services/hook/staff-category-general-files.hook'

interface CategoryCardProps {
    category: CategoryGeneralFile
    onOpenCategory: (category: CategoryGeneralFile) => void
}

// Validation function for name and description (same as CreateCategoryModal)
const validateText = (value: string, minLength: number, maxLength: number, fieldName: string) => {
    if (!value || value.trim().length === 0) {
        return `${fieldName} là bắt buộc`
    }

    if (value.length < minLength || value.length > maxLength) {
        return `${fieldName} phải có độ dài từ ${minLength} đến ${maxLength} ký tự`
    }

    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(value)) {
        return `${fieldName} chỉ được chứa một khoảng trắng giữa các từ`
    }

    // Check for leading or trailing spaces
    if (value !== value.trim()) {
        return `${fieldName} không được bắt đầu hoặc kết thúc bằng khoảng trắng`
    }

    return null
}

const CategoryCard = ({ category, onOpenCategory }: CategoryCardProps) => {
    const [editModalOpened, setEditModalOpened] = useState(false)
    const [deleteModalOpened, setDeleteModalOpened] = useState(false)
    const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null)
    const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null)

    const updateMutation = useUpdateCategoryGeneralFile()
    const deleteMutation = useDeleteCategoryGeneralFile()

    const form = useForm<UpdateCategoryRequest>({
        initialValues: {
            name: category.name,
            description: category.description
        },
        validate: {
            name: (value) => validateText(value, 1, 100, 'Tên danh mục'),
            description: (value) => validateText(value, 1, 500, 'Mô tả')
        }
    })

    const handleEdit = () => {
        form.setValues({
            name: category.name,
            description: category.description
        })
        setEditErrorMessage(null)
        setEditModalOpened(true)
    }

    const handleUpdate = async (values: UpdateCategoryRequest) => {
        try {
            setEditErrorMessage(null)
            const res = await updateMutation.mutateAsync({ id: category.id.toString(), data: values })

            // Check response code for specific error cases
            if (res?.code === 'CATEGORY_ALREADY_EXISTS') {
                setEditErrorMessage('Tên danh mục đã tồn tại. Vui lòng chọn tên khác.')
                return
            }

            notifications.show({
                title: 'Thành công',
                message: 'Danh mục đã được cập nhật thành công',
                color: 'green'
            })
            setEditModalOpened(false)
        } catch (error: any) {
            console.error('Update category error:', error)
            setEditErrorMessage('Không thể cập nhật danh mục. Vui lòng thử lại.')
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể cập nhật danh mục',
                color: 'red'
            })
        }
    }

    const handleDelete = async () => {
        try {
            setDeleteErrorMessage(null)
            const res = await deleteMutation.mutateAsync(category.id.toString())

            // Check response code for specific error cases
            if (res?.code === 'CATEGORY_HAS_FILES') {
                setDeleteErrorMessage('Không thể xóa danh mục vì vẫn còn tệp tin trong danh mục này.')
                return
            }

            notifications.show({
                title: 'Thành công',
                message: 'Danh mục đã được xóa thành công',
                color: 'green'
            })
            setDeleteModalOpened(false)
        } catch (error: any) {
            console.error('Delete category error:', error)
            setDeleteErrorMessage('Không thể xóa danh mục. Vui lòng thử lại.')
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể xóa danh mục',
                color: 'red'
            })
        }
    }

    return (
        <>
            <Card
                shadow='sm'
                padding='lg'
                radius='md'
                withBorder
                style={{ cursor: 'pointer', height: '100%' }}
                onClick={() => onOpenCategory(category)}
            >
                <Group justify='space-between' mb='xs'>
                    <Group>
                        <IconFolder size={24} color='var(--mantine-color-blue-6)' />
                        <Tooltip label={category.name} position='top' disabled={category.name.length <= 30}>
                            <Text fw={500} size='lg' lineClamp={1} style={{ maxWidth: '200px' }}>
                                {category.name}
                            </Text>
                        </Tooltip>
                    </Group>
                    <Menu shadow='md' width={200}>
                        <Menu.Target>
                            <ActionIcon variant='subtle' color='gray' onClick={(e) => e.stopPropagation()}>
                                <IconDots style={{ width: rem(16), height: rem(16) }} />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleEdit()
                                }}
                            >
                                Chỉnh sửa
                            </Menu.Item>
                            <Menu.Item
                                color='red'
                                leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setDeleteModalOpened(true)
                                }}
                            >
                                Xóa
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>

                <Text size='sm' c='dimmed' mb='md'>
                    {category.description}
                </Text>

                <Group justify='space-between'>
                    <Badge color='blue' variant='light'>
                        {category.generalFiles?.length} tệp tin
                    </Badge>
                </Group>
            </Card>

            {/* Edit Modal */}
            <Modal
                opened={editModalOpened}
                onClose={() => {
                    setEditModalOpened(false)
                    setEditErrorMessage(null)
                }}
                title='Chỉnh sửa danh mục'
                size='md'
            >
                <form onSubmit={form.onSubmit(handleUpdate)}>
                    <Stack gap='md'>
                        {editErrorMessage && (
                            <Alert
                                icon={<IconAlertCircle size='1rem' />}
                                color='red'
                                variant='light'
                                withCloseButton
                                onClose={() => setEditErrorMessage(null)}
                            >
                                {editErrorMessage}
                            </Alert>
                        )}

                        <TextInput
                            label='Tên danh mục'
                            placeholder='Nhập tên danh mục (1-100 ký tự)'
                            required
                            {...form.getInputProps('name')}
                        />
                        <Textarea
                            label='Mô tả'
                            placeholder='Nhập mô tả danh mục (1-500 ký tự)'
                            rows={3}
                            required
                            {...form.getInputProps('description')}
                        />
                        <Group justify='flex-end' mt='md'>
                            <Button
                                variant='outline'
                                onClick={() => {
                                    setEditModalOpened(false)
                                    setEditErrorMessage(null)
                                }}
                            >
                                Hủy
                            </Button>
                            <Button type='submit' loading={updateMutation.isPending}>
                                Cập nhật
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                opened={deleteModalOpened}
                onClose={() => {
                    setDeleteModalOpened(false)
                    setDeleteErrorMessage(null)
                }}
                title='Xác nhận xóa'
                size='sm'
            >
                <Stack gap='md'>
                    {deleteErrorMessage && (
                        <Alert
                            icon={<IconAlertCircle size='1rem' />}
                            color='red'
                            variant='light'
                            withCloseButton
                            onClose={() => setDeleteErrorMessage(null)}
                        >
                            {deleteErrorMessage}
                        </Alert>
                    )}

                    <Text>Bạn có chắc chắn muốn xóa danh mục "{category.name}"?</Text>
                    <Group justify='flex-end'>
                        <Button
                            variant='outline'
                            onClick={() => {
                                setDeleteModalOpened(false)
                                setDeleteErrorMessage(null)
                            }}
                        >
                            Hủy
                        </Button>
                        <Button color='red' onClick={handleDelete} loading={deleteMutation.isPending}>
                            Xóa
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    )
}

export default CategoryCard
