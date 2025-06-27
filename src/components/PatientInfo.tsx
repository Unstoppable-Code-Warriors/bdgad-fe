import { Card, Text, Group, Stack, ThemeIcon, Box, Grid, Paper, Avatar } from '@mantine/core'
import { IconUser, IconId, IconPhone, IconMapPin, IconStethoscope, IconMail } from '@tabler/icons-react'

interface PatientData {
    fullName: string
    personalId: string
    dateOfBirth: string
    phone: string
    address: string
    healthInsuranceCode?: string
}

interface DoctorData {
    name: string
    email: string
}

interface PatientInfoProps {
    patient: PatientData
    doctor?: DoctorData
    doctorTitle?: string
}

export const PatientInfo = ({ patient, doctor, doctorTitle = 'Bác sĩ phụ trách' }: PatientInfoProps) => {
    const calculateAge = (dateOfBirth: string) => {
        const today = new Date()
        const birthDate = new Date(dateOfBirth)
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1
        }
        return age
    }

    return (
        <Card shadow='sm' padding='xl' radius='lg' withBorder>
            <Group gap='sm' mb='xl'>
                <ThemeIcon size='lg' radius='md' variant='light' color='green'>
                    <IconUser size={20} />
                </ThemeIcon>
                <Box>
                    <Text fw={700} size='xl'>
                        Thông tin bệnh nhân
                    </Text>
                    <Text size='sm' c='dimmed'>
                        {doctor ? 'Chi tiết về bệnh nhân và bác sĩ phụ trách' : 'Chi tiết về bệnh nhân'}
                    </Text>
                </Box>
            </Group>

            {/* Patient Information */}
            <Paper p='lg' radius='md' bg='green.0' withBorder mb='xl'>
                <Stack gap='lg'>
                    <Group gap='sm'>
                        <Avatar size='lg' radius='md' color='green' variant='light'>
                            <IconUser size={24} />
                        </Avatar>
                        <Box>
                            <Text fw={700} size='lg'>
                                {patient.fullName}
                            </Text>
                            <Text size='sm' c='dimmed'>
                                {calculateAge(patient.dateOfBirth)} tuổi • ID: {patient.personalId}
                            </Text>
                        </Box>
                    </Group>

                    <Grid gutter='md'>
                        <Grid.Col span={6}>
                            <Group gap='xs' mb='xs'>
                                <IconId size={16} color='var(--mantine-color-blue-6)' />
                                <Text size='sm' fw={500} c='blue'>
                                    Thông tin cá nhân
                                </Text>
                            </Group>
                            <Stack gap='sm'>
                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        CCCD/CMND:
                                    </Text>
                                    <Text fw={600} size='sm' ff='monospace'>
                                        {patient.personalId}
                                    </Text>
                                </Group>
                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Ngày sinh:
                                    </Text>
                                    <Text fw={600} size='sm'>
                                        {new Date(patient.dateOfBirth).toLocaleDateString('vi-VN')}
                                    </Text>
                                </Group>
                            </Stack>
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <Group gap='xs' mb='xs'>
                                <IconPhone size={16} color='var(--mantine-color-orange-6)' />
                                <Text size='sm' fw={500} c='orange'>
                                    Thông tin liên hệ
                                </Text>
                            </Group>
                            <Stack gap='sm'>
                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Số điện thoại:
                                    </Text>
                                    <Text fw={600} size='sm'>
                                        {patient.phone || 'Chưa cập nhật'}
                                    </Text>
                                </Group>
                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Mã BHYT:
                                    </Text>
                                    <Text fw={600} size='sm' ff='monospace'>
                                        {patient.healthInsuranceCode || 'Không có'}
                                    </Text>
                                </Group>
                            </Stack>
                        </Grid.Col>
                    </Grid>

                    {patient.address && (
                        <Paper p='md' radius='md' bg='white' withBorder>
                            <Group gap='xs' mb='xs'>
                                <IconMapPin size={16} color='var(--mantine-color-teal-6)' />
                                <Text size='sm' fw={500} c='teal'>
                                    Địa chỉ
                                </Text>
                            </Group>
                            <Text size='sm'>{patient.address}</Text>
                        </Paper>
                    )}
                </Stack>
            </Paper>

            {/* Doctor Information */}
            {doctor && (
                <Paper p='lg' radius='md' bg='blue.0' withBorder>
                    <Stack gap='lg'>
                        <Group gap='xs'>
                            <IconStethoscope size={18} color='var(--mantine-color-blue-6)' />
                            <Text fw={700} size='lg' c='blue'>
                                {doctorTitle}
                            </Text>
                        </Group>

                        <Group gap='md'>
                            <Avatar size='lg' radius='md' color='blue' variant='light'>
                                <IconStethoscope size={24} />
                            </Avatar>
                            <Stack gap='xs' style={{ flex: 1 }}>
                                <Text fw={600} size='md'>
                                    {doctor.name}
                                </Text>
                                <Group gap='lg'>
                                    <Group gap='xs'>
                                        <IconMail size={14} color='var(--mantine-color-gray-6)' />
                                        <Text size='sm' c='dimmed'>
                                            {doctor.email}
                                        </Text>
                                    </Group>
                                </Group>
                            </Stack>
                        </Group>
                    </Stack>
                </Paper>
            )}
        </Card>
    )
}
