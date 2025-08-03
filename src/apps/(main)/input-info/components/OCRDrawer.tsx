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
    Textarea,
    Select,
    Radio
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { IconScan, IconCheck, IconRefresh } from '@tabler/icons-react'
import type { FileWithPath } from '@mantine/dropzone'
import { staffService } from '@/services/function/staff'
import {
    FormType,
    getDefaultFormValues,
    formValidationRules,
    mapOCRToFormValues,
    formTypeOptions,
    genderOptions,
    cancerScreeningPackageOptions,
    cancerPanelOptions,
    niptPackageOptions
} from '../ocr/Form'
import type { FormValues } from '../ocr/Form'

interface SubmittedFile {
    id: string
    file: FileWithPath
    uploadedAt: string
    status: 'uploaded' | 'processing' | 'completed'
    type: 'image' | 'pdf' | 'document' | 'other'
    ocrResult?: any
    ocrStatus?: 'idle' | 'processing' | 'success' | 'failed'
    ocrError?: string
}

interface OCRDrawerProps {
    file: SubmittedFile
    onUpdate: (data: any) => void
    onClose: () => void
    onRetryOCR?: (fileId: string) => void
}

const OCRDrawer = ({ file, onUpdate, onClose, onRetryOCR }: OCRDrawerProps) => {
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [ocrData, setOcrData] = useState<any>(null)
    const [selectedFormType, setSelectedFormType] = useState<FormType>(FormType.HEREDITARY_CANCER)

    const form = useForm<FormValues>({
        initialValues: getDefaultFormValues(),
        validate: formValidationRules
    })

    useEffect(() => {
        if (file.ocrResult) {
            setOcrData(file.ocrResult)
            const mappedValues = mapOCRToFormValues(file.ocrResult)
            form.setValues(mappedValues)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file.ocrResult, selectedFormType])

    const handleFormSubmit = () => {
        const formData = form.values
        onUpdate(formData)
        onClose()
    }

    const handleRetryOCR = async () => {
        setIsProcessing(true)
        setProgress(0)
        setError(null)
        setOcrData(null)
        form.reset()

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return 90
                    }
                    return prev + 10
                })
            }, 200)

            const result = await staffService.ocrFile(file.file)

            clearInterval(progressInterval)
            setProgress(100)

            setOcrData(result)
            const mappedValues = mapOCRToFormValues(result)
            form.setValues(mappedValues)

            setTimeout(() => {
                setIsProcessing(false)
                setProgress(0)
            }, 500)

            // Notify parent component about the retry
            if (onRetryOCR) {
                onRetryOCR(file.id)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process OCR')
            setIsProcessing(false)
            setProgress(0)
        }
    }

    const processOCR = async () => {
        setIsProcessing(true)
        setProgress(0)
        setError(null)

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return 90
                    }
                    return prev + 10
                })
            }, 200)

            const result = await staffService.ocrFile(file.file)

            clearInterval(progressInterval)
            setProgress(100)

            setOcrData(result)
            const mappedValues = mapOCRToFormValues(result)
            form.setValues(mappedValues)

            setTimeout(() => {
                setIsProcessing(false)
                setProgress(0)
            }, 500)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process OCR')
            setIsProcessing(false)
            setProgress(0)
        }
    }

    const imageUrl = file.file ? URL.createObjectURL(file.file) : null

    return (
        <Stack gap='lg' h='100%'>
            {/* Header */}
            <Group justify='space-between' align='center'>
                <Title order={3}>OCR Result - {file.file.name}</Title>
            </Group>

            {/* Error Alert */}
            {error && (
                <Alert color='red' variant='light'>
                    {error}
                </Alert>
            )}

            {/* Processing Progress */}
            {isProcessing && (
                <Paper p='md' withBorder>
                    <Stack gap='sm'>
                        <Group justify='space-between'>
                            <Text fw={500}>Processing OCR...</Text>
                            <Text size='sm' c='dimmed'>
                                {progress}%
                            </Text>
                        </Group>
                        <Progress value={progress} animated />
                    </Stack>
                </Paper>
            )}

            {/* Main Content */}
            <Grid style={{ flex: 1, overflow: 'hidden' }}>
                {/* Image Preview */}
                <Grid.Col span={6} style={{ height: '100%', overflow: 'auto' }}>
                    <Card withBorder h='100%'>
                        <Stack gap='sm' h='100%'>
                            <Group justify='space-between'>
                                <Text fw={600} size='lg'>
                                    Image Preview
                                </Text>
                                <Group gap='xs'>
                                    {!file.ocrResult && !ocrData && (
                                        <Button
                                            size='sm'
                                            leftSection={<IconScan size={16} />}
                                            onClick={processOCR}
                                            loading={isProcessing}
                                            disabled={isProcessing}
                                        >
                                            Start OCR
                                        </Button>
                                    )}
                                    {(file.ocrResult || ocrData) && (
                                        <Button
                                            size='sm'
                                            variant='light'
                                            color='orange'
                                            leftSection={<IconRefresh size={16} />}
                                            onClick={handleRetryOCR}
                                            loading={isProcessing}
                                            disabled={isProcessing}
                                        >
                                            Retry OCR
                                        </Button>
                                    )}
                                </Group>
                            </Group>

                            {imageUrl && (
                                <div style={{ flex: 1, overflow: 'auto' }}>
                                    <Image
                                        src={imageUrl}
                                        alt='OCR source'
                                        fit='contain'
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                </div>
                            )}
                        </Stack>
                    </Card>
                </Grid.Col>

                {/* Form */}
                <Grid.Col span={6} style={{ height: '100%', overflow: 'auto' }}>
                    <Card withBorder h='100%'>
                        <Stack gap='md' h='100%'>
                            <Group justify='space-between'>
                                <Text fw={600} size='lg'>
                                    Extracted Data
                                </Text>
                            </Group>

                            {ocrData && (
                                <div style={{ flex: 1, overflow: 'auto' }}>
                                    <form onSubmit={form.onSubmit(handleFormSubmit)}>
                                        <Stack gap='md'>
                                            {/* Form Type Selection */}
                                            <Select
                                                label='Form Type'
                                                value={selectedFormType}
                                                onChange={(value) =>
                                                    setSelectedFormType(
                                                        (value as FormType) || FormType.HEREDITARY_CANCER
                                                    )
                                                }
                                                data={formTypeOptions}
                                                required
                                            />

                                            {/* Dynamic Form Fields based on form type */}
                                            {selectedFormType === FormType.HEREDITARY_CANCER && (
                                                <>
                                                    <TextInput label='Họ và tên' {...form.getInputProps('full_name')} />
                                                    <Group grow>
                                                        <DatePickerInput
                                                            label='Ngày sinh'
                                                            {...form.getInputProps('date_of_birth')}
                                                        />
                                                        <Radio.Group
                                                            label='Giới tính'
                                                            {...form.getInputProps('gender')}
                                                        >
                                                            <Group mt='xs'>
                                                                {genderOptions.map((option) => (
                                                                    <Radio
                                                                        key={option.value}
                                                                        value={option.value}
                                                                        label={option.label}
                                                                    />
                                                                ))}
                                                            </Group>
                                                        </Radio.Group>
                                                    </Group>
                                                    <Select
                                                        label='Gói tầm soát'
                                                        {...form.getInputProps('cancer_screening_package')}
                                                        data={cancerScreeningPackageOptions}
                                                    />
                                                    <DatePickerInput
                                                        label='Ngày thu mẫu'
                                                        {...form.getInputProps('sample_collection_date')}
                                                    />
                                                    <TextInput label='Bác sỹ' {...form.getInputProps('doctor')} />
                                                    <TextInput label='Phòng khám' {...form.getInputProps('clinic')} />
                                                </>
                                            )}

                                            {selectedFormType === FormType.GENE_MUTATION_TESTING && (
                                                <>
                                                    <TextInput label='Họ và tên' {...form.getInputProps('full_name')} />
                                                    <Group grow>
                                                        <DatePickerInput
                                                            label='Ngày sinh'
                                                            {...form.getInputProps('date_of_birth')}
                                                        />
                                                        <Radio.Group
                                                            label='Giới tính'
                                                            {...form.getInputProps('gender')}
                                                        >
                                                            <Group mt='xs'>
                                                                {genderOptions.map((option) => (
                                                                    <Radio
                                                                        key={option.value}
                                                                        value={option.value}
                                                                        label={option.label}
                                                                    />
                                                                ))}
                                                            </Group>
                                                        </Radio.Group>
                                                    </Group>
                                                    <Select
                                                        label='Loại xét nghiệm'
                                                        {...form.getInputProps('cancer_panel')}
                                                        data={cancerPanelOptions}
                                                    />
                                                    <DatePickerInput
                                                        label='Ngày thu mẫu'
                                                        {...form.getInputProps('sample_collection_date')}
                                                    />
                                                    <Textarea
                                                        label='Chẩn đoán lâm sàng'
                                                        {...form.getInputProps('clinical_diagnosis')}
                                                    />
                                                </>
                                            )}

                                            {selectedFormType === FormType.NON_INVASIVE_PRENATAL_TESTING && (
                                                <>
                                                    <TextInput label='Họ và tên' {...form.getInputProps('full_name')} />
                                                    <Group grow>
                                                        <DatePickerInput
                                                            label='Ngày sinh'
                                                            {...form.getInputProps('date_of_birth')}
                                                        />
                                                        <NumberInput
                                                            label='Tuần thai'
                                                            {...form.getInputProps('gestational_weeks')}
                                                        />
                                                    </Group>
                                                    <Select
                                                        label='Gói NIPT'
                                                        {...form.getInputProps('nipt_package')}
                                                        data={niptPackageOptions}
                                                    />
                                                    <DatePickerInput
                                                        label='Ngày thu mẫu'
                                                        {...form.getInputProps('sample_collection_date')}
                                                    />
                                                    <TextInput label='Bác sỹ' {...form.getInputProps('doctor')} />
                                                    <TextInput
                                                        label='Điện thoại bác sỹ'
                                                        {...form.getInputProps('doctor_phone')}
                                                    />
                                                </>
                                            )}
                                        </Stack>
                                    </form>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <Group justify='flex-end' mt='auto'>
                                <Button variant='light' onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    type='submit'
                                    leftSection={<IconCheck size={16} />}
                                    onClick={handleFormSubmit}
                                    disabled={!ocrData}
                                >
                                    Save Changes
                                </Button>
                            </Group>
                        </Stack>
                    </Card>
                </Grid.Col>
            </Grid>
        </Stack>
    )
}

export default OCRDrawer
