import { useState, useEffect } from 'react'
import {
    Stack,
    Text,
    Group,
    Button,
    Grid,
    Image,
    Card,
    Title,
    TextInput,
    NumberInput,
    Textarea,
    Select,
    Radio,
    Progress
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { IconRefresh, IconCheck } from '@tabler/icons-react'
import type { SubmittedFile } from '../types'
import {
    getDefaultFormValues,
    formValidationRules,
    mapOCRToFormValues,
    formTypeOptions,
    genderOptions,
    cancerScreeningPackageOptions,
    cancerPanelOptions,
    niptPackageOptions
} from '../forms'
import type { FormValues } from '../forms'
import { FormType } from '@/utils/constant'
import type { CommonOCRRes } from '@/types/ocr-file'
import type { EditedOCRRes } from '../types'

interface OCRDrawerProps {
    file: SubmittedFile
    ocrResult?: CommonOCRRes<EditedOCRRes>
    ocrProgress: number
    onUpdate: (data: CommonOCRRes<EditedOCRRes>) => void
    onClose: () => void
    onRetryOCR: () => void
}

const OCRDrawer = ({ file, ocrResult, ocrProgress, onUpdate, onClose, onRetryOCR }: OCRDrawerProps) => {
    const [selectedFormType, setSelectedFormType] = useState<FormType>(FormType.HEREDITARY_CANCER)

    const form = useForm<FormValues>({
        initialValues: getDefaultFormValues(),
        validate: formValidationRules
    })

    // Function to detect form type from OCR result
    const detectFormType = (ocrResult: CommonOCRRes<EditedOCRRes>): FormType => {
        if (ocrResult?.ocrResult) {
            // Handle nested ocrResult structure
            const innerResult = ocrResult.ocrResult
            if (innerResult.document_name) {
                switch (innerResult.document_name) {
                    case 'gene_mutation':
                        return FormType.GENE_MUTATION
                    case 'prenatal_screening':
                        return FormType.PRENATAL_TESTING
                    case 'hereditary_cancer':
                        return FormType.HEREDITARY_CANCER
                    default:
                        return FormType.HEREDITARY_CANCER
                }
            }
        }

        // This part is not needed since document_name is inside ocrResult.ocrResult
        return FormType.HEREDITARY_CANCER
    }

    useEffect(() => {
        // Debug logging - can be removed in production
        console.log('OCRDrawer received:', { ocrResult, file })

        if (ocrResult) {
            // Auto-detect form type from OCR result
            const detectedFormType = detectFormType(ocrResult)
            console.log('Detected form type:', detectedFormType)
            setSelectedFormType(detectedFormType)

            // Auto-fill form with OCR data
            const mappedValues = mapOCRToFormValues(ocrResult)
            console.log('Mapped values:', mappedValues)
            // Also set the form_type field to match the selected form type
            mappedValues.form_type = detectedFormType
            form.setValues(mappedValues)
        } else {
            console.log('No OCR result provided to drawer')
            // Reset form when no OCR result is available
            form.reset()
            setSelectedFormType(FormType.HEREDITARY_CANCER)
        }
    }, [ocrResult])

    // Update form_type when selectedFormType changes
    useEffect(() => {
        form.setFieldValue('form_type', selectedFormType)
    }, [selectedFormType])

    const handleFormSubmit = () => {
        const formData = form.values

        // Get the original OCR result data
        const originalData = ocrResult?.ocrResult || {}

        // Create updated OCR result structure that extends the original
        const updatedOCRResult: CommonOCRRes<EditedOCRRes> = {
            message: ocrResult?.message || 'Medical Test Requisition updated via manual edit',
            ocrResult: {
                ...originalData,
                editedData: formData,
                lastEditedAt: new Date().toISOString()
            }
        }

        console.log('Submitting updated OCR result:', updatedOCRResult)
        onUpdate(updatedOCRResult)
        onClose()
    }

    const imageUrl = file.file ? URL.createObjectURL(file.file) : null

    return (
        <Stack gap='lg' h='100%'>
            {/* Header */}
            <Group justify='space-between' align='center'>
                <Title order={3}>OCR Result - {file.file.name}</Title>
            </Group>

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
                                    {ocrResult && (
                                        <Stack gap='xs' align='flex-end'>
                                            <Button
                                                size='sm'
                                                variant='light'
                                                color='orange'
                                                leftSection={<IconRefresh size={16} />}
                                                onClick={onRetryOCR}
                                                loading={file.ocrStatus === 'processing'}
                                                disabled={file.ocrStatus === 'processing'}
                                            >
                                                Retry OCR
                                            </Button>
                                            {file.ocrStatus === 'processing' && ocrProgress > 0 && (
                                                <Stack gap='xs' style={{ minWidth: '120px' }}>
                                                    <Progress value={ocrProgress} size='sm' color='orange' />
                                                    <Text size='xs' ta='center' c='dimmed'>
                                                        {ocrProgress}%
                                                    </Text>
                                                </Stack>
                                            )}
                                        </Stack>
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

                            {ocrResult && (
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

                                            {selectedFormType === FormType.GENE_MUTATION && (
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

                                            {selectedFormType === FormType.PRENATAL_TESTING && (
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
                                    disabled={!ocrResult}
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
