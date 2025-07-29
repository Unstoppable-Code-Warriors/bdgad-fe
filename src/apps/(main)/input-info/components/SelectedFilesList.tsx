import type { FileWithPath } from '@mantine/dropzone'
import { Stack, Text, Alert, Group, ActionIcon } from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import { getFileIcon, getFileType, formatFileSize } from '../utils/fileUtils'

interface SelectedFilesListProps {
    files: FileWithPath[]
    onRemove: (index: number) => void
}

const SelectedFilesList = ({ files, onRemove }: SelectedFilesListProps) => {
    if (files.length === 0) return null

    return (
        <Stack gap="xs" mt="md">
            <Text size="sm" fw={500}>Danh sách file ({files.length})</Text>
            {files.map((file, index) => (
                <Alert key={index} color='blue' variant='light'>
                    <Group justify='space-between'>
                        <Group gap="sm">
                            {getFileIcon(file)}
                            <div>
                                <Text fw={500} size="sm">{file.name}</Text>
                                <Text size='xs' c='dimmed'>
                                    {formatFileSize(file.size)} • {getFileType(file)}
                                </Text>
                            </div>
                        </Group>
                        <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => onRemove(index)}
                        >
                            <IconTrash size="1rem" />
                        </ActionIcon>
                    </Group>
                </Alert>
            ))}
        </Stack>
    )
}

export default SelectedFilesList