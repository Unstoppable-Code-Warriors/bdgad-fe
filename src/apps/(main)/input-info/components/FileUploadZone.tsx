import { Dropzone } from '@mantine/dropzone'
import type { FileWithPath, FileRejection } from '@mantine/dropzone'
import { Stack, Text, Group, rem, Card } from '@mantine/core'
import { IconUpload, IconX, IconFile, IconAlertCircle } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'

interface FileUploadZoneProps {
    onDrop: (files: FileWithPath[]) => void
    onReject?: (files: FileRejection[]) => void
}

const FileUploadZone = ({ onDrop, onReject }: FileUploadZoneProps) => {
    const [, setError] = useState<string | null>(null)

    const handleFileDrop = (files: FileWithPath[]) => {
        setError(null)
        onDrop(files)
    }

    const handleFileReject = (rejectedFiles: FileRejection[]) => {
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

        setError(errorMessage)

        notifications.show({
            title: 'Lỗi tải file',
            message: errorMessage,
            color: 'red',
            icon: <IconAlertCircle size='1rem' />,
            autoClose: 5000
        })

        if (onReject) {
            onReject(rejectedFiles)
        }
    }

    return (
        <Card withBorder padding='md' radius='md'>
            <Stack gap='sm'>
                <Text size='lg' fw={600} c='blue.7'>
                    Tải tập tin
                </Text>

                <Dropzone
                    onDrop={handleFileDrop}
                    onReject={handleFileReject}
                    maxSize={10 * 1024 ** 2}
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
                    multiple={true}
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
                                Kéo và thả tập tin vào đây hoặc
                                <Text component='span' c='blue' fw={500} inline>
                                    {' '}
                                    nhấp để chọn tập tin
                                </Text>
                            </Text>
                            <Text size='sm' c='dimmed' inline mt={7}>
                                Chỉ hỗ trợ tập tin hình ảnh (.jpg, .png, .gif), PDF, Word (.doc, .docx) và Excel (.xls,
                                .xlsx). Kích thước tối đa là 10MB.
                            </Text>
                        </div>
                    </Group>
                </Dropzone>
            </Stack>
        </Card>
    )
}

export default FileUploadZone
