import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Container, Stack, Text, Button, Group, Grid, Center } from '@mantine/core'
import { IconPlus, IconFolder } from '@tabler/icons-react'
import FileStatistics from './components/FileStatistics'
import CategoryCard from './components/CategoryCard'
import CreateCategoryModal from './components/CreateCategoryModal'
import type { CategoryGeneralFile } from '@/types/general-file'
import { useCategoryGeneralFiles } from '@/services/hook/staff-category-general-files.hook'

const InputGeneralDataPage = () => {
    const [createCategoryModalOpened, setCreateCategoryModalOpened] = useState(false)
    const navigate = useNavigate()

    // Use hooks
    const { data: categoriesResponse, isLoading } = useCategoryGeneralFiles()

    const categories = categoriesResponse?.data || categoriesResponse || []

    const totalFiles = categories.reduce((total: number, category: CategoryGeneralFile) => {
        return total + (category.generalFiles?.length || 0)
    }, 0)

    const handleCreateCategory = () => {
        setCreateCategoryModalOpened(true)
    }

    const handleOpenCategory = (category: CategoryGeneralFile) => {
        navigate(`/input-general-data/${category.id}`)
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
                    <Button leftSection={<IconPlus size={16} />} onClick={handleCreateCategory}>
                        Tạo danh mục
                    </Button>
                </Group>

                <FileStatistics totalFiles={totalFiles} />

                {/* Categories Grid */}
                {isLoading ? (
                    <Center p='xl'>
                        <Text>Đang tải...</Text>
                    </Center>
                ) : categories.length > 0 ? (
                    <Grid>
                        {categories.map((category: CategoryGeneralFile) => (
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={category.id}>
                                <CategoryCard category={category} onOpenCategory={handleOpenCategory} />
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
