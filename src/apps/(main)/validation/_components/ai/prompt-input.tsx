import { ActionIcon, Group, Paper, Stack, Textarea } from '@mantine/core'
import { IconSend } from '@tabler/icons-react'

const PromptInput = () => {
    return (
        <div className='p-4'>
            <Paper shadow='sm' withBorder p='md' radius='lg'>
                <Stack gap={0}>
                    <Textarea
                        placeholder='Nhập câu hỏi...'
                        autosize
                        minRows={1}
                        maxRows={10}
                        maxLength={2000}
                        styles={{
                            input: {
                                padding: 0,
                                border: 'none'
                            }
                        }}
                    />
                    <Group justify='flex-end'>
                        <ActionIcon size='lg' radius='xl'>
                            <IconSend size={16} />
                        </ActionIcon>
                    </Group>
                </Stack>
            </Paper>
        </div>
    )
}

export default PromptInput
