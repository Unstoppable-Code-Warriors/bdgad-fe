import { Dropzone } from '@mantine/dropzone'
import type { FileWithPath } from '@mantine/dropzone'
import { 
    Stack, Text, Button, Alert, Group, rem, ActionIcon, Card, Flex
} from '@mantine/core'
import {
    IconPlus, IconFile, IconTrash, IconPhoto
} from '@tabler/icons-react'

interface AdditionalFilesProps {
    files: FileWithPath[]
    onFilesChange: (files: FileWithPath[]) => void
}

const AdditionalFiles = ({ files, onFilesChange }: AdditionalFilesProps) => {
    const handleAdditionalFileDrop = (newFiles: FileWithPath[], index: number) => {
        if (newFiles.length > 0) {
            const updatedFiles = [...files]
            updatedFiles[index] = newFiles[0]
            onFilesChange(updatedFiles)
        }
    }

    const handleRemoveAdditionalFile = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index)
        onFilesChange(updatedFiles)
    }

    const addAdditionalFileArea = () => {
        onFilesChange([...files, null as any])
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

    return (
        <Stack gap="lg">
            {/* Additional Files Section */}
            {files.map((file, index) => (
                <Card key={index} withBorder padding="md" radius="md">
                    <Stack gap="sm">
                        <Flex justify="space-between" align="center">
                            <Text size="sm" fw={500}>Additional File {index + 1}</Text>
                            <ActionIcon
                                color="red"
                                variant="subtle"
                                onClick={() => handleRemoveAdditionalFile(index)}
                            >
                                <IconTrash size="1rem" />
                            </ActionIcon>
                        </Flex>

                        {!file ? (
                            <Dropzone
                                onDrop={(droppedFiles) => handleAdditionalFileDrop(droppedFiles, index)}
                                onReject={(rejectedFiles) => console.log('rejected files', rejectedFiles)}
                                maxSize={10 * 1024 ** 2}
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
                            >
                                <Group justify='center' gap='xl' mih={120} style={{ pointerEvents: 'none' }}>
                                    <IconFile
                                        style={{ width: rem(30), height: rem(30), color: 'var(--mantine-color-dimmed)' }}
                                        stroke={1.5}
                                    />
                                    <div>
                                        <Text size='md' inline>
                                            Drop additional file here or click to select
                                        </Text>
                                        <Text size='xs' c='dimmed' inline mt={4}>
                                            Any format (Max 10MB)
                                        </Text>
                                    </div>
                                </Group>
                            </Dropzone>
                        ) : (
                            <Alert color='blue' variant='light'>
                                <Group justify='space-between'>
                                    <Group gap="sm">
                                        {getFileIcon(file.name)}
                                        <div>
                                            <Text fw={500} size="sm">File Selected</Text>
                                            <Text size='xs' c='dimmed'>
                                                {file.name} ({Math.round(file.size / 1024)} KB)
                                            </Text>
                                        </div>
                                    </Group>
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
                    onClick={addAdditionalFileArea}
                    size="sm"
                >
                    Add Another File
                </Button>
            </Group>
        </Stack>
    )
}

export default AdditionalFiles