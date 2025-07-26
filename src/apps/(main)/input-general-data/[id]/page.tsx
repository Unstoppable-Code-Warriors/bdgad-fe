import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
    Container,
    Stack,
    Group,
    Text,
    Button,
    Grid,
    Card,
    ActionIcon,
    Badge,
    Center,
    Loader,
    Breadcrumbs,
    Anchor,
    Tooltip,
    Box,
    ThemeIcon,
    Paper,
    Modal
} from '@mantine/core'
import {
    IconDownload,
    IconTrash,
    IconUpload,
    IconFile,
    IconArrowLeft,
    IconFileTypePdf,
    IconFileTypeDoc,
    IconFileTypeXls,
    IconPhoto,
    IconFileText,
    IconCalendar,
    IconWeight
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useCategoryGeneralFileDetail } from '@/services/hook/staff-category-general-files.hook'
import {
    useDownloadGeneralFile,
    useDeleteGeneralFile,
    useUploadGeneralFile
} from '@/services/hook/staff-general-files.hook'
import ImportFileModal from '../components/ImportFileModal'

const CategoryDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [importModalOpened, setImportModalOpened] = useState(false)
    const [deleteModalOpened, setDeleteModalOpened] = useState(false)
    const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null)

    const { data: category, isLoading } = useCategoryGeneralFileDetail(id)
    const downloadMutation = useDownloadGeneralFile()
    const deleteMutation = useDeleteGeneralFile()
    const uploadMutation = useUploadGeneralFile()

    const handleDownloadFile = async (fileId: string) => {
        try {
            const response = await downloadMutation.mutateAsync(fileId)
            const link = document.createElement('a')
            link.href = response.downloadUrl
            link.download = 'file.pdf'
            link.click()
            URL.revokeObjectURL(response.downloadUrl)

            notifications.show({
                title: 'Thành công',
                message: 'Tệp tin đã được tải xuống thành công',
                color: 'green'
            })
        } catch (error) {
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể tải xuống tệp tin',
                color: 'red'
            })
        }
    }

    const handleDeleteFile = async (fileId: string) => {
        try {
            await deleteMutation.mutateAsync(fileId)
            notifications.show({
                title: 'Thành công',
                message: 'Tệp tin đã được xóa thành công',
                color: 'green'
            })
            setDeleteModalOpened(false)
            setFileToDelete(null)
        } catch (error) {
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể xóa tệp tin',
                color: 'red'
            })
        }
    }

    const openDeleteConfirmation = (file: any) => {
        setFileToDelete({ id: file.id.toString(), name: file.fileName })
        setDeleteModalOpened(true)
    }

    const closeDeleteModal = () => {
        setDeleteModalOpened(false)
        setFileToDelete(null)
    }

    const handleImportFiles = async (uploadedFiles: File[]) => {
        if (!id) return

        try {
            const uploadPromises = uploadedFiles.map((file) =>
                uploadMutation.mutateAsync({
                    file,
                    categoryGeneralFileId: parseInt(id)
                })
            )

            await Promise.all(uploadPromises)

            notifications.show({
                title: 'Thành công',
                message: `${uploadedFiles.length} tệp tin đã được tải lên thành công`,
                color: 'green'
            })

            setImportModalOpened(false)
        } catch (error) {
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể tải lên tệp tin',
                color: 'red'
            })
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getFileIcon = (fileType: string) => {
        const type = fileType.toLowerCase()

        if (type.includes('pdf')) {
            return <IconFileTypePdf size={28} color='var(--mantine-color-red-6)' />
        } else if (type.includes('doc') || type.includes('word')) {
            return <IconFileTypeDoc size={28} color='var(--mantine-color-blue-6)' />
        } else if (type.includes('xls') || type.includes('excel') || type.includes('csv')) {
            return <IconFileTypeXls size={28} color='var(--mantine-color-green-6)' />
        } else if (type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('jpeg')) {
            return <IconPhoto size={28} color='var(--mantine-color-pink-6)' />
        } else if (type.includes('text') || type.includes('txt')) {
            return <IconFileText size={28} color='var(--mantine-color-gray-6)' />
        } else {
            return <IconFile size={28} color='var(--mantine-color-blue-6)' />
        }
    }

    const getFileTypeColor = (fileType: string) => {
        const type = fileType.toLowerCase()

        if (type.includes('pdf')) return 'red'
        if (type.includes('doc') || type.includes('word')) return 'blue'
        if (type.includes('xls') || type.includes('excel') || type.includes('csv')) return 'green'
        if (type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('jpeg'))
            return 'pink'
        if (type.includes('text') || type.includes('txt')) return 'gray'
        return 'blue'
    }

    const handleGoBack = () => {
        navigate('/input-general-data')
    }

    if (isLoading) {
        return (
            <Container size='xl' py='xl'>
                <Center p='xl'>
                    <Loader />
                </Center>
            </Container>
        )
    }

    return (
        <Container size='xl' py='xl'>
            <Stack gap='lg'>
                {/* Breadcrumbs and Header */}
                <Paper p='lg' radius='lg' bg='gradient-to-r from-blue-50 to-indigo-50' withBorder>
                    <Stack gap='md'>
                        <Breadcrumbs>
                            <Anchor onClick={handleGoBack} style={{ cursor: 'pointer' }} c='blue' fw={500}>
                                Quản lý dữ liệu chung
                            </Anchor>
                            <Text fw={600} c='dark'>
                                {category?.name || 'Chi tiết danh mục'}
                            </Text>
                        </Breadcrumbs>

                        <Group justify='space-between'>
                            <Group gap='md'>
                                <Tooltip label='Quay lại'>
                                    <ActionIcon
                                        variant='gradient'
                                        gradient={{ from: 'blue', to: 'cyan' }}
                                        size='xl'
                                        radius='lg'
                                        onClick={handleGoBack}
                                    >
                                        <IconArrowLeft size={20} />
                                    </ActionIcon>
                                </Tooltip>

                                <Box>
                                    <Text size='xl' fw={700} c='dark' mb={4}>
                                        {category?.name || 'Chi tiết danh mục'}
                                    </Text>
                                    <Text c='dimmed' size='sm' fw={500}>
                                        {category?.description || 'Không có mô tả'}
                                    </Text>
                                    <Badge size='sm' variant='gradient' gradient={{ from: 'blue', to: 'cyan' }} mt={8}>
                                        {category?.generalFiles?.length || 0} tệp tin
                                    </Badge>
                                </Box>
                            </Group>

                            <Button
                                size='md'
                                variant='gradient'
                                gradient={{ from: 'green', to: 'teal' }}
                                leftSection={<IconUpload size={18} />}
                                onClick={() => setImportModalOpened(true)}
                                style={{
                                    boxShadow: 'var(--mantine-shadow-md)'
                                }}
                            >
                                Tải lên tệp tin
                            </Button>
                        </Group>
                    </Stack>
                </Paper>

                {/* Files Grid */}
                {category?.generalFiles && category.generalFiles.length > 0 ? (
                    <Grid>
                        {category.generalFiles.map((file: any) => (
                            <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }} key={file.id}>
                                <Card
                                    shadow='md'
                                    padding='lg'
                                    radius='lg'
                                    withBorder
                                    h='100%'
                                    style={{
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'var(--mantine-shadow-lg)'
                                        }
                                    }}
                                >
                                    <Stack gap='md' h='100%'>
                                        {/* File Header */}
                                        <Group justify='space-between' align='flex-start'>
                                            <Group gap='sm' style={{ flex: 1 }}>
                                                <ThemeIcon
                                                    size='lg'
                                                    radius='md'
                                                    variant='light'
                                                    color={getFileTypeColor(file.fileType)}
                                                >
                                                    {getFileIcon(file.fileType)}
                                                </ThemeIcon>
                                                <Box style={{ flex: 1, minWidth: 0 }}>
                                                    <Tooltip label={file.fileName} position='top'>
                                                        <Text fw={600} size='sm' lineClamp={2} c='dark'>
                                                            {file.fileName}
                                                        </Text>
                                                    </Tooltip>
                                                    <Badge
                                                        size='xs'
                                                        variant='gradient'
                                                        gradient={{
                                                            from: getFileTypeColor(file.fileType),
                                                            to: 'indigo'
                                                        }}
                                                        mt={4}
                                                    >
                                                        {file.fileType.toUpperCase()}
                                                    </Badge>
                                                </Box>
                                            </Group>
                                        </Group>

                                        {/* File Info */}
                                        <Paper p='xs' radius='md' bg='gray.0'>
                                            <Stack gap='xs'>
                                                <Group gap='xs'>
                                                    <ThemeIcon size='sm' variant='light' color='blue'>
                                                        <IconWeight size={12} />
                                                    </ThemeIcon>
                                                    <Text size='xs' c='dimmed' fw={500}>
                                                        {formatFileSize(file.fileSize)}
                                                    </Text>
                                                </Group>

                                                <Group gap='xs'>
                                                    <ThemeIcon size='sm' variant='light' color='green'>
                                                        <IconCalendar size={12} />
                                                    </ThemeIcon>
                                                    <Text size='xs' c='dimmed' fw={500}>
                                                        {new Date(file.uploadedAt).toLocaleDateString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        })}
                                                    </Text>
                                                </Group>
                                            </Stack>
                                        </Paper>

                                        {/* Actions */}
                                        <Group justify='space-between' mt='auto'>
                                            <Tooltip label='Tải xuống'>
                                                <ActionIcon
                                                    variant='gradient'
                                                    gradient={{ from: 'blue', to: 'cyan' }}
                                                    size='lg'
                                                    radius='md'
                                                    onClick={() => handleDownloadFile(file.id.toString())}
                                                    loading={downloadMutation.isPending}
                                                >
                                                    <IconDownload size={18} />
                                                </ActionIcon>
                                            </Tooltip>

                                            <Tooltip label='Xóa tệp tin'>
                                                <ActionIcon
                                                    variant='gradient'
                                                    gradient={{ from: 'red', to: 'pink' }}
                                                    size='lg'
                                                    radius='md'
                                                    onClick={() => openDeleteConfirmation(file)}
                                                >
                                                    <IconTrash size={18} />
                                                </ActionIcon>
                                            </Tooltip>
                                        </Group>
                                    </Stack>
                                </Card>
                            </Grid.Col>
                        ))}
                    </Grid>
                ) : (
                    <Paper
                        p='xl'
                        radius='lg'
                        bg='gradient-to-br from-blue-50 to-indigo-50'
                        style={{ border: '2px dashed var(--mantine-color-blue-3)' }}
                    >
                        <Center>
                            <Stack align='center' gap='lg'>
                                <ThemeIcon
                                    size={80}
                                    radius='xl'
                                    variant='gradient'
                                    gradient={{ from: 'blue', to: 'cyan' }}
                                >
                                    <IconFile size={48} />
                                </ThemeIcon>

                                <Stack align='center' gap='xs'>
                                    <Text size='lg' fw={600} c='dark'>
                                        Chưa có tệp tin nào
                                    </Text>
                                    <Text size='sm' c='dimmed' ta='center' maw={400}>
                                        Bắt đầu tổ chức tệp tin của bạn bằng cách tải lên tệp tin đầu tiên vào danh mục
                                        này
                                    </Text>
                                </Stack>

                                <Button
                                    size='md'
                                    variant='gradient'
                                    gradient={{ from: 'blue', to: 'cyan' }}
                                    leftSection={<IconUpload size={20} />}
                                    onClick={() => setImportModalOpened(true)}
                                    style={{
                                        boxShadow: 'var(--mantine-shadow-md)'
                                    }}
                                >
                                    Tải lên tệp tin đầu tiên
                                </Button>
                            </Stack>
                        </Center>
                    </Paper>
                )}

                {/* Import Modal */}
                <ImportFileModal
                    opened={importModalOpened}
                    onClose={() => setImportModalOpened(false)}
                    onImport={handleImportFiles}
                />

                {/* Delete Confirmation Modal */}
                <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title='Xác nhận xóa tệp tin' size='sm'>
                    <Stack gap='md'>
                        <Text>
                            Bạn có chắc chắn muốn xóa tệp tin "{fileToDelete?.name}"?
                        </Text>
                        <Group justify='flex-end'>
                            <Button variant='outline' onClick={closeDeleteModal}>
                                Hủy
                            </Button>
                            <Button
                                color='red'
                                onClick={() => fileToDelete && handleDeleteFile(fileToDelete.id)}
                                loading={deleteMutation.isPending}
                            >
                                Xóa
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
            </Stack>
        </Container>
    )
}

export default CategoryDetailPage
