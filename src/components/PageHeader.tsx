import { Group, Button, Title, Text, Card, ThemeIcon, Box, Breadcrumbs, Anchor } from '@mantine/core'
import { IconArrowLeft, IconFlask, IconHome, IconShieldCheck } from '@tabler/icons-react'

interface PageHeaderProps {
    onBack: () => void
    title: string
    pageType: 'lab-test' | 'analysis' | 'validation'
    labcode?: string[]
    barcode?: string
}

export const PageHeader = ({ onBack, title, pageType, labcode, barcode }: PageHeaderProps) => {
    const formatLabcode = (labcode?: string[]) => {
        if (!labcode || labcode.length === 0) return null
        return labcode.join(', ')
    }

    const getBreadcrumbs = () => {
        if (pageType === 'lab-test') {
            return [
                { label: 'Trang chủ', href: '/', icon: <IconHome size={14} /> },
                { label: 'Xét nghiệm', href: '/lab-test' },
                { label: 'Chi tiết', href: '#', current: true }
            ]
        } else if (pageType === 'analysis') {
            return [
                { label: 'Trang chủ', href: '/', icon: <IconHome size={14} /> },
                { label: 'Phân tích', href: '/analysis' },
                { label: 'Chi tiết', href: '#', current: true }
            ]
        } else {
            return [
                { label: 'Trang chủ', href: '/', icon: <IconHome size={14} /> },
                { label: 'Thẩm định', href: '/validation' },
                { label: 'Chi tiết', href: '#', current: true }
            ]
        }
    }

    const getIcon = () => {
        if (pageType === 'validation') {
            return <IconShieldCheck size={40} />
        }
        return <IconFlask size={40} />
    }

    const getGradient = () => {
        if (pageType === 'validation') {
            return { from: 'teal', to: 'green', deg: 45 }
        }
        return { from: 'blue', to: 'cyan', deg: 45 }
    }

    const breadcrumbs = getBreadcrumbs()

    return (
        <Card shadow='sm' radius='lg' p='xl' withBorder bg={pageType === 'validation' ? 'teal.0' : 'blue.0'}>
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
                                    <Anchor
                                        key={index}
                                        c={`${pageType === 'validation' ? 'teal' : 'blue'}.6`}
                                        size='sm'
                                        href={item.href}
                                    >
                                        <Group gap={4}>
                                            {item.icon}
                                            {item.label}
                                        </Group>
                                    </Anchor>
                                )
                            )}
                        </Breadcrumbs>

                        {/* Title and subtitle */}
                        <Title order={1} size='h2' c={`${pageType === 'validation' ? 'teal' : 'blue'}.8`} fw={700}>
                            {title}
                        </Title>
                        {(labcode || barcode) && (
                            <Text size='md' c={`${pageType === 'validation' ? 'teal' : 'blue'}.6`} fw={500} mt={4}>
                                {labcode && labcode.length > 0 && (
                                    <>
                                        Labcode:{' '}
                                        <Text span fw={600} c={`${pageType === 'validation' ? 'teal' : 'blue'}.7`}>
                                            {formatLabcode(labcode)}
                                        </Text>
                                    </>
                                )}
                                {labcode && labcode.length > 0 && barcode && ' • '}
                                {barcode && (
                                    <>
                                        Barcode:{' '}
                                        <Text span fw={600} c={`${pageType === 'validation' ? 'teal' : 'blue'}.7`}>
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
                    gradient={getGradient()}
                    style={{
                        boxShadow: `0 4px 12px rgba(${pageType === 'validation' ? '20, 184, 166' : '59, 130, 246'}, 0.3)`
                    }}
                >
                    {getIcon()}
                </ThemeIcon>
            </Group>
        </Card>
    )
}
