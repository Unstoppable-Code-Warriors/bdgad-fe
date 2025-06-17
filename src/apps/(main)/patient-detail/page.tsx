import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
    Container,
    Title,
    Card,
    Text,
    Stack,
    Button,
    Group,
    Grid,
    Paper,
    ActionIcon,
    Badge,
    Flex,
    Box,
    Divider
} from '@mantine/core'
import {
    IconArrowLeft,
    IconFile,
    IconDownload,
    IconEye,
    IconFileText,
    IconPhoto,
    IconFileWord,
    IconCalendarEvent,
    IconFileImport,
    IconFileExport,
    IconUpload
} from '@tabler/icons-react'

// Mock data for patient files
const mockPatientFiles = {
    '1': [
        {
            id: 'f1',
            name: 'Kết quả xét nghiệm',
            type: 'pdf',
            size: '2.5 MB',
            uploadedAt: '2024-01-15',
            category: 'File Input'
        },
        {
            id: 'f2',
            name: 'Kết quả xét nghiệm',
            type: 'image',
            size: '1.8 MB',
            uploadedAt: '2024-01-16',
            category: 'File Output'
        },
        {
            id: 'f3',
            name: 'Phiếu chỉ định',
            type: 'image',
            size: '0.5 MB',
            uploadedAt: '2024-01-17',
            category: 'File Input'
        },
        {
            id: 'f4',
            name: 'Báo cáo xét nghiệm',
            type: 'word',
            size: '1.2 MB',
            uploadedAt: '2024-01-18',
            category: 'File Output'
        }
    ],
    '2': [
        {
            id: 'f5',
            name: 'Kết quả MRI não',
            type: 'image',
            size: '5.2 MB',
            uploadedAt: '2024-01-16',
            category: 'File Output'
        },
        {
            id: 'f6',
            name: 'Phiếu khám bệnh',
            type: 'pdf',
            size: '0.8 MB',
            uploadedAt: '2024-01-17',
            category: 'File Input'
        }
    ],
    '3': [
        {
            id: 'f7',
            name: 'Kết quả ECG',
            type: 'pdf',
            size: '1.1 MB',
            uploadedAt: '2024-01-17',
            category: 'File Input'
        },
        {
            id: 'f8',
            name: 'Ảnh nội soi',
            type: 'image',
            size: '3.4 MB',
            uploadedAt: '2024-01-18',
            category: 'File Output'
        },
        {
            id: 'f9',
            name: 'Toa thuốc điều trị',
            type: 'word',
            size: '0.7 MB',
            uploadedAt: '2024-01-19',
            category: 'File Input'
        }
    ]
}

const getFileIcon = (type: string) => {
    switch (type) {
        case 'pdf':
            return <IconFileWord size={20} color='#e03131' />
        case 'image':
            return <IconPhoto size={20} color='#1971c2' />
        case 'word':
            return <IconFileWord size={20} color='#2f9e44' />
        default:
            return <IconFileText size={20} />
    }
}

const PatientDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [files, setFiles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id && mockPatientFiles[id as keyof typeof mockPatientFiles]) {
            setFiles(mockPatientFiles[id as keyof typeof mockPatientFiles])
        } else {
            setFiles([])
        }
        setLoading(false)
    }, [id])

    const handleBack = () => {
        navigate('/patient-info')
    }

    const handleImport = () => {
        navigate('/import-file/input', {
            state: { patientId: id }
        })
    }

    const handleViewFile = (fileId: string) => {
        console.log('View file:', fileId)
    }

    const handleDownloadFile = (fileId: string) => {
        console.log('Download file:', fileId)
    }

    const inputFiles = files.filter((file) => file.category === 'File Input')
    const outputFiles = files.filter((file) => file.category === 'File Output')

    const renderFileGrid = (fileList: any[]) => (
        <Grid>
            {fileList.map((file) => (
                <Grid.Col key={file.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                    <Card
                        shadow='sm'
                        padding='lg'
                        withBorder
                        style={{
                            height: '100%',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <Stack gap='sm' h='100%'>
                            {/* File Icon */}
                            <Group justify='center'>{getFileIcon(file.type)}</Group>

                            {/* File Name */}
                            <Box style={{ flexGrow: 1 }}>
                                <Text fw={600} size='sm' lineClamp={2} ta='center'>
                                    {file.name}
                                </Text>
                            </Box>

                            {/* File Info */}
                            <Stack gap='xs'>
                                <Text size='xs' c='dimmed' ta='center'>
                                    Kích thước: {file.size}
                                </Text>
                                <Flex align='center' gap='xs' justify='center'>
                                    <IconCalendarEvent size={12} />
                                    <Text size='xs' c='dimmed'>
                                        {new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
                                    </Text>
                                </Flex>
                            </Stack>

                            {/* Action Buttons */}
                            <Group justify='center' mt='auto'>
                                <ActionIcon variant='light' color='blue' onClick={() => handleViewFile(file.id)}>
                                    <IconEye size={16} />
                                </ActionIcon>
                                <ActionIcon variant='light' color='green' onClick={() => handleDownloadFile(file.id)}>
                                    <IconDownload size={16} />
                                </ActionIcon>
                            </Group>
                        </Stack>
                    </Card>
                </Grid.Col>
            ))}
        </Grid>
    )

    const renderEmptyState = (type: string) => (
        <Paper p='xl' ta='center' withBorder>
            <IconFile size={48} color='gray' />
            <Text size='sm' c='dimmed' mt='md'>
                Chưa có {type.toLowerCase()} nào
            </Text>
        </Paper>
    )

    if (loading) {
        return (
            <Container size='xl' py='xl'>
                <Text>Đang tải...</Text>
            </Container>
        )
    }

    return (
        <Container size='xl' py='xl'>
            <Stack gap='lg'>
                {/* Header */}
                <Group justify='space-between'>
                    <Group>
                        <ActionIcon variant='light' size='lg' onClick={handleBack}>
                            <IconArrowLeft size={20} />
                        </ActionIcon>
                        <Title order={2}>Hồ sơ bệnh nhân #{id}</Title>
                    </Group>

                    <Button leftSection={<IconUpload size={16} />} onClick={handleImport}>
                        Tải lên file mới
                    </Button>
                </Group>

                {/* Overall Statistics */}
                {files.length > 0 && (
                    <Card shadow='sm' padding='lg' withBorder>
                        <Group justify='space-between'>
                            <div>
                                <Text fw={600}>Tổng quan</Text>
                                <Text size='sm' c='dimmed'>
                                    Tổng cộng {files.length} file
                                </Text>
                            </div>
                            <Group>
                                <Badge color='blue' variant='light'>
                                    Input: {inputFiles.length}
                                </Badge>
                                <Badge color='green' variant='light'>
                                    Output: {outputFiles.length}
                                </Badge>
                            </Group>
                        </Group>
                    </Card>
                )}

                {/* File Input Section */}
                <Stack gap='md'>
                    <Group>
                        <IconFileImport size={24} color='#1971c2' />
                        <Title order={3} c='blue'>
                            File Input
                        </Title>
                        <Badge color='blue' variant='light'>
                            {inputFiles.length} file{inputFiles.length !== 1 ? 's' : ''}
                        </Badge>
                    </Group>

                    {inputFiles.length > 0 ? renderFileGrid(inputFiles) : renderEmptyState('File Input')}
                </Stack>

                <Divider my='xl' />

                {/* File Output Section */}
                <Stack gap='md'>
                    <Group>
                        <IconFileExport size={24} color='#2f9e44' />
                        <Title order={3} c='green'>
                            File Output
                        </Title>
                        <Badge color='green' variant='light'>
                            {outputFiles.length} file{outputFiles.length !== 1 ? 's' : ''}
                        </Badge>
                    </Group>

                    {outputFiles.length > 0 ? renderFileGrid(outputFiles) : renderEmptyState('File Output')}
                </Stack>
            </Stack>
        </Container>
    )
}

export default PatientDetailPage
