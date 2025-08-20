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
    Checkbox,
    Alert
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { IconRefresh, IconCheck, IconAlertTriangle } from '@tabler/icons-react'
import type { CategorizedSubmittedFile } from '@/types/categorized-upload'
import { FileCategory, FILE_CATEGORY_OPTIONS } from '@/types/categorized-upload'
import {
    getDefaultFormValues,
    formValidationRules,
    formTypeOptions,
    genderOptions,
    cancerScreeningPackageOptions,
    cancerPanelOptions,
    niptPackageOptions,
    supportPackageOptions
} from '@/types/prescription-form'
import type { FormValues } from '@/types/prescription-form'
import { FormType } from '@/utils/constant'
import type { CommonOCRRes } from '@/types/ocr-file'
import type { EditedOCRRes } from '../types'
import { mapOCRToFormValues } from '../forms'

interface OCRDrawerProps {
    file: CategorizedSubmittedFile
    ocrResult?: CommonOCRRes<EditedOCRRes>
    ocrProgress: number
    onUpdate: (data: CommonOCRRes<EditedOCRRes>) => void
    onClose: () => void
    onRetryOCR: () => void
    patientData?: any
}

const OCRDrawer = ({ file, ocrResult, ocrProgress, onUpdate, onClose, onRetryOCR, patientData }: OCRDrawerProps) => {
    const [selectedFormType, setSelectedFormType] = useState<FormType>(FormType.OTHER)
    const [nameValidationWarning, setNameValidationWarning] = useState<string>('')
    const [categoryMismatchWarning, setCategoryMismatchWarning] = useState<string>('')
    const [categoryLabel, setCategoryLabel] = useState<string>('')
    const [formTypeLabel, setFormTypeLabel] = useState<string>('')

    const form = useForm<FormValues>({
        initialValues: getDefaultFormValues(),
        validate: formValidationRules
    })

    // Function to convert null values and unwanted strings to empty strings recursively
    const convertNullToEmptyString = (obj: any): any => {
        if (obj === null) {
            return ''
        }
        if (typeof obj === 'string') {
            // Convert "NA", "N/A", and their variations to empty string
            const trimmed = obj.trim()
            if (
                trimmed === 'NA' ||
                trimmed === 'N/A' ||
                trimmed === 'na' ||
                trimmed === 'n/a' ||
                trimmed === 'string'
            ) {
                return ''
            }
            return obj
        }
        if (Array.isArray(obj)) {
            return obj.map(convertNullToEmptyString)
        }
        if (typeof obj === 'object' && obj !== null) {
            const converted: any = {}
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    converted[key] = convertNullToEmptyString(obj[key])
                }
            }
            return converted
        }
        return obj
    }

    // Function to validate full name against patient folder name
    const validateFullName = (fullName: string) => {
        if (!patientData?.fullName || !fullName) {
            setNameValidationWarning('')
            return
        }

        // Normalize names for comparison (remove extra spaces, convert to lowercase)
        const normalizeString = (str: string) => str.trim().toLowerCase().replace(/\s+/g, ' ')

        const ocrName = normalizeString(fullName)
        const patientFolderName = normalizeString(patientData.fullName)

        if (ocrName !== patientFolderName) {
            setNameValidationWarning(
                `Tên trong OCR "${fullName}" không khớp với tên trong hồ sơ bệnh nhân "${patientData.fullName}"`
            )
        } else {
            setNameValidationWarning('')
        }
    }

    // Function to validate category mismatch between file category and form type
    const validateCategoryMismatch = (formType: FormType) => {
        if (!file.category) {
            setCategoryMismatchWarning('')
            return
        }

        // Create mapping between file categories and form types
        const categoryToFormTypeMap = {
            [FileCategory.PRENATAL_SCREENING]: FormType.PRENATAL_TESTING,
            [FileCategory.HEREDITARY_CANCER]: FormType.HEREDITARY_CANCER,
            [FileCategory.GENE_MUTATION]: FormType.GENE_MUTATION,
            [FileCategory.GENERAL]: FormType.OTHER
        }

        const expectedFormType = categoryToFormTypeMap[file.category]

        if (formType !== expectedFormType && expectedFormType !== FormType.OTHER) {
            // Get human-readable labels
            const getCategoryLabel = (category: FileCategory) => {
                const option = FILE_CATEGORY_OPTIONS.find((opt) => opt.value === category)
                return option ? option.label : category
            }

            const getFormTypeLabel = (type: FormType) => {
                const option = formTypeOptions.find((opt) => opt.value === type)
                return option ? option.label : type
            }

            const currentCategoryLabel = getCategoryLabel(file.category)
            const currentFormTypeLabel = getFormTypeLabel(formType)

            setCategoryLabel(currentCategoryLabel)
            setFormTypeLabel(currentFormTypeLabel)
            setCategoryMismatchWarning(
                `Loại file được chọn là "${currentCategoryLabel}" nhưng loại biểu mẫu được chọn là "${currentFormTypeLabel}". Điều này có thể gây ra sai lệch trong xử lý dữ liệu.`
            )
        } else {
            setCategoryMismatchWarning('')
            setCategoryLabel('')
            setFormTypeLabel('')
        }
    }

    const detectFormType = (ocrResult: CommonOCRRes<EditedOCRRes>): FormType => {
        if (ocrResult?.ocrResult) {
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
                        return FormType.OTHER
                }
            }
        }

        return FormType.OTHER
    }

    useEffect(() => {
        if (ocrResult) {
            const detectedFormType = detectFormType(ocrResult)
            setSelectedFormType(detectedFormType)

            // Convert null values and unwanted strings to empty strings before mapping
            const cleanedOcrResult = {
                ...ocrResult,
                ocrResult: convertNullToEmptyString(ocrResult.ocrResult)
            }

            const mappedValues = mapOCRToFormValues(cleanedOcrResult)

            mappedValues.document_name = detectedFormType

            form.setValues(mappedValues)
        } else {
            form.reset()
            setSelectedFormType(FormType.OTHER)
        }
    }, [ocrResult])

    // Update document_name when selectedFormType changes
    useEffect(() => {
        form.setFieldValue('document_name', selectedFormType)
        validateCategoryMismatch(selectedFormType)
    }, [selectedFormType])

    // Validate full name when it changes
    useEffect(() => {
        if (form.values.full_name) {
            validateFullName(form.values.full_name)
        }
    }, [form.values.full_name, patientData?.fullName])

    const handleFormSubmit = () => {
        const formData = form.values

        const originalData = ocrResult?.ocrResult || {}

        // Convert null values and unwanted strings to empty strings in the original data
        const cleanedOriginalData = convertNullToEmptyString(originalData)
        const updatedData = JSON.parse(JSON.stringify(cleanedOriginalData))

        // Map form fields to their corresponding OCR result fields
        // Basic fields that map directly
        if (formData.full_name !== undefined) updatedData.full_name = formData.full_name
        if (formData.gender !== undefined) updatedData.gender = formData.gender
        if (formData.clinic !== undefined) updatedData.clinic = formData.clinic
        if (formData.doctor !== undefined) updatedData.doctor = formData.doctor
        if (formData.doctor_phone !== undefined) updatedData.doctor_phone = formData.doctor_phone
        if (formData.phone !== undefined) updatedData.phone = formData.phone
        if (formData.email !== undefined) updatedData.email = formData.email
        if (formData.address !== undefined) updatedData.address = formData.address
        if (formData.test_code !== undefined) updatedData['Test code'] = formData.test_code

        // Date fields - convert to ISO string if valid
        if (formData.date_of_birth && !isNaN(formData.date_of_birth.getTime())) {
            updatedData.date_of_birth = formData.date_of_birth.toISOString()
        }
        if (formData.sample_collection_date && !isNaN(formData.sample_collection_date.getTime())) {
            updatedData.sample_collection_date = formData.sample_collection_date.toISOString()
        }

        // Sample collection time
        if (formData.sample_collection_time !== undefined) {
            updatedData.sample_collection_time = formData.sample_collection_time
        }

        // Smoking field - convert boolean to string for OCR format
        if (formData.smoking !== undefined) {
            updatedData.smoking = formData.smoking ? 'yes' : 'no'
        }

        // Update nested structures based on form type
        if (selectedFormType === FormType.GENE_MUTATION && updatedData.gene_mutation_testing) {
            // Update clinical information
            if (updatedData.gene_mutation_testing.clinical_information) {
                const clinicalInfo = updatedData.gene_mutation_testing.clinical_information
                if (formData.clinical_diagnosis !== undefined)
                    clinicalInfo.clinical_diagnosis = formData.clinical_diagnosis
                if (formData.disease_stage !== undefined) clinicalInfo.disease_stage = formData.disease_stage
                if (formData.pathology_result !== undefined) clinicalInfo.pathology_result = formData.pathology_result
                if (formData.tumor_location_size_differentiation !== undefined)
                    clinicalInfo.tumor_location_size_differentiation = formData.tumor_location_size_differentiation
                if (formData.time_of_detection !== undefined)
                    clinicalInfo.time_of_detection = formData.time_of_detection
                if (formData.treatment_received !== undefined)
                    clinicalInfo.treatment_received = formData.treatment_received
            }

            // Update specimen information
            if (updatedData.gene_mutation_testing.specimen_and_test_information) {
                const specimenInfo = updatedData.gene_mutation_testing.specimen_and_test_information
                if (formData.gpb_code !== undefined) specimenInfo.gpb_code = formData.gpb_code

                // Update specimen type based on form selection
                if (formData.specimen_type && specimenInfo.specimen_type) {
                    specimenInfo.specimen_type.biopsy_tissue_ffpe = formData.specimen_type === 'biopsy_tissue_ffpe'
                    specimenInfo.specimen_type.blood_stl_ctdna = formData.specimen_type === 'blood_stl_ctdna'
                    specimenInfo.specimen_type.pleural_peritoneal_fluid =
                        formData.specimen_type === 'pleural_peritoneal_fluid'
                }

                // Update cancer panel selection
                if (formData.cancer_panel && specimenInfo.cancer_type_and_test_panel_please_tick_one) {
                    const panels = specimenInfo.cancer_type_and_test_panel_please_tick_one

                    // Create mapping from form values to OCR keys
                    const panelMapping: { [key: string]: string } = {
                        Onco81: 'onco_81',
                        Onco500: 'onco_500_plus',
                        lung_cancer: 'lung_cancer',
                        ovarian_cancer: 'ovarian_cancer',
                        colorectal_cancer: 'colorectal_cancer',
                        prostate_cancer: 'prostate_cancer',
                        breast_cancer: 'breast_cancer',
                        cervical_cancer: 'cervical_cancer',
                        gastric_cancer: 'gastric_cancer',
                        pancreatic_cancer: 'pancreatic_cancer',
                        thyroid_cancer: 'thyroid_cancer',
                        gastrointestinal_stromal_tumor_gist: 'gastrointestinal_stromal_tumor_gist'
                    }

                    // Reset all panels to false first
                    Object.keys(panels).forEach((key) => {
                        if (panels[key] && typeof panels[key] === 'object' && 'is_selected' in panels[key]) {
                            panels[key].is_selected = false
                        }
                    })

                    // Set the selected panel to true
                    const ocrKey = panelMapping[formData.cancer_panel]
                    if (ocrKey && panels[ocrKey]) {
                        panels[ocrKey].is_selected = true
                    }
                }
            }
        }

        if (selectedFormType === FormType.PRENATAL_TESTING && updatedData.non_invasive_prenatal_testing) {
            // Update clinical information
            if (updatedData.non_invasive_prenatal_testing.clinical_information) {
                const clinicalInfo = updatedData.non_invasive_prenatal_testing.clinical_information

                // Update pregnancy type
                if (formData.single_pregnancy !== undefined && clinicalInfo.single_pregnancy) {
                    clinicalInfo.single_pregnancy.yes = formData.single_pregnancy
                    clinicalInfo.single_pregnancy.no = !formData.single_pregnancy
                }
                if (
                    formData.twin_pregnancy_minor_complication !== undefined &&
                    clinicalInfo.twin_pregnancy_minor_complication
                ) {
                    clinicalInfo.twin_pregnancy_minor_complication.yes = formData.twin_pregnancy_minor_complication
                    clinicalInfo.twin_pregnancy_minor_complication.no = !formData.twin_pregnancy_minor_complication
                }
                if (formData.ivf_pregnancy !== undefined && clinicalInfo.ivf_pregnancy) {
                    clinicalInfo.ivf_pregnancy.yes = formData.ivf_pregnancy
                    clinicalInfo.ivf_pregnancy.no = !formData.ivf_pregnancy
                }

                // Update other clinical fields
                if (formData.gestational_age_weeks !== undefined)
                    clinicalInfo.gestational_age_weeks = formData.gestational_age_weeks.toString()
                if (formData.maternal_height !== undefined)
                    clinicalInfo.maternal_height = formData.maternal_height.toString()
                if (formData.maternal_weight !== undefined)
                    clinicalInfo.maternal_weight = formData.maternal_weight.toString()
                if (formData.crown_rump_length_crl !== undefined)
                    clinicalInfo.crown_rump_length_crl = formData.crown_rump_length_crl
                if (formData.nuchal_translucency !== undefined)
                    clinicalInfo.nuchal_translucency = formData.nuchal_translucency
                if (formData.prenatal_screening_risk_nt !== undefined)
                    clinicalInfo.prenatal_screening_risk_nt = formData.prenatal_screening_risk_nt

                if (formData.ultrasound_date && !isNaN(formData.ultrasound_date.getTime())) {
                    clinicalInfo.ultrasound_date = formData.ultrasound_date.toISOString()
                }
            }

            // Update NIPT package selection
            if (formData.nipt_package && updatedData.non_invasive_prenatal_testing.test_options) {
                updatedData.non_invasive_prenatal_testing.test_options =
                    updatedData.non_invasive_prenatal_testing.test_options.map((option: any) => ({
                        ...option,
                        is_selected: option.package_name === formData.nipt_package
                    }))
            }

            // Update support package selection
            if (formData.support_package && updatedData.additional_selection_notes) {
                const supportNotes = updatedData.additional_selection_notes
                supportNotes.torch_fetal_infection_risk_survey =
                    formData.support_package === 'torch_fetal_infection_risk_survey'
                supportNotes.carrier_18_common_recessive_hereditary_disease_genes_in_vietnamese_thalassemia_hypo_hyper_thyroidism_g6pd_deficiency_pompe_wilson_cf =
                    formData.support_package === 'carrier_18_genes'
                supportNotes.no_support_package_selected = formData.support_package === 'no_support_package'
            }
        }

        if (selectedFormType === FormType.HEREDITARY_CANCER && updatedData.hereditary_cancer) {
            // Update cancer screening package selection
            if (formData.cancer_screening_package) {
                const cancerScreening = updatedData.hereditary_cancer
                cancerScreening.breast_cancer_bcare.is_selected =
                    formData.cancer_screening_package === 'breast_cancer_bcare'
                cancerScreening['15_hereditary_cancer_types_more_care'].is_selected =
                    formData.cancer_screening_package === '15_hereditary_cancer_types_more_care'
                cancerScreening['20_hereditary_cancer_types_vip_care'].is_selected =
                    formData.cancer_screening_package === '20_hereditary_cancer_types_vip_care'
            }
        }

        // Add timestamp for tracking changes
        updatedData.lastEditedAt = new Date().toISOString()

        const updatedOCRResult: CommonOCRRes<EditedOCRRes> = {
            message: ocrResult?.message || 'Medical Test Requisition updated via manual edit',
            ocrResult: updatedData as unknown as EditedOCRRes
        }

        onUpdate(updatedOCRResult)
        onClose()
    }

    const imageUrl = file.file ? URL.createObjectURL(file.file) : null

    return (
        <Stack gap='lg' h='100%'>
            {/* Header */}
            <Group justify='space-between' align='center'>
                <Title order={3}>Kết quả OCR - {file.file.name}</Title>
            </Group>

            {/* Main Content */}
            <Grid style={{ height: '100%' }}>
                {/* Image Preview */}
                <Grid.Col span={6} style={{ height: '100%', position: 'sticky', top: 0, alignSelf: 'flex-start' }}>
                    <Card withBorder h='100%'>
                        <Stack gap='sm' h='100%'>
                            <Group justify='space-between'>
                                <Text fw={600} size='lg'>
                                    Ảnh
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
                                                Thử lại OCR
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
                <Grid.Col span={6} style={{ height: '100%', overflowY: 'auto' }}>
                    <Card withBorder h='100%' style={{ overflowY: 'auto' }}>
                        <Stack gap='md' h='100%'>
                            <Group justify='space-between'>
                                <Text fw={600} size='lg'>
                                    Dữ liệu đã trích xuất
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
                                                label='Loại biểu mẫu'
                                                value={selectedFormType}
                                                onChange={(value) =>
                                                    setSelectedFormType((value as FormType) || FormType.OTHER)
                                                }
                                                data={formTypeOptions}
                                                required
                                            />

                                            {/* Category Mismatch Warning */}
                                            {categoryMismatchWarning && (
                                                <Alert
                                                    variant='light'
                                                    color='orange'
                                                    icon={<IconAlertTriangle size={16} />}
                                                >
                                                    <Text size='sm'>
                                                        <Text component='span' fw={700}>
                                                            Cảnh báo:
                                                        </Text>{' '}
                                                        Loại file được chọn là{' '}
                                                        <Text component='span' fw={700}>
                                                            "{categoryLabel}"
                                                        </Text>{' '}
                                                        nhưng loại biểu mẫu được chọn là{' '}
                                                        <Text component='span' fw={700}>
                                                            "{formTypeLabel}"
                                                        </Text>
                                                        . Điều này có thể gây ra sai lệch trong xử lý dữ liệu.
                                                    </Text>
                                                </Alert>
                                            )}

                                            {/* Dynamic Form Fields based on form type */}
                                            {selectedFormType === FormType.HEREDITARY_CANCER && (
                                                <>
                                                    <div>
                                                        <TextInput
                                                            label='Họ và tên'
                                                            {...form.getInputProps('full_name')}
                                                        />
                                                        {nameValidationWarning && (
                                                            <Text size='sm' c='orange' mt={4}>
                                                                ⚠️ {nameValidationWarning}
                                                            </Text>
                                                        )}
                                                    </div>
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
                                                            label='Số điện thoại'
                                                            {...form.getInputProps('phone')}
                                                        />
                                                        <div />
                                                    </Group>
                                                    <Group grow>
                                                        <TextInput label='Bác sỹ' {...form.getInputProps('doctor')} />
                                                        <TextInput
                                                            label='Phòng khám/Bệnh viện'
                                                            {...form.getInputProps('clinic')}
                                                        />
                                                    </Group>
                                                    <Group grow>
                                                        <TextInput
                                                            label='Số điện thoại bác sỹ'
                                                            {...form.getInputProps('doctor_phone')}
                                                        />
                                                        <div />
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
                                                    <div>
                                                        <TextInput
                                                            label='Họ và tên'
                                                            {...form.getInputProps('full_name')}
                                                        />
                                                        {nameValidationWarning && (
                                                            <Text size='sm' c='orange' mt={4}>
                                                                ⚠️ {nameValidationWarning}
                                                            </Text>
                                                        )}
                                                    </div>
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
                                                        <TextInput label='Bác sỹ' {...form.getInputProps('doctor')} />
                                                        <TextInput
                                                            label='Phòng khám/Bệnh viện'
                                                            {...form.getInputProps('clinic')}
                                                        />
                                                    </Group>
                                                    <Group grow>
                                                        <TextInput
                                                            label='Số điện thoại'
                                                            {...form.getInputProps('phone')}
                                                        />
                                                        <TextInput label='Email' {...form.getInputProps('email')} />
                                                    </Group>
                                                    <Group grow>
                                                        <TextInput
                                                            label='Mã xét nghiệm'
                                                            {...form.getInputProps('test_code')}
                                                        />
                                                        <div />
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
                                                    <Radio.Group
                                                        label='Chọn loại bệnh phẩm'
                                                        {...form.getInputProps('specimen_type')}
                                                    >
                                                        <Stack gap='sm' mt='sm'>
                                                            <Radio
                                                                value='biopsy_tissue_ffpe'
                                                                label='Mô sinh thiết/FFPE'
                                                            />
                                                            <Radio value='blood_stl_ctdna' label='Máu (STL-ctDNA)' />
                                                            <Radio
                                                                value='pleural_peritoneal_fluid'
                                                                label='Dịch màng phổi/bụng'
                                                            />
                                                        </Stack>
                                                    </Radio.Group>
                                                    <Group grow>
                                                        <TextInput
                                                            label='Mã số GPB'
                                                            {...form.getInputProps('gpb_code')}
                                                        />
                                                        <DatePickerInput
                                                            label='Ngày thu mẫu'
                                                            {...form.getInputProps('sample_collection_date')}
                                                        />
                                                    </Group>

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
                                                    <div>
                                                        <TextInput
                                                            label='Họ và tên'
                                                            {...form.getInputProps('full_name')}
                                                        />
                                                        {nameValidationWarning && (
                                                            <Text size='sm' c='orange' mt={4}>
                                                                ⚠️ {nameValidationWarning}
                                                            </Text>
                                                        )}
                                                    </div>
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
                                                        <TextInput label='Bác sỹ' {...form.getInputProps('doctor')} />
                                                        <TextInput
                                                            label='Phòng khám/Bệnh viện'
                                                            {...form.getInputProps('clinic')}
                                                        />
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
                                    Hủy
                                </Button>
                                <Button
                                    type='submit'
                                    leftSection={<IconCheck size={16} />}
                                    onClick={handleFormSubmit}
                                    disabled={!ocrResult || file.ocrStatus === 'processing'}
                                    loading={file.ocrStatus === 'processing'}
                                >
                                    {file.ocrStatus === 'processing' ? 'Đang xử lý...' : 'Lưu thay đổi'}
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
