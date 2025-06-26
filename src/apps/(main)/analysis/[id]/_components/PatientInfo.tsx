import { Card, Text, Group, Stack, Divider } from '@mantine/core'
import type { Patient } from '@/types/patient'
import type { User } from '@/types/user'

interface PatientInfoProps {
    patient: Patient
    doctor: User
}

export const PatientInfo = ({ patient, doctor }: PatientInfoProps) => {
    return (
        <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Text fw={600} size='lg' mb='md'>
                Thông tin bệnh nhân
            </Text>

            <Stack gap='sm'>
                <Group justify='space-between'>
                    <Text size='sm' c='dimmed'>
                        Họ tên:
                    </Text>
                    <Text fw={500}>{patient.fullName}</Text>
                </Group>

                <Group justify='space-between'>
                    <Text size='sm' c='dimmed'>
                        CCCD/CMND:
                    </Text>
                    <Text fw={500}>{patient.personalId}</Text>
                </Group>

                <Group justify='space-between'>
                    <Text size='sm' c='dimmed'>
                        Ngày sinh:
                    </Text>
                    <Text fw={500}>{new Date(patient.dateOfBirth).toLocaleDateString('vi-VN')}</Text>
                </Group>

                <Group justify='space-between'>
                    <Text size='sm' c='dimmed'>
                        Số điện thoại:
                    </Text>
                    <Text fw={500}>{patient.phone || '-'}</Text>
                </Group>

                <Group justify='space-between'>
                    <Text size='sm' c='dimmed'>
                        Địa chỉ:
                    </Text>
                    <Text fw={500}>{patient.address || '-'}</Text>
                </Group>

                <Group justify='space-between'>
                    <Text size='sm' c='dimmed'>
                        Mã BHYT:
                    </Text>
                    <Text fw={500}>{patient.healthInsuranceCode || '-'}</Text>
                </Group>

                <Divider my='xs' />

                <Text fw={600} size='md' mb='sm'>
                    Bác sĩ phụ trách
                </Text>

                <Group justify='space-between'>
                    <Text size='sm' c='dimmed'>
                        Tên bác sĩ:
                    </Text>
                    <Text fw={500}>{doctor.name}</Text>
                </Group>

                <Group justify='space-between'>
                    <Text size='sm' c='dimmed'>
                        Email:
                    </Text>
                    <Text fw={500}>{doctor.email}</Text>
                </Group>
            </Stack>
        </Card>
    )
}
