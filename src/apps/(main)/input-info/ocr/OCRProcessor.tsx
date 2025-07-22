import { useState, useEffect } from 'react'
import {
    Stack,
    Text,
    Paper,
    Group,
    Alert,
    Button,
    Progress,
    Grid,
    Image,
    Card,
    Title,
    TextInput,
    NumberInput,
    Select,
    Textarea
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { IconScan, IconArrowLeft, IconCheck, IconPhoto } from '@tabler/icons-react'
import type { FileWithPath } from '@mantine/dropzone'
import { staffService } from '@/services/function/staff'

interface OCRProcessorProps {
    selectedFile: FileWithPath
    onComplete: (data: any) => void
    onBack: () => void
}

interface TestOrder {
    test_name: string
    price: string
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
    exam_date: Date | null
    ordering_doctor: string
    sample_time: string
    print_time: Date | null
    technician: string
    test_orders: TestOrder[]
}

const OCRProcessor = ({ selectedFile, onComplete, onBack }: OCRProcessorProps) => {
    const [isProcessing, setIsProcessing] = useState(true)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [ocrResult, setOcrResult] = useState<any>(null)
    const [imageUrl, setImageUrl] = useState<string>('')

    const form = useForm<FormValues>({
        initialValues: {
            hospital: '',
            order_sheet: '',
            clinic: '',
            medical_record_id: '',
            order_id: '',
            full_name: '',
            address: '',
            gender: '',
            age: 0,
            patient_type: '',
            diagnosis: '',
            exam_date: null,
            ordering_doctor: '',
            sample_time: '',
            print_time: null,
            technician: '',
            test_orders: []
        },
        validate: {
            full_name: (value) => (!value ? 'Patient name is required' : null),
            medical_record_id: (value) => (!value ? 'Medical record ID is required' : null),
            order_id: (value) => (!value ? 'Order ID is required' : null),
            age: (value) => (value < 0 || value > 150 ? 'Please enter a valid age' : null)
        }
    })

    const handleOCR = async () => {
        setIsProcessing(true)
        setError(null)
        setProgress(0)

        const url = URL.createObjectURL(selectedFile)
        setImageUrl(url)

        try {
            setProgress(20)
            await new Promise((resolve) => setTimeout(resolve, 500))

            setProgress(50)
            await new Promise((resolve) => setTimeout(resolve, 500))            
            const result = await staffService.ocrFile(selectedFile)
            console.log('OCR Result:', result)

            setProgress(80)
            await new Promise((resolve) => setTimeout(resolve, 500))

            setOcrResult(result)

            // Populate form with OCR results
            // if (result?.ocrResult) {
            //     form.setValues({
            //         hospital: result.ocrResult.hospital || '',
            //         order_sheet: result.ocrResult.order_sheet || '',
            //         clinic: result.ocrResult.clinic || '',
            //         medical_record_id: result.ocrResult.medical_record_id || '',
            //         order_id: result.ocrResult.order_id || '',
            //         full_name: result.ocrResult.full_name || '',
            //         address: result.ocrResult.address || '',
            //         gender: result.ocrResult.gender || '',
            //         age: result.ocrResult.age || 0,
            //         patient_type: result.ocrResult.patient_type || '',
            //         diagnosis: result.ocrResult.diagnosis || '',
            //         exam_date: parseDate(result.ocrResult.exam_date),
            //         ordering_doctor: result.ocrResult.ordering_doctor || '',
            //         sample_time: result.ocrResult.sample_time || '',
            //         print_time: parseDate(result.ocrResult.print_time),
            //         technician: result.ocrResult.technician || '',
            //         test_orders: result.ocrResult.test_orders || []
            //     })
            // }

            setProgress(100)
        } catch (err: any) {
            setError('OCR processing failed. Please try again.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleSave = (values: FormValues) => {
        console.log('Form values to save:', values)

        const finalResult = {
            message: ocrResult.message,
            ocrResult: {
                // Keep original OCR raw data
                ...ocrResult.ocrResult,
                // Override with form values (edited data)
                editedData: {
                    hospital: values.hospital,
                    order_sheet: values.order_sheet,
                    clinic: values.clinic,
                    medical_record_id: values.medical_record_id,
                    order_id: values.order_id,
                    full_name: values.full_name,
                    address: values.address,
                    gender: values.gender,
                    age: values.age,
                    patient_type: values.patient_type,
                    diagnosis: values.diagnosis,
                    exam_date: values.exam_date?.toISOString() || null,
                    ordering_doctor: values.ordering_doctor,
                    sample_time: values.sample_time,
                    print_time: values.print_time?.toISOString() || null,
                    technician: values.technician,
                    test_orders: values.test_orders,
                    // Calculate totals
                    total_tests: values.test_orders.length,
                    total_cost: values.test_orders.reduce(
                        (sum, test) => sum + parseFloat(test.price.replace(/[^\d.-]/g, '') || '0'),
                        0
                    )
                }
            }
        }
        onComplete(finalResult)
    }

    const handleRetry = () => {
        setOcrResult(null)
        setProgress(0)
        setError(null)
        form.reset()
        handleOCR()
    }

    // Start OCR processing immediately when component mounts
    useEffect(() => {
        handleOCR()
    }, [])

    // Cleanup URL when component unmounts
    useEffect(() => {
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl)
            }
        }
    }, [imageUrl])

    // Processing state with progress bar
    if (isProcessing) {
        return (
            <Stack gap='xl' align='center' mt='xl'>
                <Paper p='xl' radius='md' bg='blue.0' w='100%' maw={600}>
                    <Stack gap='lg' align='center'>
                        <IconScan size={48} color='var(--mantine-color-blue-6)' />

                        <div style={{ width: '100%', textAlign: 'center' }}>
                            <Text size='xl' fw={600} c='blue.6' mb='sm'>
                                Processing Medical Requisition...
                            </Text>
                            <Text c='dimmed' mb='lg'>
                                Extracting information from your document
                            </Text>

                            <Progress value={progress} size='lg' radius='md' animated color='blue' mb='md' />

                            <Text size='sm' c='blue.6' fw={500}>
                                {progress}% Complete
                            </Text>
                        </div>
                    </Stack>
                </Paper>
            </Stack>
        )
    }

    // Error state
    if (error) {
        return (
            <Stack gap='lg' mt='xl'>
                <Alert color='red' variant='light'>
                    {error}
                </Alert>

                <Paper p='md' withBorder>
                    <Stack gap='md' align='center'>
                        <Text size='lg' fw={600} c='red.6'>
                            OCR Processing Failed
                        </Text>

                        <Group gap='md'>
                            <Button variant='outline' leftSection={<IconArrowLeft size='1rem' />} onClick={onBack}>
                                Back to Upload
                            </Button>

                            <Button
                                variant='gradient'
                                gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                                leftSection={<IconScan size='1rem' />}
                                onClick={handleRetry}
                            >
                                Retry OCR
                            </Button>
                        </Group>
                    </Stack>
                </Paper>
            </Stack>
        )
    }

    // Results view with image on left and editable form on right
    if (ocrResult) {
        return (
            <form onSubmit={form.onSubmit(handleSave)}>
                <Stack gap='lg' mt='xl'>
                    <Paper p='md' withBorder>
                        <Group justify='space-between' align='center'>
                            <Group gap='sm'>
                                <IconCheck size='1.5rem' color='var(--mantine-color-green-6)' />
                                <Text size='xl' fw={600} c='green.6'>
                                    OCR Processing Complete - Review & Edit
                                </Text>
                            </Group>

                            <Group gap='md'>
                                <Button variant='outline' leftSection={<IconArrowLeft size='1rem' />} onClick={onBack}>
                                    Back
                                </Button>
                                <Button variant='outline' color='orange' onClick={handleRetry}>
                                    Retry OCR
                                </Button>
                            </Group>
                        </Group>
                    </Paper>

                    <Grid>
                        {/* Image Preview - Left Side */}
                        <Grid.Col span={{ base: 12, md: 5 }}>
                            <Card withBorder padding='md' radius='md' pos='sticky' top={20}>
                                <Stack gap='sm'>
                                    <Group gap='sm'>
                                        <IconPhoto size='1.2rem' />
                                        <Text fw={600} size='lg'>
                                            Original Document
                                        </Text>
                                    </Group>

                                    {selectedFile.type.startsWith('image/') ? (
                                        <Image
                                            src={imageUrl}
                                            alt='Medical requisition'
                                            radius='md'
                                            fit='contain'
                                            h={500}
                                            fallbackSrc='/placeholder-image.png'
                                        />
                                    ) : (
                                        <Paper
                                            p='xl'
                                            bg='gray.1'
                                            radius='md'
                                            h={500}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Stack align='center' gap='sm'>
                                                <IconPhoto size={48} color='var(--mantine-color-gray-5)' />
                                                <Text c='dimmed' ta='center'>
                                                    {selectedFile.name}
                                                </Text>
                                                <Text size='xs' c='dimmed'>
                                                    {selectedFile.type}
                                                </Text>
                                            </Stack>
                                        </Paper>
                                    )}

                                    <Text size='xs' c='dimmed' ta='center'>
                                        File: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                                    </Text>
                                </Stack>
                            </Card>
                        </Grid.Col>

                        {/* Editable Form - Right Side */}
                        <Grid.Col span={{ base: 12, md: 7 }}>
                            <Stack gap='lg'>
                                {/* Patient Information */}
                                <Card withBorder padding='md' radius='md'>
                                    <Title order={4} mb='md' c='blue.7'>
                                        Patient Information
                                    </Title>
                                    <Grid>
                                        <Grid.Col span={12}>
                                            <TextInput
                                                label='Full Name'
                                                placeholder='Enter patient full name'
                                                required
                                                {...form.getInputProps('full_name')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Medical Record ID'
                                                placeholder='Enter medical record ID'
                                                required
                                                {...form.getInputProps('medical_record_id')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Order ID'
                                                placeholder='Enter order ID'
                                                required
                                                {...form.getInputProps('order_id')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={4}>
                                            <NumberInput
                                                label='Age'
                                                placeholder='Enter age'
                                                min={0}
                                                max={150}
                                                {...form.getInputProps('age')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={4}>
                                            <Select
                                                label='Gender'
                                                placeholder='Select gender'
                                                data={['Nam', 'Nữ', 'Khác']}
                                                {...form.getInputProps('gender')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={4}>
                                            <TextInput
                                                label='Patient Type'
                                                placeholder='Enter patient type'
                                                {...form.getInputProps('patient_type')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={12}>
                                            <Textarea
                                                label='Address'
                                                placeholder='Enter patient address'
                                                {...form.getInputProps('address')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={12}>
                                            <Textarea
                                                label='Diagnosis'
                                                placeholder='Enter diagnosis'
                                                {...form.getInputProps('diagnosis')}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Card>

                                {/* Hospital Information */}
                                <Card withBorder padding='md' radius='md'>
                                    <Title order={4} mb='md' c='blue.7'>
                                        Hospital Information
                                    </Title>
                                    <Grid>
                                        <Grid.Col span={12}>
                                            <TextInput
                                                label='Hospital'
                                                placeholder='Enter hospital name'
                                                {...form.getInputProps('hospital')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Clinic'
                                                placeholder='Enter clinic name'
                                                {...form.getInputProps('clinic')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Order Sheet'
                                                placeholder='Enter order sheet type'
                                                {...form.getInputProps('order_sheet')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Ordering Doctor'
                                                placeholder='Enter doctor name'
                                                {...form.getInputProps('ordering_doctor')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Technician'
                                                placeholder='Enter technician name'
                                                {...form.getInputProps('technician')}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Card>

                                {/* Date & Time Information */}
                                <Card withBorder padding='md' radius='md'>
                                    <Title order={4} mb='md' c='blue.7'>
                                        Date & Time Information
                                    </Title>
                                    <Grid>
                                        <Grid.Col span={6}>
                                            <DatePickerInput
                                                label='Exam Date'
                                                placeholder='Select exam date'
                                                {...form.getInputProps('exam_date')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <DatePickerInput
                                                label='Print Time'
                                                placeholder='Select print time'
                                                {...form.getInputProps('print_time')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={12}>
                                            <TextInput
                                                label='Sample Time'
                                                placeholder='Enter sample collection time'
                                                {...form.getInputProps('sample_time')}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Card>

                                {/* Complete Button at the bottom */}
                                <Card withBorder padding='md' radius='md' bg='green.0'>
                                    <Group justify='space-between' align='center'>
                                        <div>
                                            <Text fw={600} size='lg' c='green.7'>
                                                Ready to Submit?
                                            </Text>
                                            <Text size='sm' c='dimmed'>
                                                Review all information and click Complete to save the OCR results
                                            </Text>
                                        </div>

                                        <Button
                                            type='submit'
                                            size='lg'
                                            color='green'
                                            leftSection={<IconCheck size='1.2rem' />}
                                            variant='gradient'
                                            gradient={{ from: 'green', to: 'teal', deg: 45 }}
                                            style={{ minWidth: 140 }}
                                        >
                                            Complete
                                        </Button>
                                    </Group>
                                </Card>
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </Stack>
            </form>
        )
    }
    return null
}

export default OCRProcessor
