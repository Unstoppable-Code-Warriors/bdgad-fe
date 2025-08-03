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
    Progress,
    Checkbox
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { IconRefresh, IconCheck } from '@tabler/icons-react'
import type { CategorizedSubmittedFile } from '@/types/categorized-upload'
import {
    getDefaultFormValues,
    formValidationRules,
    mapOCRToFormValues,
    formTypeOptions,
    genderOptions,
    cancerScreeningPackageOptions,
    cancerPanelOptions,
    niptPackageOptions,
    supportPackageOptions
} from '../forms'
import type { FormValues } from '../forms'
import { FormType } from '@/utils/constant'
import type { CommonOCRRes } from '@/types/ocr-file'
import type { EditedOCRRes } from '../types'

interface OCRDrawerProps {
    file: CategorizedSubmittedFile
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
                                                onClick={() => {
                                                    onRetryOCR()
                                                    onClose()
                                                }}
                                            >
                                                Retry OCR
                                            </Button>
                                            {file.ocrStatus === 'processing' && (
                                                <Stack gap='xs' style={{ minWidth: '120px' }}>
                                                    <Progress
                                                        value={ocrProgress || 0}
                                                        size='sm'
                                                        color='orange'
                                                        animated
                                                    />
                                                    <Text size='xs' ta='center' c='dimmed'>
                                                        {ocrProgress || 0}% - Đang xử lý OCR...
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
                    <Card withBorder h='100%' style={{ position: 'relative' }}>
                        <Stack gap='md' h='100%'>
                            <Group justify='space-between'>
                                <Text fw={600} size='lg'>
                                    Extracted Data
                                </Text>
                                {file.ocrStatus === 'processing' && (
                                    <Text size='sm' c='orange' fw={500}>
                                        Đang xử lý OCR...
                                    </Text>
                                )}
                            </Group>

                            {ocrResult && (
                                <div
                                    style={{
                                        flex: 1,
                                        overflow: 'auto',
                                        opacity: file.ocrStatus === 'processing' ? 0.6 : 1,
                                        pointerEvents: file.ocrStatus === 'processing' ? 'none' : 'auto'
                                    }}
                                >
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
                                                    <TextInput label='Địa chỉ' {...form.getInputProps('address')} />
                                                    <Group grow>
                                                        <TextInput
                                                            label='Phòng khám/Bệnh viện'
                                                            {...form.getInputProps('clinic')}
                                                        />
                                                        <TextInput label='Bác sỹ' {...form.getInputProps('doctor')} />
                                                    </Group>
                                                    <Group grow>
                                                        <TextInput
                                                            label='Số điện thoại bác sỹ'
                                                            {...form.getInputProps('doctor_phone')}
                                                        />
                                                        <TextInput
                                                            label='Số điện thoại'
                                                            {...form.getInputProps('phone')}
                                                        />
                                                    </Group>
                                                    <Group grow>
                                                        <DatePickerInput
                                                            label='Ngày thu mẫu'
                                                            {...form.getInputProps('sample_collection_date')}
                                                        />
                                                        <TextInput
                                                            label='Mã xét nghiệm'
                                                            {...form.getInputProps('test_code')}
                                                        />
                                                    </Group>
                                                    <Select
                                                        label='Gói tầm soát ung thư di truyền'
                                                        {...form.getInputProps('cancer_screening_package')}
                                                        data={cancerScreeningPackageOptions}
                                                    />
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
                                                    <TextInput label='Địa chỉ' {...form.getInputProps('address')} />
                                                    <Group grow>
                                                        <TextInput
                                                            label='Phòng khám/Bệnh viện'
                                                            {...form.getInputProps('clinic')}
                                                        />
                                                        <TextInput label='Bác sỹ' {...form.getInputProps('doctor')} />
                                                    </Group>
                                                    <Group grow>
                                                        <TextInput
                                                            label='Số điện thoại'
                                                            {...form.getInputProps('phone')}
                                                        />
                                                        <TextInput label='Email' {...form.getInputProps('email')} />
                                                    </Group>
                                                    <Group grow>
                                                        <DatePickerInput
                                                            label='Ngày thu mẫu'
                                                            {...form.getInputProps('sample_collection_date')}
                                                        />
                                                        <TextInput
                                                            label='Mã xét nghiệm'
                                                            {...form.getInputProps('test_code')}
                                                        />
                                                    </Group>
                                                    <Checkbox
                                                        label='Hút thuốc'
                                                        {...form.getInputProps('smoking', { type: 'checkbox' })}
                                                    />

                                                    {/* Thông tin bệnh học */}
                                                    <Title order={5} mt='md'>
                                                        Thông tin bệnh học
                                                    </Title>
                                                    <Textarea
                                                        label='Chẩn đoán lâm sàng'
                                                        {...form.getInputProps('clinical_diagnosis')}
                                                    />
                                                    <Group grow>
                                                        <TextInput
                                                            label='Giai đoạn bệnh'
                                                            {...form.getInputProps('disease_stage')}
                                                        />
                                                        <TextInput
                                                            label='Kết quả giải phẫu'
                                                            {...form.getInputProps('pathology_result')}
                                                        />
                                                    </Group>
                                                    <Textarea
                                                        label='Vị trí, kích thước, độ biệt hóa của khối u'
                                                        {...form.getInputProps('tumor_location_size_differentiation')}
                                                    />
                                                    <Group grow>
                                                        <TextInput
                                                            label='Thời gian phát hiện'
                                                            {...form.getInputProps('time_of_detection')}
                                                        />
                                                        <TextInput
                                                            label='Đã được điều trị gì'
                                                            {...form.getInputProps('treatment_received')}
                                                        />
                                                    </Group>

                                                    {/* Loại bệnh phẩm */}
                                                    <Title order={5} mt='md'>
                                                        Loại bệnh phẩm
                                                    </Title>
                                                    <Group>
                                                        <Checkbox
                                                            label='Mô sinh thiết/FFPE'
                                                            {...form.getInputProps('biopsy_tissue_ffpe', {
                                                                type: 'checkbox'
                                                            })}
                                                        />
                                                        <Checkbox
                                                            label='Máu (STL-ctDNA)'
                                                            {...form.getInputProps('blood_stl_ctdna', {
                                                                type: 'checkbox'
                                                            })}
                                                        />
                                                        <Checkbox
                                                            label='Dịch màng phổi/bụng'
                                                            {...form.getInputProps('pleural_peritoneal_fluid', {
                                                                type: 'checkbox'
                                                            })}
                                                        />
                                                    </Group>
                                                    <TextInput label='Mã số GPB' {...form.getInputProps('gpb_code')} />

                                                    {/* Loại ung thư và panel xét nghiệm */}
                                                    <Title order={5} mt='md'>
                                                        Loại ung thư và panel xét nghiệm
                                                    </Title>
                                                    <Select
                                                        label='Loại xét nghiệm'
                                                        {...form.getInputProps('cancer_panel')}
                                                        data={cancerPanelOptions}
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
                                                    <TextInput label='Địa chỉ' {...form.getInputProps('address')} />
                                                    <Group grow>
                                                        <TextInput
                                                            label='Phòng khám/Bệnh viện'
                                                            {...form.getInputProps('clinic')}
                                                        />
                                                        <TextInput label='Bác sỹ' {...form.getInputProps('doctor')} />
                                                    </Group>
                                                    <Group grow>
                                                        <TextInput
                                                            label='Số điện thoại bác sỹ'
                                                            {...form.getInputProps('doctor_phone')}
                                                        />
                                                        <TextInput
                                                            label='Số điện thoại'
                                                            {...form.getInputProps('phone')}
                                                        />
                                                    </Group>
                                                    <TextInput label='Email' {...form.getInputProps('email')} />
                                                    <Group grow>
                                                        <DatePickerInput
                                                            label='Ngày thu mẫu'
                                                            {...form.getInputProps('sample_collection_date')}
                                                        />
                                                        <TextInput
                                                            label='Giờ thu mẫu'
                                                            {...form.getInputProps('sample_collection_time')}
                                                        />
                                                    </Group>

                                                    {/* Thông tin lâm sàng */}
                                                    <Title order={5} mt='md'>
                                                        Thông tin lâm sàng
                                                    </Title>
                                                    <Group>
                                                        <Checkbox
                                                            label='Đơn thai'
                                                            {...form.getInputProps('single_pregnancy', {
                                                                type: 'checkbox'
                                                            })}
                                                        />
                                                        <Checkbox
                                                            label='Song thai tiêu biến'
                                                            {...form.getInputProps(
                                                                'twin_pregnancy_minor_complication',
                                                                { type: 'checkbox' }
                                                            )}
                                                        />
                                                        <Checkbox
                                                            label='Thai IVF'
                                                            {...form.getInputProps('ivf_pregnancy', {
                                                                type: 'checkbox'
                                                            })}
                                                        />
                                                    </Group>
                                                    <Group grow>
                                                        <NumberInput
                                                            label='Tuần thai'
                                                            {...form.getInputProps('gestational_age_weeks')}
                                                        />
                                                        <DatePickerInput
                                                            label='Ngày siêu âm'
                                                            {...form.getInputProps('ultrasound_date')}
                                                        />
                                                    </Group>
                                                    <Group grow>
                                                        <TextInput
                                                            label='Chiều dài đầu mông (CRL)'
                                                            {...form.getInputProps('crown_rump_length_crl')}
                                                        />
                                                        <TextInput
                                                            label='Độ mờ da gáy (NT)'
                                                            {...form.getInputProps('nuchal_translucency')}
                                                        />
                                                    </Group>
                                                    <Group grow>
                                                        <NumberInput
                                                            label='Chiều cao thai phụ (cm)'
                                                            {...form.getInputProps('maternal_height')}
                                                        />
                                                        <NumberInput
                                                            label='Cân nặng thai phụ (kg)'
                                                            {...form.getInputProps('maternal_weight')}
                                                        />
                                                    </Group>
                                                    <TextInput
                                                        label='Nguy cơ sàng lọc trước'
                                                        {...form.getInputProps('prenatal_screening_risk_nt')}
                                                    />

                                                    {/* Thực hiện xét nghiệm */}
                                                    <Title order={5} mt='md'>
                                                        Thực hiện xét nghiệm
                                                    </Title>
                                                    <Select
                                                        label='Gói NIPT'
                                                        {...form.getInputProps('nipt_package')}
                                                        data={niptPackageOptions}
                                                    />

                                                    {/* Gói ưu đãi kèm theo - chỉ hiện khi chọn NIPT24, NIPT 5, hoặc NIPT CNV */}
                                                    {['nipt_cnv', 'nipt_24', 'nipt_5'].includes(
                                                        form.values.nipt_package
                                                    ) && (
                                                        <>
                                                            <Title order={5} mt='md'>
                                                                Lựa chọn ưu đãi kèm theo
                                                            </Title>
                                                            <Radio.Group
                                                                label='Chọn gói hỗ trợ'
                                                                {...form.getInputProps('support_package')}
                                                            >
                                                                <Stack gap='sm' mt='sm'>
                                                                    {supportPackageOptions.map((option) => (
                                                                        <Radio
                                                                            key={option.value}
                                                                            value={option.value}
                                                                            label={option.label}
                                                                        />
                                                                    ))}
                                                                </Stack>
                                                            </Radio.Group>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </Stack>
                                    </form>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <Group justify='flex-end' mt='auto'>
                                <Button variant='light' onClick={onClose} disabled={file.ocrStatus === 'processing'}>
                                    Cancel
                                </Button>
                                <Button
                                    type='submit'
                                    leftSection={<IconCheck size={16} />}
                                    onClick={handleFormSubmit}
                                    disabled={!ocrResult || file.ocrStatus === 'processing'}
                                    loading={file.ocrStatus === 'processing'}
                                >
                                    {file.ocrStatus === 'processing' ? 'Đang xử lý...' : 'Save Changes'}
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
