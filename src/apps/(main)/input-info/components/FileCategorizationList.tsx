import { Card, Group, Text, Badge, Select, Stack, ActionIcon, Alert } from '@mantine/core'
import { IconFile, IconTrash } from '@tabler/icons-react'
import type { FileWithPath } from '@mantine/dropzone'
import { FileCategory, FILE_CATEGORY_OPTIONS, type FileCategoryDto } from '@/types/categorized-upload'

interface FileCategoryCardProps {
    file: FileWithPath
    category?: FileCategory
    index: number
    isValid: boolean
    validationMessage?: string
    onCategoryChange: (index: number, category: FileCategory) => void
    onRemove: (index: number) => void
}

export const FileCategoryCard = ({
    file,
    category,
    index,
    isValid,
    validationMessage,
    onCategoryChange,
    onRemove
}: FileCategoryCardProps) => {
    const selectedOption = category ? FILE_CATEGORY_OPTIONS.find((opt) => opt.value === category) : undefined

    return (
        <Card withBorder p='md' style={{ borderColor: isValid ? undefined : 'red' }}>
            <Stack gap='sm'>
                <Group justify='space-between'>
                    <Group gap='sm'>
                        <IconFile size={20} />
                        <Text size='sm' fw={500} style={{ wordBreak: 'break-word' }}>
                            {file.name}
                        </Text>
                        <Badge size='xs' variant='light'>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                    </Group>
                    <ActionIcon variant='light' color='red' onClick={() => onRemove(index)} title='Xóa file'>
                        <IconTrash size={16} />
                    </ActionIcon>
                </Group>

                <Group grow>
                    <Select
                        label='Loại file'
                        placeholder='Chọn loại file'
                        value={category || ''}
                        onChange={(value) => onCategoryChange(index, value as FileCategory)}
                        data={FILE_CATEGORY_OPTIONS.map((option) => ({
                            value: option.value,
                            label: option.label
                        }))}
                        size='sm'
                        required
                        error={!isValid && !category ? 'Vui lòng chọn loại file' : undefined}
                    />
                </Group>

                {selectedOption && (
                    <Group gap='xs'>
                        {/* <Badge size='sm' color={selectedOption.color}>
                            {selectedOption.label}
                        </Badge> */}
                        {selectedOption.isSpecial && (
                            <Badge size='sm' variant='light' color='blue'>
                                Xử lý OCR đặc biệt
                            </Badge>
                        )}
                        {/* <Tooltip label={selectedOption.description}>
                            <ActionIcon variant='transparent' size='sm'>
                                <IconInfoCircle size={14} />
                            </ActionIcon>
                        </Tooltip> */}
                    </Group>
                )}

                {!isValid && validationMessage && (
                    <Alert variant='light' color='red' p='xs'>
                        <Text size='xs'>{validationMessage}</Text>
                    </Alert>
                )}
            </Stack>
        </Card>
    )
}

interface FileCategorizationListProps {
    files: FileWithPath[]
    fileCategories: FileCategoryDto[]
    validationErrors: { [index: number]: string }
    onCategoryChange: (index: number, category: FileCategory) => void
    onRemove: (index: number) => void
}

export const FileCategorizationList = ({
    files,
    fileCategories,
    validationErrors,
    onCategoryChange,
    onRemove
}: FileCategorizationListProps) => {
    if (files.length === 0) {
        return null
    }

    return (
        <Stack gap='md'>
            <Group justify='space-between'>
                <Text fw={600} size='lg'>
                    Phân loại file ({files.length})
                </Text>
            </Group>

            {files.map((file, index) => (
                <FileCategoryCard
                    key={`${file.name}-${index}`}
                    file={file}
                    category={fileCategories[index]?.category}
                    index={index}
                    isValid={!validationErrors[index]}
                    validationMessage={validationErrors[index]}
                    onCategoryChange={onCategoryChange}
                    onRemove={onRemove}
                />
            ))}
        </Stack>
    )
}
