import { Card, Text, Group, Divider, Stack, ThemeIcon, Box, Grid } from '@mantine/core'
import { IconFlask, IconBarcode, IconCalendar } from '@tabler/icons-react'
import type { FastqFilePair } from '@/types/fastq'

interface LabTestInfoProps {
    data: {
        labcode: string
        barcode: string
        requestDate: string
        createdAt: string
    }
    latestFastqFilePair?: FastqFilePair | null
}

export const LabTestInfo = ({ data, latestFastqFilePair }: LabTestInfoProps) => {
    return (
        <Card shadow='sm' padding='xl' radius='lg' withBorder>
            <Group gap='sm' mb='xl'>
                <ThemeIcon size='lg' radius='md' variant='light' color='blue'>
                    <IconFlask size={20} />
                </ThemeIcon>
                <Box>
                    <Text fw={700} size='xl'>
                        Thông tin xét nghiệm
                    </Text>
                    <Text size='sm' c='dimmed'>
                        Chi tiết về mẫu xét nghiệm và trạng thái
                    </Text>
                </Box>
            </Group>

            <Grid gutter='lg'>
                {/* Basic Information */}
                <Grid.Col span={6}>
                    <Card p='lg' radius='md' bg='gray.0' withBorder>
                        <Stack gap='md'>
                            <Group gap='xs'>
                                <IconBarcode size={16} color='var(--mantine-color-blue-6)' />
                                <Text size='sm' fw={600} c='blue'>
                                    Mã xét nghiệm
                                </Text>
                            </Group>

                            <Stack gap='sm'>
                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Labcode:
                                    </Text>
                                    <Text fw={600} size='sm' ff='monospace'>
                                        {data.labcode.length > 1
                                            ? Array.from(data.labcode).join(', ')
                                            : data.labcode[0]}
                                    </Text>
                                </Group>

                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Barcode:
                                    </Text>
                                    <Text fw={600} size='sm' ff='monospace'>
                                        {data.barcode}
                                    </Text>
                                </Group>
                            </Stack>
                        </Stack>
                    </Card>
                </Grid.Col>

                {/* Date Information */}
                <Grid.Col span={6}>
                    <Card p='lg' radius='md' bg='gray.0' withBorder>
                        <Stack gap='md'>
                            <Group gap='xs'>
                                <IconCalendar size={16} color='var(--mantine-color-green-6)' />
                                <Text size='sm' fw={600} c='green'>
                                    Thời gian
                                </Text>
                            </Group>

                            <Stack gap='sm'>
                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Ngày chỉ định:
                                    </Text>
                                    <Text fw={600} size='sm'>
                                        {new Date(data.requestDate).toLocaleDateString('vi-VN')}
                                    </Text>
                                </Group>

                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Ngày tạo:
                                    </Text>
                                    <Text fw={600} size='sm'>
                                        {new Date(data.createdAt).toLocaleDateString('vi-VN')}
                                    </Text>
                                </Group>
                            </Stack>
                        </Stack>
                    </Card>
                </Grid.Col>
            </Grid>

            {/* Additional Information */}
            {latestFastqFilePair?.redoReason && (
                <>
                    <Divider my='xl' />
                    <Card p='lg' radius='md' bg='red.0' withBorder>
                        <Stack gap='xs'>
                            <Text size='sm' fw={600} c='red'>
                                Lý do từ chối:
                            </Text>
                            <Text size='sm' c='red.7'>
                                {latestFastqFilePair.redoReason}
                            </Text>
                            {latestFastqFilePair.rejector && (
                                <Text size='xs' c='red.6' mt='xs'>
                                    Từ chối bởi: {latestFastqFilePair.rejector.name}
                                </Text>
                            )}
                        </Stack>
                    </Card>
                </>
            )}
        </Card>
    )
}
