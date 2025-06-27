import { Group, Button, Title, Text, Card, ThemeIcon, Box, Breadcrumbs, Anchor } from '@mantine/core'
import { IconArrowLeft, IconFlask, IconHome } from '@tabler/icons-react'

interface PageHeaderProps {
    onBack: () => void
    title: string
    pageType: 'lab-test' | 'analysis'
    labcode?: string
    barcode?: string
}

export const PageHeader = ({ onBack, title, pageType, labcode, barcode }: PageHeaderProps) => {
    const getBreadcrumbs = () => {
        if (pageType === 'lab-test') {
            return [
                { label: 'Trang chủ', href: '/', icon: <IconHome size={14} /> },
                { label: 'Xét nghiệm', href: '/lab-test' },
                { label: 'Chi tiết', href: '#', current: true }
            ]
        } else {
            return [
                { label: 'Trang chủ', href: '/', icon: <IconHome size={14} /> },
                { label: 'Phân tích', href: '/analysis' },
                { label: 'Chi tiết', href: '#', current: true }
            ]
        }
    }

    const breadcrumbs = getBreadcrumbs()

    return (
        <Card shadow='sm' radius='lg' p='xl' withBorder bg='blue.0'>
            <Group justify='space-between' align='center'>
                {/* Left side - Back button and title */}
                <Group gap='xl' align='center'>
                    <Button
                        variant='white'
                        leftSection={<IconArrowLeft size={18} />}
                        onClick={onBack}
                        size='md'
                        radius='lg'
                        style={{
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            border: '1px solid var(--mantine-color-gray-3)'
                        }}
                    >
                        Quay lại
                    </Button>

                    <Box>
                        {/* Breadcrumb */}
                        <Breadcrumbs mb='xs'>
                            {breadcrumbs.map((item, index) =>
                                item.current ? (
                                    <Text key={index} c='dimmed' size='sm'>
                                        {item.label}
                                    </Text>
                                ) : (
                                    <Anchor key={index} c='blue.6' size='sm' href={item.href}>
                                        <Group gap={4}>
                                            {item.icon}
                                            {item.label}
                                        </Group>
                                    </Anchor>
                                )
                            )}
                        </Breadcrumbs>

                        {/* Title and subtitle */}
                        <Title order={1} size='h2' c='blue.8' fw={700}>
                            {title}
                        </Title>
                        {(labcode || barcode) && (
                            <Text size='md' c='blue.6' fw={500} mt={4}>
                                {labcode && (
                                    <>
                                        Mã {pageType === 'lab-test' ? 'xét nghiệm' : 'phòng lab'}:{' '}
                                        <Text span fw={600} c='blue.7'>
                                            {labcode}
                                        </Text>
                                    </>
                                )}
                                {labcode && barcode && ' • '}
                                {barcode && (
                                    <>
                                        Mã vạch:{' '}
                                        <Text span fw={600} c='blue.7'>
                                            {barcode}
                                        </Text>
                                    </>
                                )}
                            </Text>
                        )}
                    </Box>
                </Group>

                {/* Right side - Icon */}
                <ThemeIcon
                    size={80}
                    radius='xl'
                    variant='gradient'
                    gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                    style={{
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    <IconFlask size={40} />
                </ThemeIcon>
            </Group>
        </Card>
    )
}
