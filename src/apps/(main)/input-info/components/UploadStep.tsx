import { useState } from 'react'
import { Dropzone } from '@mantine/dropzone'
import type { FileWithPath } from '@mantine/dropzone'
import { Stack, Text, Button, Alert, Group, rem, ActionIcon, Card, Flex } from '@mantine/core'
import { IconUpload, IconPhoto, IconX, IconAlertCircle, IconPlus, IconFile, IconTrash } from '@tabler/icons-react'

interface UploadStepProps {
    onFileUpload: (files: File[]) => void
    loading: boolean
    error: string | null
}

const UploadStep = ({ onFileUpload, loading, error }: UploadStepProps) => {
    const [selectedFiles, setSelectedFiles] = useState<FileWithPath[]>([])
    const [uploadAreas, setUploadAreas] = useState<number[]>([0]) // Track multiple upload areas

    const handleDrop = (files: FileWithPath[], areaIndex: number) => {
        if (files.length > 0) {
            const newFiles = [...selectedFiles]
            newFiles[areaIndex] = files[0]
            setSelectedFiles(newFiles)
        }
    }

    const handleUpload = () => {
        const validFiles = selectedFiles.filter(file => file !== undefined)
        if (validFiles.length > 0) {
            onFileUpload(validFiles)
        }
    }

    const handleRemoveFile = (index: number) => {
        const newFiles = [...selectedFiles]
        newFiles[index] = undefined as any
        setSelectedFiles(newFiles)
    }

    const addUploadArea = () => {
        setUploadAreas([...uploadAreas, uploadAreas.length])
    }

    const removeUploadArea = (index: number) => {
        if (uploadAreas.length > 1) {
            const newAreas = uploadAreas.filter((_, i) => i !== index)
            const newFiles = selectedFiles.filter((_, i) => i !== index)
            setUploadAreas(newAreas)
            setSelectedFiles(newFiles)
        }
    }

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase()
        switch (extension) {
            case 'pdf':
                return <IconFile color="red" />
            case 'doc':
            case 'docx':
                return <IconFile color="blue" />
            case 'xls':
            case 'xlsx':
                return <IconFile color="green" />
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <IconPhoto color="purple" />
            default:
                return <IconFile color="gray" />
        }
    }

    const validFiles = selectedFiles.filter(file => file !== undefined)

    return (
        <Stack gap='lg' mt='xl'>
            {error && (
                <Alert icon={<IconAlertCircle size='1rem' />} color='red' variant='light'>
                    {error}
                </Alert>
            )}

            {uploadAreas.map((areaIndex, index) => (
                <Card key={areaIndex} withBorder padding="md" radius="md">
                    <Stack gap="sm">
                        <Flex justify="space-between" align="center">
                            <Text size="sm" fw={500}>Upload Area {index + 1}</Text>
                            {uploadAreas.length > 1 && (
                                <ActionIcon
                                    color="red"
                                    variant="subtle"
                                    onClick={() => removeUploadArea(index)}
                                    disabled={loading}
                                >
                                    <IconTrash size="1rem" />
                                </ActionIcon>
                            )}
                        </Flex>

                        {!selectedFiles[index] ? (
                            <Dropzone
                                onDrop={(files) => handleDrop(files, index)}
                                onReject={(files) => console.log('rejected files', files)}
                                maxSize={10 * 1024 ** 2} // 10MB
                                accept={[
                                    'image/jpeg', 'image/png', 'image/jpg', 'image/gif',
                                    'application/pdf',
                                    'application/msword',
                                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                    'application/vnd.ms-excel',
                                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                    'text/plain',
                                    'application/zip',
                                    'application/x-rar-compressed'
                                ]}
                                multiple={false}
                                disabled={loading}
                            >
                                <Group justify='center' gap='xl' mih={160} style={{ pointerEvents: 'none' }}>
                                    <Dropzone.Accept>
                                        <IconUpload
                                            style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-blue-6)' }}
                                            stroke={1.5}
                                        />
                                    </Dropzone.Accept>
                                    <Dropzone.Reject>
                                        <IconX
                                            style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-red-6)' }}
                                            stroke={1.5}
                                        />
                                    </Dropzone.Reject>
                                    <Dropzone.Idle>
                                        <IconFile
                                            style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-dimmed)' }}
                                            stroke={1.5}
                                        />
                                    </Dropzone.Idle>

                                    <div>
                                        <Text size='lg' inline>
                                            Drag file here or click to select
                                        </Text>
                                        <Text size='sm' c='dimmed' inline mt={7}>
                                            Supports: Images, PDF, Word, Excel, Text, ZIP, RAR (Max 10MB)
                                        </Text>
                                    </div>
                                </Group>
                            </Dropzone>
                        ) : (
                            <Alert color='green' variant='light'>
                                <Group justify='space-between'>
                                    <Group gap="sm">
                                        {getFileIcon(selectedFiles[index].name)}
                                        <div>
                                            <Text fw={500} size="sm">File Selected</Text>
                                            <Text size='xs' c='dimmed'>
                                                {selectedFiles[index].name} ({Math.round(selectedFiles[index].size / 1024)} KB)
                                            </Text>
                                        </div>
                                    </Group>
                                    <Button
                                        variant='subtle'
                                        color='red'
                                        size='xs'
                                        onClick={() => handleRemoveFile(index)}
                                        disabled={loading}
                                    >
                                        Remove
                                    </Button>
                                </Group>
                            </Alert>
                        )}
                    </Stack>
                </Card>
            ))}

            <Group justify="center">
                <Button
                    variant="outline"
                    leftSection={<IconPlus size="1rem" />}
                    onClick={addUploadArea}
                    disabled={loading}
                    size="sm"
                >
                    Add Another File
                </Button>
            </Group>

            {validFiles.length > 0 && (
                <Stack align="center" gap="md">
                    <Alert color="blue" variant="light" w="100%">
                        <Text size="sm" fw={500}>
                            {validFiles.length} file(s) ready to upload
                        </Text>
                    </Alert>

                    <Button
                        size='lg'
                        onClick={handleUpload}
                        loading={loading}
                        disabled={loading || validFiles.length === 0}
                        leftSection={<IconUpload size='1.2rem' />}
                        fullWidth
                    >
                        {loading ? 'Uploading...' : `Upload & Process ${validFiles.length} File(s)`}
                    </Button>
                </Stack>
            )}

            <Text size='sm' c='dimmed' ta='center'>
                Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP, RAR • Maximum size: 10MB per file
            </Text>
        </Stack>
    )
}

export default UploadStep
