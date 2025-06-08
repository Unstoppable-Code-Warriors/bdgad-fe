import { useState } from 'react'
import { Dropzone } from '@mantine/dropzone'
import type { FileWithPath } from '@mantine/dropzone'
import { Stack, Text, Button, Alert, Group, rem } from '@mantine/core'
import { IconUpload, IconPhoto, IconX, IconAlertCircle } from '@tabler/icons-react'

interface UploadStepProps {
    onFileUpload: (file: File) => void
    loading: boolean
    error: string | null
}

const UploadStep = ({ onFileUpload, loading, error }: UploadStepProps) => {
    const [selectedFile, setSelectedFile] = useState<FileWithPath | null>(null)

    const handleDrop = (files: FileWithPath[]) => {
        if (files.length > 0) {
            setSelectedFile(files[0])
        }
    }

    const handleUpload = () => {
        if (selectedFile) {
            onFileUpload(selectedFile)
        }
    }

    const handleRemoveFile = () => {
        setSelectedFile(null)
    }

    return (
        <Stack gap='lg' mt='xl'>
            {error && (
                <Alert icon={<IconAlertCircle size='1rem' />} color='red' variant='light'>
                    {error}
                </Alert>
            )}

            {!selectedFile ? (
                <Dropzone
                    onDrop={handleDrop}
                    onReject={(files) => console.log('rejected files', files)}
                    maxSize={5 * 1024 ** 2} // 5MB
                    accept={['image/jpeg', 'image/png', 'image/jpg']}
                    multiple={false}
                    disabled={loading}
                >
                    <Group justify='center' gap='xl' mih={220} style={{ pointerEvents: 'none' }}>
                        <Dropzone.Accept>
                            <IconUpload
                                style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }}
                                stroke={1.5}
                            />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <IconX
                                style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
                                stroke={1.5}
                            />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <IconPhoto
                                style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
                                stroke={1.5}
                            />
                        </Dropzone.Idle>

                        <div>
                            <Text size='xl' inline>
                                Drag medical test requisition image here or click to select file
                            </Text>
                            <Text size='sm' c='dimmed' inline mt={7}>
                                Attach one image file (JPG, PNG). File should not exceed 5MB
                            </Text>
                        </div>
                    </Group>
                </Dropzone>
            ) : (
                <Stack gap='md' align='center'>
                    <Alert color='green' variant='light' w='100%'>
                        <Group justify='space-between'>
                            <div>
                                <Text fw={500}>File Selected</Text>
                                <Text size='sm' c='dimmed'>
                                    {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                                </Text>
                            </div>
                            <Button
                                variant='subtle'
                                color='red'
                                size='xs'
                                onClick={handleRemoveFile}
                                disabled={loading}
                            >
                                Remove
                            </Button>
                        </Group>
                    </Alert>

                    <Button
                        size='lg'
                        onClick={handleUpload}
                        loading={loading}
                        disabled={loading}
                        leftSection={<IconUpload size='1.2rem' />}
                    >
                        {loading ? 'Uploading...' : 'Upload & Process'}
                    </Button>
                </Stack>
            )}

            <Text size='sm' c='dimmed' ta='center'>
                Supported formats: JPG, PNG • Maximum size: 5MB
            </Text>
        </Stack>
    )
}

export default UploadStep
