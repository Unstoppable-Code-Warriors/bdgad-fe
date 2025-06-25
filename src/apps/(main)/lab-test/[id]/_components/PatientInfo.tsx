import { Paper, Stack, Group, Title, Text, Grid, Divider } from '@mantine/core'
import {
    IconUser,
    IconStethoscope,
    IconPhone,
    IconMapPin,
    IconId,
    IconCreditCard,
    IconCalendar
} from '@tabler/icons-react'

interface PatientInfoProps {
    patient: {
        fullName: string
        personalId: string
        healthInsuranceCode: string
        dateOfBirth: string
        phone: string
        address: string
    }
    doctor: {
        name: string
        email: string
    }
}

export const PatientInfo = ({ patient, doctor }: PatientInfoProps) => {
    return (
        <Paper p='lg' withBorder radius='md' shadow='sm'>
            <Stack gap='md'>
                <Group gap='sm'>
                    <IconUser size={20} color='var(--mantine-color-green-6)' />
                    <Title order={3} c='green.7'>
                        Thông tin bệnh nhân
                    </Title>
                </Group>

                {/* Patient Details */}
                <Stack gap='md'>
                    <Text size='xl' fw={700} c='green.8'>
                        {patient.fullName}
                    </Text>

                    <Grid>
                        <Grid.Col span={6}>
                            <Group gap='xs'>
                                <IconId size={16} color='var(--mantine-color-blue-6)' />
                                <Text size='sm' c='dimmed'>
                                    Số CCCD:
                                </Text>
                            </Group>
                            <Text fw={500} ff='monospace'>
                                {patient.personalId}
                            </Text>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Group gap='xs'>
                                <IconCreditCard size={16} color='var(--mantine-color-green-6)' />
                                <Text size='sm' c='dimmed'>
                                    Mã BHYT:
                                </Text>
                            </Group>
                            <Text fw={500} ff='monospace'>
                                {patient.healthInsuranceCode}
                            </Text>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Group gap='xs'>
                                <IconCalendar size={16} color='var(--mantine-color-pink-6)' />
                                <Text size='sm' c='dimmed'>
                                    Ngày sinh:
                                </Text>
                            </Group>
                            <Text fw={500}>{new Date(patient.dateOfBirth).toLocaleDateString('vi-VN')}</Text>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Group gap='xs'>
                                <IconPhone size={16} color='var(--mantine-color-teal-6)' />
                                <Text size='sm' c='dimmed'>
                                    Điện thoại:
                                </Text>
                            </Group>
                            <Text fw={500}>{patient.phone}</Text>
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Group gap='xs' align='flex-start'>
                                <IconMapPin size={16} color='var(--mantine-color-red-6)' />
                                <Text size='sm' c='dimmed'>
                                    Địa chỉ:
                                </Text>
                            </Group>
                            <Text fw={500}>{patient.address}</Text>
                        </Grid.Col>
                    </Grid>
                </Stack>

                <Divider />

                {/* Doctor Information */}
                <Stack gap='md'>
                    <Group gap='sm'>
                        <IconStethoscope size={18} />
                        <Text fw={600} c='purple.7' size='lg'>
                            Bác sĩ chỉ định
                        </Text>
                    </Group>

                    <Grid>
                        <Grid.Col span={6}>
                            <Text size='sm' c='dimmed'>
                                Tên bác sĩ:
                            </Text>
                            <Text fw={600} c='purple.8'>
                                {doctor.name}
                            </Text>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Text size='sm' c='dimmed'>
                                Email:
                            </Text>
                            <Text fw={500}>{doctor.email}</Text>
                        </Grid.Col>
                    </Grid>
                </Stack>
            </Stack>
        </Paper>
    )
}
