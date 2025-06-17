import { Grid, Paper, Text } from '@mantine/core'
import { IconFile } from '@tabler/icons-react'
import FileCard from './FileCard'

interface FileGridProps {
    files: Array<{
        id: string
        name: string
        type: string
        size: string
        uploadedAt: string
    }>
    onViewFile: (fileId: string) => void
    onDownloadFile: (fileId: string) => void
    onDeleteFile: (fileId: string) => void
}

const FileGrid = ({ files, onViewFile, onDownloadFile, onDeleteFile }: FileGridProps) => {
    if (files.length === 0) {
        return (
            <Paper p="xl" ta="center" withBorder>
                <IconFile size={48} color="gray" />
                <Text size="sm" c="dimmed" mt="md">
                    Chưa có file nào
                </Text>
            </Paper>
        )
    }

    return (
        <Grid>
            {files.map((file) => (
                <Grid.Col key={file.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                    <FileCard
                        file={file}
                        onView={onViewFile}
                        onDownload={onDownloadFile}
                        onDelete={onDeleteFile}
                    />
                </Grid.Col>
            ))}
        </Grid>
    )
}

export default FileGrid