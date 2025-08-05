import { useCallback, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
    Container,
    Title,
    Card,
    Text,
    Stack,
    Button,
    Group,
    ActionIcon,
    Badge,
    Flex,
    Box,
    Grid,
    Paper,
    Modal
} from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import type { FileRejection, FileWithPath } from '@mantine/dropzone'
import {
    IconArrowLeft,
    IconDownload,
    IconTrash,
    IconFileText,
    IconPhoto,
    IconFileWord,
    IconCalendarEvent,
    IconMicroscope,
    IconClipboardCheck,
    IconUser,
    IconFileZip,
    IconFile,
    IconSend,
    IconCheck,
    IconUpload,
    IconPlus,
    IconAlertCircle
} from '@tabler/icons-react'
import {
    usePatientLabSessionDetail,
    useDeletePatientFile,
    useUploadPatientFiles,
    useDownloadEtlResult
} from '@/services/hook/staff-patient-session.hook'
import SendFilesModal from '../components/SendFilesModal'
import { notifications } from '@mantine/notifications'
import { useDownloadPatientFile } from '@/services/hook/staff-general-files.hook'
import { modals } from '@mantine/modals'

const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
        case 'pdf':
            return <IconFileText size={20} color='#e03131' />
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return <IconPhoto size={20} color='#1971c2' />
        case 'doc':
        case 'docx':
            return <IconFileWord size={20} color='#2f9e44' />
        case 'xlsx':
        case 'xls':
            return <IconFileText size={20} color='#2f9e44' />
        case 'zip':
        case 'rar':
            return <IconFileZip size={20} color='#f59f00' />
        default:
            return <IconFile size={20} />
    }
}

const getStatusBadge = (typeLabSession: string) => {
    if (typeLabSession === 'test') {
        return (
            <Badge color='blue' variant='light' size='sm'>
                Xét nghiệm
            </Badge>
        )
    } else if (typeLabSession === 'validation') {
        return (
            <Badge color='green' variant='light' size='sm'>
                Thẩm định
            </Badge>
        )
    }
    return (
        <Badge color='gray' variant='light' size='sm'>
            {typeLabSession}
        </Badge>
    )
}

const getSessionTypeIcon = (typeLabSession: string) => {
    if (typeLabSession === 'test') {
        return <IconMicroscope size={24} color='#1971c2' />
    } else {
        return <IconClipboardCheck size={24} color='#2f9e44' />
    }
}

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getEtlStatusBadge = (status: string | null) => {
    switch (status) {
        case 'completed':
            return (
                <Badge color='green' variant='filled' size='sm'>
                    Hoàn thành
                </Badge>
            )
        case 'rejected':
            return (
                <Badge color='red' variant='filled' size='sm'>
                    Bị từ chối
                </Badge>
            )
        case 'pending':
            return (
                <Badge color='yellow' variant='filled' size='sm'>
                    Đang xử lý
                </Badge>
            )
        default:
            return (
                <Badge color='gray' variant='filled' size='sm'>
                    Chưa rõ
                </Badge>
            )
    }
}

const getFastqPairStatusBadge = (status: string) => {
    switch (status) {
        case 'completed':
            return (
                <Badge color='green' variant='light' size='xs'>
                    Hoàn thành
                </Badge>
            )
        case 'rejected':
            return (
                <Badge color='red' variant='light' size='xs'>
                    Bị từ chối
                </Badge>
            )
        case 'processing':
            return (
                <Badge color='blue' variant='light' size='xs'>
                    Đang xử lý
                </Badge>
            )
        default:
            return (
                <Badge color='gray' variant='light' size='xs'>
                    {status}
                </Badge>
            )
    }
}

const SessionDetailPage = () => {
    const { id: patientId, sessionId } = useParams<{ id: string; sessionId: string }>()
    const navigate = useNavigate()
    const [isSendModalOpen, setIsSendModalOpen] = useState(false)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<FileWithPath[]>([])
    const [uploadError, setUploadError] = useState<string>('')
    const dropzoneRef = useRef<any>(null)

    const { data: sessionData, isLoading, error } = usePatientLabSessionDetail(sessionId!)
    console.log('Session Data:', sessionData)

    const downloadMutation = useDownloadPatientFile()
    const deletePatientFileMutation = useDeletePatientFile()
    const uploadPatientFilesMutation = useUploadPatientFiles()
    const downloadEtlResultMutation = useDownloadEtlResult()

    const handleBack = () => {
        navigate(`/patient-detail/${patientId}`)
    }

    const handleDownloadFile = useCallback(
        async (fileId: string, fileName?: string) => {
            try {
                const response = await downloadMutation.mutateAsync({ patientFileId: fileId!, sessionId: sessionId! })

                let downloadUrl: string
                let finalFileName = fileName || 'downloaded-file'

                if (typeof response === 'string') {
                    downloadUrl = response.trim()
                } else if (response && typeof response === 'object') {
                    downloadUrl = response.downloadUrl || response.url || response.data || String(response)
                    finalFileName = response.fileName || response.filename || finalFileName
                } else {
                    throw new Error('Invalid response format')
                }

                // Validate URL
                if (!downloadUrl || (!downloadUrl.startsWith('http') && !downloadUrl.startsWith('blob:'))) {
                    throw new Error('Invalid download URL: ' + downloadUrl)
                }

                // Create download link and trigger download
                const link = document.createElement('a')
                link.href = downloadUrl
                link.download = finalFileName
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                notifications.show({
                    title: 'Thành công',
                    message: 'Tệp tin đã được tải xuống thành công',
                    color: 'green'
                })
            } catch (error) {
                console.error('Download failed:', error)
                notifications.show({
                    title: 'Lỗi',
                    message: `Không thể tải xuống tệp tin: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    color: 'red'
                })
            }
        },
        [downloadMutation, sessionId]
    )

    const handleDownloadEtlResult = useCallback(
        async (etlResultId: number) => {
            try {
                const response = await downloadEtlResultMutation.mutateAsync(etlResultId)

                let downloadUrl: string

                if (typeof response === 'string') {
                    downloadUrl = response.trim()
                } else if (response && typeof response === 'object') {
                    downloadUrl = response.downloadUrl || response.url || response.data || String(response)
                } else {
                    throw new Error('Invalid response format')
                }

                // Validate URL
                if (!downloadUrl || (!downloadUrl.startsWith('http') && !downloadUrl.startsWith('blob:'))) {
                    throw new Error('Invalid download URL: ' + downloadUrl)
                }

                // Create download link and trigger download
                const link = document.createElement('a')
                link.href = downloadUrl
                link.download = `etl-result-${etlResultId}.zip`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                notifications.show({
                    title: 'Thành công',
                    message: 'Kết quả phân tích đã được tải xuống thành công',
                    color: 'green'
                })
            } catch (error) {
                console.error('ETL download failed:', error)
                notifications.show({
                    title: 'Lỗi',
                    message: `Không thể tải xuống kết quả phân tích: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    color: 'red'
                })
            }
        },
        [downloadEtlResultMutation]
    )

    const handleSendFiles = () => {
        setIsSendModalOpen(true)
    }

    const handleCloseSendModal = () => {
        setIsSendModalOpen(false)
    }

    const handleDeleteFile = useCallback(
        (fileId: string, fileName: string) => {
            modals.openConfirmModal({
                title: 'Xác nhận xóa file',
                children: (
                    <Text size='sm'>
                        Bạn có chắc chắn muốn xóa file <strong>{fileName}</strong>? Hành động này không thể hoàn tác.
                    </Text>
                ),
                labels: { confirm: 'Xóa', cancel: 'Hủy' },
                confirmProps: { color: 'red' },
                onConfirm: async () => {
                    try {
                        await deletePatientFileMutation.mutateAsync({
                            patientFileId: fileId,
                            sessionId: sessionId!
                        })

                        notifications.show({
                            title: 'Thành công',
                            message: `Đã xóa file ${fileName}`,
                            color: 'green'
                        })
                    } catch (error) {
                        notifications.show({
                            title: 'Lỗi',
                            message: `Không thể xóa file: ${error instanceof Error ? error.message : 'Unknown error'}`,
                            color: 'red'
                        })
                    }
                }
            })
        },
        [deletePatientFileMutation, sessionId]
    )

    const handleUploadFiles = useCallback(
        async (files: File[]) => {
            if (!files.length) return

            try {
                await uploadPatientFilesMutation.mutateAsync({
                    labSessionId: sessionId!,
                    files
                })

                notifications.show({
                    title: 'Thành công',
                    message: `${files.length} file đã được tải lên thành công`,
                    color: 'green'
                })

                // Reset the selected files and close modal
                setSelectedFiles([])
                setIsUploadModalOpen(false)
            } catch (error) {
                console.error('Upload failed:', error)
                notifications.show({
                    title: 'Lỗi',
                    message: 'Có lỗi xảy ra khi tải file lên',
                    color: 'red'
                })
            }
        },
        [uploadPatientFilesMutation, sessionId]
    )

    const handleOpenUploadModal = () => {
        setSelectedFiles([])
        setUploadError('') // Clear error when opening modal
        setIsUploadModalOpen(true)
    }

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false)
        setSelectedFiles([])
        setUploadError('')
    }

    const handleSubmitUpload = () => {
        if (selectedFiles.length > 0) {
            handleUploadFiles(selectedFiles as File[])
        }
    }
    const handleFileReject = useCallback((rejectedFiles: FileRejection[]) => {
        console.log('rejected files', rejectedFiles)

        const errorMessages = rejectedFiles.map(({ file, errors }) => {
            const fileName = file.name
            const errorList = errors.map((error) => {
                switch (error.code) {
                    case 'file-invalid-type':
                        return `định dạng không được hỗ trợ`
                    case 'file-too-large':
                        return `quá lớn (tối đa 10MB)`
                    case 'too-many-files':
                        return `vượt quá số lượng file cho phép`
                    default:
                        return error.message
                }
            })
            return `"${fileName}": ${errorList.join(', ')}`
        })

        const errorMessage = `Không thể tải file: ${errorMessages.join('; ')}`

        // Set error state
        setUploadError(errorMessage)

        // Show notification
        notifications.show({
            title: 'Lỗi tải file',
            message: errorMessage,
            color: 'red',
            icon: <IconAlertCircle size='1rem' />,
            autoClose: 8000
        })
    }, [])

    const handleFilesSelected = useCallback((files: FileWithPath[]) => {
        // Clear any previous errors when files are successfully selected
        setUploadError('')

        setSelectedFiles((prevFiles) => {
            // Create a new array combining existing files with new files
            const combinedFiles = [...prevFiles, ...files]

            // Remove duplicates based on file name and size
            const uniqueFiles = combinedFiles.filter(
                (file, index, self) => index === self.findIndex((f) => f.name === file.name && f.size === file.size)
            )

            return uniqueFiles
        })
    }, [])

    if (isLoading) {
        return (
            <Container size='xl' py='xl'>
                <Text>Đang tải...</Text>
            </Container>
        )
    }

    if (error) {
        return (
            <Container size='xl' py='xl'>
                <Paper p='xl' ta='center' withBorder>
                    <Text color='red'>Có lỗi xảy ra khi tải dữ liệu</Text>
                    <Button mt='md' onClick={handleBack}>
                        Quay lại
                    </Button>
                </Paper>
            </Container>
        )
    }

    if (!sessionData) {
        return (
            <Container size='xl' py='xl'>
                <Paper p='xl' ta='center' withBorder>
                    <Text>Không tìm thấy lần khám</Text>
                    <Button mt='md' onClick={handleBack}>
                        Quay lại
                    </Button>
                </Paper>
            </Container>
        )
    }

    function handleRemoveFile(index: number): void {
        setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
        setUploadError('')
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
                        <div>
                            <Title order={2}>Lần khám </Title>
                        </div>
                    </Group>

                    {/* Send Files Button */}
                    {sessionData?.patientFiles &&
                        sessionData.patientFiles.length > 0 &&
                        (() => {
                            const hasDoctor = sessionData?.labcode?.assignment?.doctor?.id
                            const hasLabTech =
                                sessionData?.labcode?.assignment?.labTesting?.id || sessionData?.labTesting?.id
                            const isAlreadyAssigned =
                                sessionData.typeLabSession === 'test' ? hasDoctor && hasLabTech : hasDoctor

                            return (
                                <Button
                                    leftSection={isAlreadyAssigned ? <IconCheck size={16} /> : <IconSend size={16} />}
                                    onClick={handleSendFiles}
                                    color={sessionData.typeLabSession === 'test' ? 'blue' : 'green'}
                                    variant={isAlreadyAssigned ? 'light' : 'filled'}
                                >
                                    {isAlreadyAssigned
                                        ? 'Thông tin người nhận'
                                        : sessionData.typeLabSession === 'test'
                                          ? 'Gửi Xét nghiệm'
                                          : 'Gửi Thẩm định'}
                                </Button>
                            )
                        })()}
                </Group>

                {/* Session Info */}
                <Card shadow='sm' padding='lg' withBorder>
                    <Group justify='space-between' align='flex-start'>
                        <Group align='flex-start'>
                            <Box
                                p='md'
                                bg={sessionData.typeLabSession === 'test' ? 'blue.0' : 'green.0'}
                                style={{ borderRadius: '12px' }}
                            >
                                {getSessionTypeIcon(sessionData.typeLabSession)}
                            </Box>

                            <div>
                                <Group gap='sm' mb='xs'>
                                    {getStatusBadge(sessionData.typeLabSession)}
                                </Group>

                                <Text fw={500} size='lg' mb='sm'>
                                    Barcode:{' '}
                                    <Text span fw={600}>
                                        {sessionData.patient.barcode}
                                    </Text>
                                </Text>

                                <Group gap='lg'>
                                    <Flex align='center' gap='xs'>
                                        <IconCalendarEvent size={16} />
                                        <Text size='sm' c='dimmed'>
                                            {new Date(sessionData.createdAt).toLocaleDateString('vi-VN')}
                                        </Text>
                                    </Flex>
                                    <Flex align='center' gap='xs'>
                                        <IconUser size={16} />
                                        <Text size='sm' c='dimmed'>
                                            {sessionData.assignment?.doctor?.name || 'Chưa có bác sĩ'}
                                        </Text>
                                    </Flex>
                                    <Text size='sm' c='dimmed'>
                                        Tổng cộng: {sessionData.patientFiles?.length || 0} file
                                    </Text>
                                </Group>
                            </div>
                        </Group>
                    </Group>
                </Card>

                {/* ETL Results History */}
                {sessionData.etlResults && sessionData.etlResults.length > 0 && (
                    <Card shadow='sm' padding='lg' withBorder>
                        <Group mb='lg'>
                            <Title order={3} c={sessionData.typeLabSession === 'test' ? 'blue' : 'green'}>
                                Lịch sử kết quả phân tích
                            </Title>
                            <Badge variant='light' color={sessionData.typeLabSession === 'test' ? 'blue' : 'green'}>
                                {sessionData.etlResults?.length || 0} kết quả
                            </Badge>
                        </Group>

                        <Stack gap='md'>
                            {sessionData.etlResults.map((etlResult: any) => (
                                <Card key={etlResult.id} withBorder p='md' radius='md'>
                                    <Group justify='space-between' align='flex-start'>
                                        <Stack gap='xs' flex={1}>
                                            <Group>
                                                <Text fw={600} size='sm'>
                                                    Kết quả #{etlResult.id}
                                                </Text>
                                                {getEtlStatusBadge(etlResult.status)}
                                            </Group>

                                            <Group gap='lg'>
                                                <Group>
                                                    <IconUser size={14} />
                                                    <Text size='xs' c='dimmed'>
                                                        {etlResult.analyzer.name || 'Chưa có người phân tích'}
                                                    </Text>
                                                </Group>
                                                <Group gap='xs'>
                                                    <IconCalendarEvent size={14} />
                                                    <Text size='xs' c='dimmed'>
                                                        {new Date(etlResult.etlCompletedAt).toLocaleDateString('vi-VN')}{' '}
                                                        lúc{' '}
                                                        {new Date(etlResult.etlCompletedAt).toLocaleTimeString('vi-VN')}
                                                    </Text>
                                                </Group>

                                                {etlResult.fastqPair && (
                                                    <Group gap='xs'>
                                                        <IconFile size={14} />
                                                        <Text size='xs' c='dimmed'>
                                                            FASTQ Pair #{etlResult.fastqPair.id}
                                                        </Text>
                                                        {getFastqPairStatusBadge(etlResult.fastqPair.status)}
                                                    </Group>
                                                )}
                                            </Group>

                                            {etlResult.reasonApprove && (
                                                <Paper p='xs' bg='gray.0' radius='sm'>
                                                    <Text size='xs' fs='italic'>
                                                        "{etlResult.reasonApprove}"
                                                    </Text>
                                                </Paper>
                                            )}

                                            {etlResult.reasonReject && (
                                                <Paper p='xs' bg='red.0' radius='sm'>
                                                    <Group gap='xs'>
                                                        <IconTrash size={12} color='red' />
                                                        <Text size='xs' c='red' fw={500}>
                                                            Lý do từ chối: {etlResult.reasonReject}
                                                        </Text>
                                                    </Group>
                                                </Paper>
                                            )}

                                            <Group gap='md'>
                                                {etlResult.rejector && (
                                                    <Group gap='xs'>
                                                        <IconUser size={12} />
                                                        <Text size='xs' c='dimmed'>
                                                            Từ chối bởi: {etlResult.rejector.name}
                                                        </Text>
                                                    </Group>
                                                )}

                                                {etlResult.approver && (
                                                    <Group gap='xs'>
                                                        <IconUser size={12} />
                                                        <Text size='xs' c='dimmed'>
                                                            Phê duyệt bởi: {etlResult.approver.name}
                                                        </Text>
                                                    </Group>
                                                )}
                                            </Group>
                                        </Stack>

                                        <Group gap='xs'>
                                            <ActionIcon
                                                variant='light'
                                                color='blue'
                                                size='sm'
                                                onClick={() => handleDownloadEtlResult(etlResult.id)}
                                                title='Tải xuống kết quả'
                                                loading={downloadEtlResultMutation.isPending}
                                            >
                                                <IconDownload size={14} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>
                                </Card>
                            ))}
                        </Stack>
                    </Card>
                )}

                {/* Files Grid */}
                <div>
                    <Group mb='lg' justify='space-between'>
                        <Group>
                            <Title order={3} c={sessionData.typeLabSession === 'test' ? 'blue' : 'green'}>
                                File {sessionData.typeLabSession === 'test' ? 'xét nghiệm' : 'thẩm định'}
                            </Title>
                            <Badge variant='light' color={sessionData.typeLabSession === 'test' ? 'blue' : 'green'}>
                                {sessionData.patientFiles?.length || 0} file
                            </Badge>
                        </Group>

                        <Group>
                            <Button
                                leftSection={<IconUpload size={16} />}
                                onClick={handleOpenUploadModal}
                                variant='light'
                                color={sessionData.typeLabSession === 'test' ? 'blue' : 'green'}
                            >
                                Tải lên file
                            </Button>
                        </Group>
                    </Group>

                    {sessionData.patientFiles && sessionData.patientFiles.length > 0 ? (
                        <>
                            <Grid>
                                {sessionData.patientFiles.map((file: any) => (
                                    <Grid.Col key={file.id} span={{ base: 12, md: 6, lg: 4 }}>
                                        <Card shadow='sm' padding='md' withBorder h='100%'>
                                            <Stack gap='sm'>
                                                {/* File Header */}
                                                <Group>
                                                    {getFileIcon(file.fileType)}
                                                    <Badge size='xs' variant='light' color='gray'>
                                                        {file.fileType.toUpperCase()}
                                                    </Badge>
                                                </Group>

                                                {/* File Info */}
                                                <div>
                                                    <div style={{ height: '55px' }}>
                                                        <Text fw={600} size='sm' mb='xs' lineClamp={2}>
                                                            {file.fileName}
                                                        </Text>
                                                    </div>
                                                    <Text size='xs' c='dimmed' mb='sm'>
                                                        {formatFileSize(file.fileSize)} •{' '}
                                                        {new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
                                                    </Text>
                                                    {/* Uploader Info */}
                                                    {file.uploader && (
                                                        <Group gap='xs' mb='sm'>
                                                            <IconUser size={12} />
                                                            <Text size='xs' c='dimmed'>
                                                                {file.uploader.name}
                                                            </Text>
                                                        </Group>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <Group gap='xs' mt='auto'>
                                                    <ActionIcon
                                                        variant='light'
                                                        color='green'
                                                        size='sm'
                                                        onClick={() => handleDownloadFile(file.id, file.fileName)}
                                                        flex={1}
                                                        title='Tải xuống'
                                                    >
                                                        <IconDownload size={14} />
                                                    </ActionIcon>
                                                    <ActionIcon
                                                        variant='light'
                                                        color='red'
                                                        size='sm'
                                                        onClick={() => handleDeleteFile(file.id, file.fileName)}
                                                        flex={1}
                                                        title='Xóa file'
                                                    >
                                                        <IconTrash size={14} />
                                                    </ActionIcon>
                                                </Group>
                                            </Stack>
                                        </Card>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </>
                    ) : (
                        <Paper p='xl' ta='center' withBorder>
                            <IconFile size={48} color='gray' />
                            <Title order={4} mt='md' c='dimmed'>
                                Chưa có file nào
                            </Title>
                            <Text c='dimmed' mt='xs' mb='lg'>
                                lần khám này chưa có file đính kèm
                            </Text>

                            <Button
                                leftSection={<IconPlus size={16} />}
                                onClick={handleOpenUploadModal}
                                variant='outline'
                                color={sessionData.typeLabSession === 'test' ? 'blue' : 'green'}
                            >
                                Tải lên file đầu tiên
                            </Button>
                        </Paper>
                    )}
                </div>

                {/* Send Files Modal */}
                <SendFilesModal
                    opened={isSendModalOpen}
                    onClose={handleCloseSendModal}
                    sessionType={sessionData?.typeLabSession || 'test'}
                    sessionId={sessionId!}
                    patientId={patientId!}
                    sessionData={sessionData}
                />

                {/* Upload Files Modal */}
                <Modal
                    opened={isUploadModalOpen}
                    onClose={handleCloseUploadModal}
                    title={
                        <Group>
                            <IconUpload size={20} />
                            <Text fw={600}>Tải lên file mới</Text>
                        </Group>
                    }
                    size='lg'
                    centered
                >
                    <Stack gap='md'>
                        {/* Error Alert */}
                        {uploadError && (
                            <Card withBorder p='md' bg='red.0' style={{ borderColor: '#fa5252' }}>
                                <Group gap='sm'>
                                    <IconAlertCircle size={20} color='#fa5252' />
                                    <div style={{ flex: 1 }}>
                                        <Text fw={600} c='red.7' size='sm'>
                                            Lỗi tải file
                                        </Text>
                                        <Text c='red.6' size='sm'>
                                            {uploadError}
                                        </Text>
                                    </div>
                                    <ActionIcon
                                        variant='subtle'
                                        color='red'
                                        size='sm'
                                        onClick={() => setUploadError('')}
                                    >
                                        <IconTrash size={14} />
                                    </ActionIcon>
                                </Group>
                            </Card>
                        )}

                        <Dropzone
                            ref={dropzoneRef}
                            onDrop={handleFilesSelected}
                            onReject={handleFileReject}
                            maxSize={10 * 1024 ** 2} // 10MB
                            accept={{
                                'image/jpeg': ['.jpg', '.jpeg'],
                                'image/png': ['.png'],
                                'image/gif': ['.gif'],
                                'application/pdf': ['.pdf'],
                                'application/msword': ['.doc'],
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                                'application/vnd.ms-excel': ['.xls'],
                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
                            }}
                            multiple
                            style={{
                                border: `2px dashed ${uploadError ? '#fa5252' : sessionData.typeLabSession === 'test' ? '#1971c2' : '#2f9e44'}`,
                                borderRadius: '12px',
                                backgroundColor: uploadError
                                    ? '#fff0f0'
                                    : sessionData.typeLabSession === 'test'
                                      ? '#e7f5ff'
                                      : '#ebfbee',
                                padding: '40px 20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Group justify='center' gap='xl' mih={160} style={{ pointerEvents: 'none' }}>
                                <Dropzone.Accept>
                                    <IconUpload
                                        size={52}
                                        color={sessionData.typeLabSession === 'test' ? '#1971c2' : '#2f9e44'}
                                        stroke={1.5}
                                    />
                                </Dropzone.Accept>
                                <Dropzone.Reject>
                                    <IconAlertCircle size={52} color='#fa5252' stroke={1.5} />
                                </Dropzone.Reject>
                                <Dropzone.Idle>
                                    <IconUpload
                                        size={52}
                                        color={
                                            uploadError
                                                ? '#fa5252'
                                                : sessionData.typeLabSession === 'test'
                                                  ? '#1971c2'
                                                  : '#2f9e44'
                                        }
                                        stroke={1.5}
                                    />
                                </Dropzone.Idle>

                                <div>
                                    <Text
                                        size='xl'
                                        inline
                                        fw={600}
                                        ta='center'
                                        c={
                                            uploadError
                                                ? 'red'
                                                : sessionData.typeLabSession === 'test'
                                                  ? 'blue'
                                                  : 'green'
                                        }
                                    >
                                        {uploadError
                                            ? 'Có lỗi xảy ra - Vui lòng thử lại'
                                            : selectedFiles.length > 0
                                              ? `Đã chọn ${selectedFiles.length} file - Thêm file khác`
                                              : 'Kéo thả file vào đây hoặc click để chọn'}
                                    </Text>

                                    <Text size='sm' c='dimmed' inline mt={7} ta='center'>
                                        Chỉ hỗ trợ tập tin hình ảnh (.jpg, .png, .gif), PDF, Word (.doc, .docx) và Excel
                                        (.xls, .xlsx)
                                    </Text>
                                    <Text size='sm' c='dimmed' inline mt={7} ta='center'>
                                        . Kích thước tối đa là 10MB.
                                    </Text>
                                </div>
                            </Group>
                        </Dropzone>

                        {selectedFiles.length > 0 && (
                            <Card withBorder p='md'>
                                <Group justify='space-between' mb='sm'>
                                    <Text fw={600}>File đã chọn ({selectedFiles.length}):</Text>
                                    <Button
                                        size='xs'
                                        variant='light'
                                        color='red'
                                        onClick={() => {
                                            setSelectedFiles([])
                                            setUploadError('')
                                        }}
                                    >
                                        Xóa tất cả
                                    </Button>
                                </Group>
                                <Stack gap='xs'>
                                    {selectedFiles.map((file, index) => (
                                        <Group
                                            key={index}
                                            justify='space-between'
                                            p='xs'
                                            style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                                        >
                                            <Group gap='xs'>
                                                {getFileIcon(file.name.split('.').pop() || '')}
                                                <div>
                                                    <Text size='sm' fw={500}>
                                                        {file.name}
                                                    </Text>
                                                    <Text size='xs' c='dimmed'>
                                                        {formatFileSize(file.size)}
                                                    </Text>
                                                </div>
                                            </Group>
                                            <ActionIcon
                                                size='sm'
                                                variant='light'
                                                color='red'
                                                onClick={() => handleRemoveFile(index)}
                                                title='Xóa file khỏi danh sách'
                                            >
                                                <IconTrash size={14} />
                                            </ActionIcon>
                                        </Group>
                                    ))}
                                </Stack>
                            </Card>
                        )}

                        <Group justify='space-between' mt='md'>
                            <Button variant='outline' onClick={handleCloseUploadModal}>
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSubmitUpload}
                                disabled={selectedFiles.length === 0 || !!uploadError}
                                loading={uploadPatientFilesMutation.isPending}
                                color={sessionData.typeLabSession === 'test' ? 'blue' : 'green'}
                                leftSection={<IconUpload size={16} />}
                            >
                                Tải lên {selectedFiles.length > 0 ? `(${selectedFiles.length} file)` : ''}
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
            </Stack>
        </Container>
    )
}

export default SessionDetailPage
