import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Container, Stack, Text, Button, Group, Grid, Center } from '@mantine/core'
import { IconPlus, IconFolder, IconSend } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import FileStatistics from './components/FileStatistics'
import CategoryCard from './components/CategoryCard'
import CreateCategoryModal from './components/CreateCategoryModal'
import type { CategoryGeneralFile } from '@/types/general-file'
import { useCategoryGeneralFiles, useSendGeneralFilesToEmr } from '@/services/hook/staff-category-general-files.hook'

const InputGeneralDataPage = () => {
    const [createCategoryModalOpened, setCreateCategoryModalOpened] = useState(false)
    const [isEmrSendMode, setIsEmrSendMode] = useState(false)
    const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set())
    const navigate = useNavigate()

    // Use hooks
    const { data: categoriesResponse, isLoading } = useCategoryGeneralFiles()
    const sendEmrMutation = useSendGeneralFilesToEmr()

    const categories = categoriesResponse?.data || categoriesResponse || []

    const totalFiles = categories.reduce((total: number, category: CategoryGeneralFile) => {
        return total + (category.generalFiles?.length || 0)
    }, 0)

    const handleCreateCategory = () => {
        setCreateCategoryModalOpened(true)
    }

    const handleOpenCategory = (category: CategoryGeneralFile) => {
        if (isEmrSendMode) return // Prevent navigation in EMR send mode
        navigate(`/input-general-data/${category.id}`)
    }

    const handleToggleEmrSendMode = () => {
        setIsEmrSendMode(!isEmrSendMode)
        setSelectedCategories(new Set()) // Clear selections when toggling mode
    }

    const handleCategorySelection = (categoryId: number, checked: boolean) => {
        // Find the category to check if it has files
        const category = categories.find((cat: CategoryGeneralFile) => cat.id === categoryId)

        // Prevent selection if category has no files
        if (checked && (!category?.generalFiles || category.generalFiles.length === 0)) {
            notifications.show({
                title: 'Không thể chọn',
                message: 'Không thể chọn danh mục không có tệp tin nào',
                color: 'orange'
            })
            return
        }

        const newSelected = new Set(selectedCategories)
        if (checked) {
            newSelected.add(categoryId)
        } else {
            newSelected.delete(categoryId)
        }
        setSelectedCategories(newSelected)
    }

    const handleSendEmr = async () => {
        try {
            await sendEmrMutation.mutateAsync({
                categoryGeneralFileIds: Array.from(selectedCategories)
            })

            notifications.show({
                title: 'Thành công',
                message: `Đã gửi ${selectedCategories.size} danh mục tới hệ thống EMR thành công`,
                color: 'green'
            })

            // Reset after sending
            setSelectedCategories(new Set())
            setIsEmrSendMode(false)
        } catch (error: any) {
            console.error('EMR send error:', error)

            notifications.show({
                title: 'Lỗi',
                message: error?.message || 'Không thể gửi dữ liệu tới hệ thống EMR',
                color: 'red'
            })
        }
    }

    return (
        <Container size='xl' py='xl'>
            <Stack gap='lg'>
                {/* Header */}
                <Group justify='space-between'>
                    <div>
                        <Text size='xl' fw={700}>
                            Quản lý dữ liệu chung
                        </Text>
                        <Text c='dimmed'>Tổ chức và quản lý các tệp tin theo danh mục</Text>
                    </div>
                    <Group>
                        <Button color='blue' leftSection={<IconSend size={16} />} onClick={handleToggleEmrSendMode}>
                            {isEmrSendMode ? 'Hủy chọn' : 'Gửi EMR'}
                        </Button>
                        {isEmrSendMode && selectedCategories.size > 0 && (
                            <Button
                                color='green'
                                leftSection={<IconSend size={16} />}
                                onClick={handleSendEmr}
                                loading={sendEmrMutation.isPending}
                                disabled={sendEmrMutation.isPending}
                            >
                                {sendEmrMutation.isPending ? 'Đang gửi...' : `Gửi (${selectedCategories.size})`}
                            </Button>
                        )}
                        <Button leftSection={<IconPlus size={16} />} onClick={handleCreateCategory}>
                            Tạo danh mục
                        </Button>
                    </Group>
                </Group>

                <FileStatistics totalFiles={totalFiles} totalCategories={categories.length} />

                {/* Categories Grid */}
                {isLoading ? (
                    <Center p='xl'>
                        <Text>Đang tải...</Text>
                    </Center>
                ) : categories.length > 0 ? (
                    <Grid>
                        {categories.map((category: CategoryGeneralFile) => (
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={category.id}>
                                <CategoryCard
                                    category={category}
                                    onOpenCategory={handleOpenCategory}
                                    isEmrSendMode={isEmrSendMode}
                                    isSelected={selectedCategories.has(category.id)}
                                    onSelectionChange={handleCategorySelection}
                                />
                            </Grid.Col>
                        ))}
                    </Grid>
                ) : (
                    <Center p='xl'>
                        <Stack align='center' gap='sm'>
                            <IconFolder size={48} color='var(--mantine-color-gray-5)' />
                            <Text c='dimmed'>Chưa có danh mục nào</Text>
                            <Button variant='light' leftSection={<IconPlus size={16} />} onClick={handleCreateCategory}>
                                Tạo danh mục đầu tiên
                            </Button>
                        </Stack>
                    </Center>
                )}

                {/* Modals */}
                <CreateCategoryModal
                    opened={createCategoryModalOpened}
                    onClose={() => setCreateCategoryModalOpened(false)}
                />
            </Stack>
        </Container>
    )
}

export default InputGeneralDataPage
