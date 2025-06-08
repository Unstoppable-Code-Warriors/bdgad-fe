import { useState } from 'react'
import {
    Stack,
    Text,
    Button,
    Paper,
    Grid,
    TextInput,
    NumberInput,
    Select,
    Table,
    Group,
    Badge,
    Divider,
    ActionIcon,
    Title,
    Alert
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconEdit, IconCheck, IconRefresh, IconTrash, IconPlus, IconAlertTriangle } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import type { MedicalTestRequisitionUploadResponse, TestOrder } from '@/types'

interface ResultStepProps {
    data: MedicalTestRequisitionUploadResponse | null
    onReset: () => void
}

interface FormValues {
    hospital: string
    order_sheet: string
    clinic: string
    medical_record_id: string
    order_id: string
    full_name: string
    address: string
    gender: string
    age: number
    patient_type: string
    diagnosis: string
    exam_date: string
    ordering_doctor: string
    sample_time: string
    print_time: string
    technician: string
    test_orders: TestOrder[]
}

const ResultStep = ({ data, onReset }: ResultStepProps) => {
    const [editingTestIndex, setEditingTestIndex] = useState<number | null>(null)
    const [newTest, setNewTest] = useState({ test_name: '', price: '' })

    if (!data) {
        return (
            <Stack align='center' gap='lg' mt='xl'>
                <Text c='dimmed'>No data available</Text>
                <Button onClick={onReset} leftSection={<IconRefresh />}>
                    Start Over
                </Button>
            </Stack>
        )
    }

    // Check if OCR extraction was successful
    const ocrSuccess =
        data.ocrResult &&
        (data.ocrResult.full_name ||
            data.ocrResult.test_orders?.length > 0 ||
            data.ocrResult.diagnosis ||
            data.ocrResult.exam_date)

    // Create safe default values for form
    const safeOcrResult = {
        hospital: data.ocrResult?.hospital || '',
        order_sheet: data.ocrResult?.order_sheet || '',
        clinic: data.ocrResult?.clinic || '',
        medical_record_id: data.ocrResult?.medical_record_id || '',
        order_id: data.ocrResult?.order_id || '',
        full_name: data.ocrResult?.full_name || '',
        address: data.ocrResult?.address || '',
        gender: data.ocrResult?.gender || '',
        age: data.ocrResult?.age || 0,
        patient_type: data.ocrResult?.patient_type || '',
        diagnosis: data.ocrResult?.diagnosis || '',
        exam_date: data.ocrResult?.exam_date || '',
        ordering_doctor: data.ocrResult?.ordering_doctor || '',
        sample_time: data.ocrResult?.sample_time || '',
        print_time: data.ocrResult?.print_time || '',
        technician: data.ocrResult?.technician || '',
        test_orders: data.ocrResult?.test_orders || []
    }

    const form = useForm<FormValues>({
        initialValues: safeOcrResult,
        validate: {
            full_name: (value) => (!value ? 'Patient name is required' : null),
            medical_record_id: (value) => (!value ? 'Medical record ID is required' : null),
            order_id: (value) => (!value ? 'Order ID is required' : null),
            age: (value) => (value < 0 || value > 150 ? 'Please enter a valid age' : null)
        }
    })

    const handleSubmit = (values: FormValues) => {
        console.log('Form submitted:', values)
        notifications.show({
            title: 'Data saved successfully',
            message: 'Medical test requisition data has been processed and saved',
            color: 'green',
            icon: <IconCheck />
        })
    }

    const handleUpdateTest = (index: number, updatedTest: TestOrder) => {
        const currentTests = [...form.values.test_orders]
        currentTests[index] = updatedTest
        form.setFieldValue('test_orders', currentTests)
        setEditingTestIndex(null)
    }

    const handleDeleteTest = (index: number) => {
        const currentTests = form.values.test_orders.filter((_, i) => i !== index)
        form.setFieldValue('test_orders', currentTests)
    }

    const handleAddTest = () => {
        if (newTest.test_name && newTest.price) {
            const currentTests = [...form.values.test_orders, newTest]
            form.setFieldValue('test_orders', currentTests)
            setNewTest({ test_name: '', price: '' })
        }
    }

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap='xl' mt='xl'>
                {ocrSuccess ? (
                    <Alert color='green' variant='light'>
                        <Text fw={500}>OCR Processing Complete!</Text>
                        <Text size='sm'>
                            We've extracted the following information. Please review and edit as needed.
                        </Text>
                    </Alert>
                ) : (
                    <Alert color='orange' variant='light' icon={<IconAlertTriangle size='1rem' />}>
                        <Text fw={500}>OCR Processing Incomplete</Text>
                        <Text size='sm'>
                            We had difficulty extracting some information from the image. Please manually enter the
                            missing data below. This could be due to image quality, handwriting, or document format.
                        </Text>
                    </Alert>
                )}

                {/* File Information */}
                <Paper p='md' withBorder bg='gray.0'>
                    <Title order={4} mb='md'>
                        Uploaded File Information
                    </Title>
                    <Group gap='xl'>
                        <div>
                            <Text size='sm' c='dimmed'>
                                Original Name
                            </Text>
                            <Text fw={500}>{data.file.originalName}</Text>
                        </div>
                        <div>
                            <Text size='sm' c='dimmed'>
                                File Size
                            </Text>
                            <Text fw={500}>{Math.round(data.file.size / 1024)} KB</Text>
                        </div>
                        <div>
                            <Text size='sm' c='dimmed'>
                                Type
                            </Text>
                            <Text fw={500}>{data.file.mimetype}</Text>
                        </div>
                    </Group>
                </Paper>

                {/* Hospital & Document Information */}
                <Paper p='md' withBorder>
                    <Title order={4} mb='md'>
                        Hospital & Document Information
                    </Title>
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label='Hospital'
                                placeholder='Enter hospital name'
                                {...form.getInputProps('hospital')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label='Order Sheet'
                                placeholder='Enter order sheet type'
                                {...form.getInputProps('order_sheet')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label='Clinic'
                                placeholder='Enter clinic information'
                                {...form.getInputProps('clinic')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label='Order ID'
                                placeholder='Enter order ID'
                                {...form.getInputProps('order_id')}
                            />
                        </Grid.Col>
                    </Grid>
                </Paper>

                {/* Patient Information */}
                <Paper p='md' withBorder>
                    <Title order={4} mb='md'>
                        Patient Information
                    </Title>
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label='Full Name'
                                placeholder='Enter patient full name'
                                required
                                {...form.getInputProps('full_name')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label='Medical Record ID'
                                placeholder='Enter medical record ID'
                                required
                                {...form.getInputProps('medical_record_id')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <NumberInput
                                label='Age'
                                placeholder='Enter age'
                                min={0}
                                max={150}
                                {...form.getInputProps('age')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <Select
                                label='Gender'
                                placeholder='Select gender'
                                data={['Nam', 'Nữ', 'Khác']}
                                {...form.getInputProps('gender')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <TextInput
                                label='Patient Type'
                                placeholder='Enter patient type'
                                {...form.getInputProps('patient_type')}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <TextInput
                                label='Address'
                                placeholder='Enter patient address'
                                {...form.getInputProps('address')}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <TextInput
                                label='Diagnosis'
                                placeholder='Enter diagnosis'
                                {...form.getInputProps('diagnosis')}
                            />
                        </Grid.Col>
                    </Grid>
                </Paper>

                {/* Medical Information */}
                <Paper p='md' withBorder>
                    <Title order={4} mb='md'>
                        Medical Information
                    </Title>
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <TextInput
                                label='Exam Date'
                                placeholder='DD/MM/YYYY'
                                {...form.getInputProps('exam_date')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <TextInput
                                label='Sample Time'
                                placeholder='Enter sample time'
                                {...form.getInputProps('sample_time')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <TextInput
                                label='Print Time'
                                placeholder='DD/MM/YYYY HH:mm'
                                {...form.getInputProps('print_time')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label='Ordering Doctor'
                                placeholder='Enter doctor name'
                                {...form.getInputProps('ordering_doctor')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label='Technician'
                                placeholder='Enter technician name'
                                {...form.getInputProps('technician')}
                            />
                        </Grid.Col>
                    </Grid>
                </Paper>

                {/* Test Orders */}
                <Paper p='md' withBorder>
                    <Group justify='space-between' mb='md'>
                        <Title order={4}>Test Orders ({form.values.test_orders.length})</Title>
                        {form.values.test_orders.length > 0 ? (
                            <Badge color='blue' variant='light'>
                                Total:{' '}
                                {form.values.test_orders
                                    .reduce(
                                        (sum, test) => sum + parseFloat(test.price.replace(/[^\d.-]/g, '') || '0'),
                                        0
                                    )
                                    .toLocaleString()}{' '}
                                VND
                            </Badge>
                        ) : (
                            <Badge color='orange' variant='light'>
                                No tests found - Please add manually
                            </Badge>
                        )}
                    </Group>

                    {form.values.test_orders.length === 0 && (
                        <Alert color='yellow' variant='light' mb='md'>
                            <Text size='sm'>
                                No test orders were detected in the OCR process. Please manually add the required tests
                                below.
                            </Text>
                        </Alert>
                    )}

                    <Table highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Test Name</Table.Th>
                                <Table.Th>Price (VND)</Table.Th>
                                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {form.values.test_orders.map((test, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td>
                                        {editingTestIndex === index ? (
                                            <TextInput
                                                value={test.test_name}
                                                onChange={(e) =>
                                                    handleUpdateTest(index, { ...test, test_name: e.target.value })
                                                }
                                                size='sm'
                                            />
                                        ) : (
                                            test.test_name
                                        )}
                                    </Table.Td>
                                    <Table.Td>
                                        {editingTestIndex === index ? (
                                            <TextInput
                                                value={test.price}
                                                onChange={(e) =>
                                                    handleUpdateTest(index, { ...test, price: e.target.value })
                                                }
                                                size='sm'
                                            />
                                        ) : (
                                            test.price
                                        )}
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap='xs'>
                                            <ActionIcon
                                                variant='subtle'
                                                color='blue'
                                                onClick={() =>
                                                    setEditingTestIndex(editingTestIndex === index ? null : index)
                                                }
                                            >
                                                <IconEdit size='1rem' />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant='subtle'
                                                color='red'
                                                onClick={() => handleDeleteTest(index)}
                                            >
                                                <IconTrash size='1rem' />
                                            </ActionIcon>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                            <Table.Tr>
                                <Table.Td>
                                    <TextInput
                                        placeholder='Add new test name'
                                        value={newTest.test_name}
                                        onChange={(e) => setNewTest({ ...newTest, test_name: e.target.value })}
                                        size='sm'
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <TextInput
                                        placeholder='Add price (VND)'
                                        value={newTest.price}
                                        onChange={(e) => setNewTest({ ...newTest, price: e.target.value })}
                                        size='sm'
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <ActionIcon
                                        variant='subtle'
                                        color='green'
                                        onClick={handleAddTest}
                                        disabled={!newTest.test_name || !newTest.price}
                                    >
                                        <IconPlus size='1rem' />
                                    </ActionIcon>
                                </Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </Paper>

                <Divider />

                {/* Action Buttons */}
                <Group justify='space-between'>
                    <Button variant='outline' onClick={onReset} leftSection={<IconRefresh />}>
                        Start Over
                    </Button>
                    <Button type='submit' leftSection={<IconCheck />} size='lg'>
                        Save & Submit
                    </Button>
                </Group>
            </Stack>
        </form>
    )
}

export default ResultStep
