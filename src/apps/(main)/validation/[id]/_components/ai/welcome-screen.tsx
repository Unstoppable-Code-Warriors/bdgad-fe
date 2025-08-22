import { Stack, Text, Group, ThemeIcon } from '@mantine/core'
import { IconMessageCircle, IconSparkles } from '@tabler/icons-react'

const WelcomeScreen = () => {
    return (
        <Stack align='center' justify='center' className='h-full py-8'>
            <Stack align='center' gap='lg' className='max-w-md w-full'>
                <ThemeIcon size={60} radius='xl' variant='light' color='blue'>
                    <IconMessageCircle size={30} />
                </ThemeIcon>

                <Stack align='center' gap='xs'>
                    <Text size='xl' fw={600} ta='center'>
                        Xin chào! 👋
                    </Text>
                    <Text size='md' c='dimmed' ta='center'>
                        Tôi có thể giúp gì được cho bạn?
                    </Text>
                </Stack>

                <Group gap='xs' justify='center'>
                    <IconSparkles size={16} style={{ color: 'var(--mantine-color-blue-6)' }} />
                    <Text size='sm' c='blue' fw={500}>
                        AI Assistant sẵn sàng hỗ trợ
                    </Text>
                </Group>

                <Stack gap='xs' className='w-full'>
                    <Text size='sm' fw={500} c='gray.7'>
                        Bạn có thể hỏi tôi về:
                    </Text>
                    <Stack gap={4}>
                        <Text size='sm' c='dimmed'>
                            • Phân tích dữ liệu kết quả gen
                        </Text>
                        <Text size='sm' c='dimmed'>
                            • Giải thích kết quả kiểm tra
                        </Text>
                        <Text size='sm' c='dimmed'>
                            • Các câu hỏi khác
                        </Text>
                    </Stack>
                </Stack>
            </Stack>
        </Stack>
    )
}

export default WelcomeScreen
