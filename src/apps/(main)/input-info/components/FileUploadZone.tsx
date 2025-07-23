import { Dropzone } from '@mantine/dropzone'
import type { FileWithPath } from '@mantine/dropzone'
import { Stack, Text, Group, rem, Card } from '@mantine/core'
import { IconUpload, IconX, IconFile } from '@tabler/icons-react'

interface FileUploadZoneProps {
    onDrop: (files: FileWithPath[]) => void
    onReject?: (files: any[]) => void
}

const FileUploadZone = ({ onDrop, onReject }: FileUploadZoneProps) => {
    return (
        <Card withBorder padding='md' radius='md'>
            <Stack gap='sm'>
                <Text size='lg' fw={600} c='blue.7'>
                    Tải tập tin
                </Text>

                <Dropzone
                    onDrop={onDrop}
                    onReject={onReject || ((files) => console.log('rejected files', files))}
                    maxSize={10 * 1024 ** 2}
                    accept={[
                        'image/jpeg',
                        'image/png',
                        'image/jpg',
                        'image/gif',
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    ]}
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
                                Chỉ hỗ trợ tập tin hình ảnh, PDF, Word và Excel. Kích thước tối đa là 10MB.
                            </Text>
                        </div>
                    </Group>
                </Dropzone>
            </Stack>
        </Card>
    )
}

export default FileUploadZone
