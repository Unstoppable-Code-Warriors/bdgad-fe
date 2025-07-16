import { Grid, Paper, Text, Stack, ThemeIcon, Box } from '@mantine/core'
import { IconUpload, IconFileX } from '@tabler/icons-react'
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
            <Paper 
                p="xl" 
                ta="center" 
                withBorder 
                radius="lg"
                style={{
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    border: '2px dashed #dee2e6',
                    minHeight: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Stack align="center" gap="lg">
                    <ThemeIcon
                        size={80}
                        radius="xl"
                        variant="light"
                        color={loading ? "blue" : "gray"}
                        style={{
                            background: loading ? 'linear-gradient(45deg, #228be6, #339af0)' : 'linear-gradient(45deg, #868e96, #adb5bd)',
                            color: 'white'
                        }}
                    >
                        {loading ? (
                            <IconUpload size={40} />
                        ) : (
                            <IconFileX size={40} />
                        )}
                    </ThemeIcon>
                    
                    <Box ta="center">
                        <Text size="lg" fw={600} c="dark" mb="xs">
                            {loading ? 'Đang tải dữ liệu...' : 'Chưa có file nào'}
                        </Text>
                        <Text size="sm" c="dimmed" maw={400} mx="auto">
                            {loading 
                                ? 'Hệ thống đang tải danh sách file, vui lòng đợi trong giây lát.'
                                : 'Hiện tại chưa có file nào được tải lên.'
                            }
                        </Text>
                    </Box>
                </Stack>
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