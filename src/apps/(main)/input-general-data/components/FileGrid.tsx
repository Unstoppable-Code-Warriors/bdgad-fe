import { Grid, Paper, Text } from '@mantine/core'
import { IconFile } from '@tabler/icons-react'
import FileCard from './FileCard'

interface FileGridProps {
    files: Array<{
        id: string
        fileName: string
        fileType: string
        filePath: string 
        fileSize: string
        uploadedAt: string
        uploader?: any
    }>
    onDownloadFile: (fileId: string) => void
    onDeleteFile: (fileId: string) => void
    loading?: boolean
}

const FileGrid = ({ files, onDownloadFile, onDeleteFile, loading }: FileGridProps) => {
    if (files.length === 0) {
        return (
            <Paper p="xl" ta="center" withBorder>
                <IconFile size={48} color="gray" />
                <Text size="sm" c="dimmed" mt="md">
                    {loading ? 'Đang tải...' : 'Chưa có file nào'}
                </Text>
            </Paper>
        )
    }

    return (
        <Grid>
            {files.map((file) => (
                <Grid.Col key={file.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                    <FileCard
                        file={{
                            id: file.id,
                            fileName: file.fileName,
                            filePath: file.filePath, 
                            fileType: file.fileType,
                            fileSize: file.fileSize,
                            uploadedAt: file.uploadedAt,
                            uploader: file.uploader || null
                        }}
                        onDownload={onDownloadFile}
                        onDelete={onDeleteFile}
                    />
                </Grid.Col>
            ))}
        </Grid>
    )
}

export default FileGrid