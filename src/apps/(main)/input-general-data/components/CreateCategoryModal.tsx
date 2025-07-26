import { useState } from 'react'
import { Modal, TextInput, Textarea, Button, Stack, Group, Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import type { CreateCategoryRequest } from '@/types/general-file'
import { useCreateCategoryGeneralFile } from '@/services/hook/staff-category-general-files.hook'

interface CreateCategoryModalProps {
    opened: boolean
    onClose: () => void
}

// Validation function for name and description
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

const CreateCategoryModal = ({ opened, onClose }: CreateCategoryModalProps) => {
    const createMutation = useCreateCategoryGeneralFile()
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const form = useForm<CreateCategoryRequest>({
        initialValues: {
            name: '',
            description: ''
        },
        validate: {
            name: (value) => validateText(value, 1, 100, 'Tên danh mục'),
            description: (value) => validateText(value, 1, 500, 'Mô tả')
        }
    })

    const handleSubmit = async (values: CreateCategoryRequest) => {
        try {
            setErrorMessage(null)
            const res = await createMutation.mutateAsync(values)

            // Check response code for specific error cases
            if (res?.code === 'CATEGORY_ALREADY_EXISTS') {
                setErrorMessage('Tên danh mục đã tồn tại. Vui lòng chọn tên khác.')
                return
            }

            notifications.show({
                title: 'Thành công',
                message: 'Danh mục đã được tạo thành công',
                color: 'green'
            })
            form.reset()
            onClose()
        } catch (error: any) {
            console.error('Create category error:', error)
            setErrorMessage('Không thể tạo danh mục. Vui lòng thử lại.')
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể tạo danh mục',
                color: 'red'
            })
        }
    }

    const handleClose = () => {
        form.reset()
        setErrorMessage(null)
        onClose()
    }

    return (
        <Modal opened={opened} onClose={handleClose} title='Tạo danh mục mới' size='md'>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap='md'>
                    {errorMessage && (
                        <Alert
                            icon={<IconAlertCircle size='1rem' />}
                            color='red'
                            variant='light'
                            withCloseButton
                            onClose={() => setErrorMessage(null)}
                        >
                            {errorMessage}
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
                        <Button variant='outline' onClick={handleClose}>
                            Hủy
                        </Button>
                        <Button type='submit' loading={createMutation.isPending}>
                            Tạo danh mục
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    )
}

export default CreateCategoryModal
