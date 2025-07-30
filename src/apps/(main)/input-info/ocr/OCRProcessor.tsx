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
    Textarea,
    Checkbox
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

interface FormValues {
    // Thông tin cơ bản
    full_name: string
    clinic: string
    date_of_birth: Date | null
    doctor: string
    sample_collection_date: Date | null
    sample_collection_time: string
    phone: string
    email: string
    test_code: string
    smoking: boolean
    address: string
    
    // Xét nghiệm yêu cầu
    breast_cancer_bcare: boolean
    fifteen_hereditary_cancer_types_more_care: boolean
    twenty_hereditary_cancer_types_vip_care: boolean
    
    // Thông tin bệnh học
    clinical_diagnosis: string
    disease_stage: string
    pathology_result: string
    tumor_location_size_differentiation: string
    time_of_detection: string
    treatment_received: string
    
    // Loại bệnh phẩm
    biopsy_tissue_ffpe: boolean
    blood_stl_ctdna: boolean
    pleural_peritoneal_fluid: boolean
    gpb_code: string
    
    // Loại ung thư và panel xét nghiệm
    onco_81: boolean
    onco_500_plus: boolean
    lung_cancer: boolean
    ovarian_cancer: boolean
    colorectal_cancer: boolean
    prostate_cancer: boolean
    breast_cancer: boolean
    cervical_cancer: boolean
    gastric_cancer: boolean
    pancreatic_cancer: boolean
    thyroid_cancer: boolean
    gastrointestinal_stromal_tumor_gist: boolean
    
    // Thông tin lâm sàng
    single_pregnancy: boolean
    twin_pregnancy_minor_complication: boolean
    ivf_pregnancy: boolean
    gestational_age_weeks: number
    ultrasound_date: Date | null
    crown_rump_length_crl: string
    nuchal_translucency: string
    maternal_weight: number
    prenatal_screening_risk_nt: string
    
    // Thực hiện xét nghiệm
    nipt_cnv: boolean
    nipt_24: boolean
    nipt_5: boolean
    nipt_4: boolean
    nipt_3: boolean
    torch_fetal_infection_risk_survey: boolean
    carrier_18_common_recessive_hereditary_disease_genes: boolean
    no_support_package_selected: boolean
}

const OCRProcessor = ({ selectedFile, onComplete, onBack }: OCRProcessorProps) => {
    const [isProcessing, setIsProcessing] = useState(true)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [ocrResult, setOcrResult] = useState<any>(null)
    const [imageUrl, setImageUrl] = useState<string>('')

    const form = useForm<FormValues>({
        initialValues: {
            // Thông tin cơ bản
            full_name: '',
            clinic: '',
            date_of_birth: null,
            doctor: '',
            sample_collection_date: null,
            sample_collection_time: '',
            phone: '',
            email: '',
            test_code: '',
            smoking: false,
            address: '',
            
            // Xét nghiệm yêu cầu
            breast_cancer_bcare: false,
            fifteen_hereditary_cancer_types_more_care: false,
            twenty_hereditary_cancer_types_vip_care: false,
            
            // Thông tin bệnh học
            clinical_diagnosis: '',
            disease_stage: '',
            pathology_result: '',
            tumor_location_size_differentiation: '',
            time_of_detection: '',
            treatment_received: '',
            
            // Loại bệnh phẩm
            biopsy_tissue_ffpe: false,
            blood_stl_ctdna: false,
            pleural_peritoneal_fluid: false,
            gpb_code: '',
            
            // Loại ung thư và panel xét nghiệm
            onco_81: false,
            onco_500_plus: false,
            lung_cancer: false,
            ovarian_cancer: false,
            colorectal_cancer: false,
            prostate_cancer: false,
            breast_cancer: false,
            cervical_cancer: false,
            gastric_cancer: false,
            pancreatic_cancer: false,
            thyroid_cancer: false,
            gastrointestinal_stromal_tumor_gist: false,
            
            // Thông tin lâm sàng
            single_pregnancy: false,
            twin_pregnancy_minor_complication: false,
            ivf_pregnancy: false,
            gestational_age_weeks: 0,
            ultrasound_date: null,
            crown_rump_length_crl: '',
            nuchal_translucency: '',
            maternal_weight: 0,
            prenatal_screening_risk_nt: '',
            
            // Thực hiện xét nghiệm
            nipt_cnv: false,
            nipt_24: false,
            nipt_5: false,
            nipt_4: false,
            nipt_3: false,
            torch_fetal_infection_risk_survey: false,
            carrier_18_common_recessive_hereditary_disease_genes: false,
            no_support_package_selected: false
        },
        validate: {
            full_name: (value) => (!value ? 'Họ tên là bắt buộc' : null),
            clinic: (value) => (!value ? 'PK/Bệnh viện là bắt buộc' : null)
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
            setProgress(100)
        } catch (err: any) {
            setError('Xử lý OCR không thành công. Vui lòng thử lại.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleSave = (values: FormValues) => {
        console.log('Form values to save:', values)

        const finalResult = {
            message: ocrResult.message,
            ocrResult: {
                ...ocrResult.ocrResult,
                editedData: values
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
                                Dang xử lý tài liệu
                            </Text>
                            <Text c='dimmed' mb='lg'>
                                Vui lòng đợi trong khi chúng tôi xử lý tài liệu của bạn. Quá trình này có thể mất vài
                                phút tùy thuộc vào kích thước và độ phức tạp của tài liệu.
                            </Text>

                            <Progress value={progress} size='lg' radius='md' animated color='blue' mb='md' />

                            <Text size='sm' c='blue.6' fw={500}>
                                {progress}% đã hoàn thành
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
                            Xử lý OCR không thành công
                        </Text>

                        <Group gap='md'>
                            <Button variant='outline' leftSection={<IconArrowLeft size='1rem' />} onClick={onBack}>
                                Quay lại
                            </Button>

                            <Button
                                variant='gradient'
                                gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                                leftSection={<IconScan size='1rem' />}
                                onClick={handleRetry}
                            >
                                Thử lại OCR
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
                        <Grid.Col span={{ base: 12, md: 4 }}>
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
                                            h={400}
                                            fallbackSrc='/placeholder-image.png'
                                        />
                                    ) : (
                                        <Paper
                                            p='xl'
                                            bg='gray.1'
                                            radius='md'
                                            h={400}
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
                        <Grid.Col span={{ base: 12, md: 8 }}>
                            <Stack gap='lg'>
                                {/* Thông tin cơ bản */}
                                <Card withBorder padding='md' radius='md'>
                                    <Title order={4} mb='md' c='blue.7'>
                                        Thông tin cơ bản
                                    </Title>
                                    <Grid>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Họ tên'
                                                placeholder='Nhập họ tên'
                                                required
                                                {...form.getInputProps('full_name')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='PK/Bệnh viện'
                                                placeholder='Nhập tên PK/Bệnh viện'
                                                required
                                                {...form.getInputProps('clinic')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <DatePickerInput
                                                label='Ngày sinh'
                                                placeholder='Chọn ngày sinh'
                                                {...form.getInputProps('date_of_birth')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Bác sĩ'
                                                placeholder='Nhập tên bác sĩ'
                                                {...form.getInputProps('doctor')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <DatePickerInput
                                                label='Ngày thu mẫu'
                                                placeholder='Chọn ngày thu mẫu'
                                                {...form.getInputProps('sample_collection_date')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Giờ thu mẫu'
                                                placeholder='Nhập giờ thu mẫu'
                                                {...form.getInputProps('sample_collection_time')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Số điện thoại'
                                                placeholder='Nhập số điện thoại'
                                                {...form.getInputProps('phone')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Email'
                                                placeholder='Nhập email'
                                                {...form.getInputProps('email')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Mã xét nghiệm'
                                                placeholder='Nhập mã xét nghiệm'
                                                {...form.getInputProps('test_code')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='Hút thuốc'
                                                {...form.getInputProps('smoking', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={12}>
                                            <Textarea
                                                label='Địa chỉ'
                                                placeholder='Nhập địa chỉ'
                                                {...form.getInputProps('address')}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Card>

                                {/* Xét nghiệm yêu cầu */}
                                <Card withBorder padding='md' radius='md'>
                                    <Title order={4} mb='md' c='blue.7'>
                                        Xét nghiệm yêu cầu
                                    </Title>
                                    <Stack gap='md'>
                                        <Checkbox
                                            label='Ung thư vú (BCARE)'
                                            {...form.getInputProps('breast_cancer_bcare', { type: 'checkbox' })}
                                        />
                                        <Checkbox
                                            label='15 loại ung thư di truyền (MORE CARE)'
                                            {...form.getInputProps('fifteen_hereditary_cancer_types_more_care', { type: 'checkbox' })}
                                        />
                                        <Checkbox
                                            label='20 loại ung thư di truyền (VIP CARE)'
                                            {...form.getInputProps('twenty_hereditary_cancer_types_vip_care', { type: 'checkbox' })}
                                        />
                                    </Stack>
                                </Card>

                                {/* Thông tin bệnh học */}
                                <Card withBorder padding='md' radius='md'>
                                    <Title order={4} mb='md' c='blue.7'>
                                        Thông tin bệnh học
                                    </Title>
                                    <Grid>
                                        <Grid.Col span={12}>
                                            <Textarea
                                                label='Chẩn đoán lâm sàng'
                                                placeholder='Nhập chẩn đoán lâm sàng'
                                                {...form.getInputProps('clinical_diagnosis')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Giai đoạn bệnh'
                                                placeholder='Nhập giai đoạn bệnh'
                                                {...form.getInputProps('disease_stage')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Kết quả giải phẫu'
                                                placeholder='Nhập kết quả giải phẫu'
                                                {...form.getInputProps('pathology_result')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={12}>
                                            <Textarea
                                                label='Vị trí, kích thước, độ biệt hóa của khối u'
                                                placeholder='Nhập thông tin khối u'
                                                {...form.getInputProps('tumor_location_size_differentiation')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Thời gian phát hiện'
                                                placeholder='Nhập thời gian phát hiện'
                                                {...form.getInputProps('time_of_detection')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Đã được điều trị gì'
                                                placeholder='Nhập phương pháp điều trị'
                                                {...form.getInputProps('treatment_received')}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Card>

                                {/* Loại bệnh phẩm */}
                                <Card withBorder padding='md' radius='md'>
                                    <Title order={4} mb='md' c='blue.7'>
                                        Loại bệnh phẩm
                                    </Title>
                                    <Grid>
                                        <Grid.Col span={4}>
                                            <Checkbox
                                                label='Mô sinh thiết/FFPE'
                                                {...form.getInputProps('biopsy_tissue_ffpe', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={4}>
                                            <Checkbox
                                                label='Máu (STL-ctDNA)'
                                                {...form.getInputProps('blood_stl_ctdna', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={4}>
                                            <Checkbox
                                                label='Dịch màng phổi/bụng'
                                                {...form.getInputProps('pleural_peritoneal_fluid', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={12}>
                                            <TextInput
                                                label='Mã số GPB'
                                                placeholder='Nhập mã số GPB'
                                                {...form.getInputProps('gpb_code')}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Card>

                                {/* Loại ung thư và panel xét nghiệm */}
                                <Card withBorder padding='md' radius='md'>
                                    <Title order={4} mb='md' c='blue.7'>
                                        Loại ung thư và panel xét nghiệm
                                    </Title>
                                    <Grid>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='Onco 81'
                                                {...form.getInputProps('onco_81', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='Onco500 Plus'
                                                {...form.getInputProps('onco_500_plus', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='Ung thư phổi'
                                                {...form.getInputProps('lung_cancer', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='Ung thư buồng trứng'
                                                {...form.getInputProps('ovarian_cancer', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='Ung thư đại trực tràng'
                                                {...form.getInputProps('colorectal_cancer', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='Ung thư tuyến tiền liệt'
                                                {...form.getInputProps('prostate_cancer', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='Ung thư vú'
                                                {...form.getInputProps('breast_cancer', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='Ung thư cổ tử cung'
                                                {...form.getInputProps('cervical_cancer', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='Ung thư dạ dày'
                                                {...form.getInputProps('gastric_cancer', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='Ung thư tụy'
                                                {...form.getInputProps('pancreatic_cancer', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='Ung thư tuyến giáp'
                                                {...form.getInputProps('thyroid_cancer', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='U mô đệm đường tiêu hóa (GIST)'
                                                {...form.getInputProps('gastrointestinal_stromal_tumor_gist', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Card>

                                {/* Thông tin lâm sàng */}
                                <Card withBorder padding='md' radius='md'>
                                    <Title order={4} mb='md' c='blue.7'>
                                        Thông tin lâm sàng
                                    </Title>
                                    <Grid>
                                        <Grid.Col span={4}>
                                            <Checkbox
                                                label='Đơn thai'
                                                {...form.getInputProps('single_pregnancy', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={4}>
                                            <Checkbox
                                                label='Song thai tiêu biến'
                                                {...form.getInputProps('twin_pregnancy_minor_complication', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={4}>
                                            <Checkbox
                                                label='Thai IVF'
                                                {...form.getInputProps('ivf_pregnancy', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <NumberInput
                                                label='Tuần thai'
                                                placeholder='Nhập tuần thai'
                                                min={0}
                                                {...form.getInputProps('gestational_age_weeks')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <DatePickerInput
                                                label='Ngày siêu âm'
                                                placeholder='Chọn ngày siêu âm'
                                                {...form.getInputProps('ultrasound_date')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Chiều dài đầu mông'
                                                placeholder='Nhập chiều dài đầu mông'
                                                {...form.getInputProps('crown_rump_length_crl')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Độ mờ da'
                                                placeholder='Nhập độ mờ da'
                                                {...form.getInputProps('nuchal_translucency')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <NumberInput
                                                label='Cân nặng thai phụ'
                                                placeholder='Nhập cân nặng thai phụ'
                                                min={0}
                                                {...form.getInputProps('maternal_weight')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Nguy cơ sàng lọc trước'
                                                placeholder='Nhập nguy cơ sàng lọc'
                                                {...form.getInputProps('prenatal_screening_risk_nt')}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Card>

                                {/* Thực hiện xét nghiệm */}
                                <Card withBorder padding='md' radius='md'>
                                    <Title order={4} mb='md' c='blue.7'>
                                        Thực hiện xét nghiệm
                                    </Title>
                                    <Grid>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='NIPT CNV'
                                                {...form.getInputProps('nipt_cnv', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='NIPT 24'
                                                {...form.getInputProps('nipt_24', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='NIPT 5'
                                                {...form.getInputProps('nipt_5', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='NIPT 4'
                                                {...form.getInputProps('nipt_4', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Checkbox
                                                label='NIPT 3'
                                                {...form.getInputProps('nipt_3', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={12}>
                                            <Checkbox
                                                label='Torch: khảo sát nguy cơ nhiễm trùng bào thai gây dị tật'
                                                {...form.getInputProps('torch_fetal_infection_risk_survey', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={12}>
                                            <Checkbox
                                                label='18 gen gây bệnh di truyền lặn phổ biến ở người VN (Thalassemia, suy-cường-u giáp, thiếu G6PD, Pompe, Wilson, CF...)'
                                                {...form.getInputProps('carrier_18_common_recessive_hereditary_disease_genes', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={12}>
                                            <Checkbox
                                                label='Không chọn gói hỗ trợ'
                                                {...form.getInputProps('no_support_package_selected', { type: 'checkbox' })}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Card>

                                {/* Complete Button at the bottom */}
                                <Card withBorder padding='md' radius='md' bg='green.0'>
                                    <Group justify='space-between' align='center'>
                                        <div>
                                            <Text fw={600} size='lg' c='green.7'>
                                                Sẵn sàng gửi?
                                            </Text>
                                            <Text size='sm' c='dimmed'>
                                                Kiểm tra lại tất cả thông tin và nhấn Hoàn thành để lưu kết quả OCR
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
                                            Hoàn thành
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
