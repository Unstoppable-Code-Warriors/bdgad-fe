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
    Checkbox,
    Select,
    Radio
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { IconScan, IconArrowLeft, IconCheck, IconPhoto } from '@tabler/icons-react'
import type { FileWithPath } from '@mantine/dropzone'
import { staffService } from '@/services/function/staff'
import {
    FormType,
    formTypeOptions,
    getDefaultFormValues,
    formValidationRules,
    genderOptions,
    niptPackageOptions,
    cancerScreeningPackageOptions,
    supportPackageOptions,
    cancerPanelOptions
} from './Form'
import type { FormValues } from './Form'

interface OCRProcessorProps {
    selectedFile: FileWithPath
    onComplete: (data: any) => void
    onBack: () => void
}

const OCRProcessor = ({ selectedFile, onComplete, onBack }: OCRProcessorProps) => {
    const [isProcessing, setIsProcessing] = useState(true)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [ocrResult, setOcrResult] = useState<any>(null)
    const [imageUrl, setImageUrl] = useState<string>('')

    const form = useForm<FormValues>({
        initialValues: getDefaultFormValues(),
        validate: formValidationRules
    })

    const currentFormType = form.values.form_type

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

    useEffect(() => {
        handleOCR()
    }, [])

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
                                Đang xử lý tài liệu
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

    // Results view with conditional form fields
    if (ocrResult) {
        return (
            <form onSubmit={form.onSubmit(handleSave)}>
                <Stack gap='lg' mt='xl'>
                    <Paper p='md' withBorder>
                        <Group justify='space-between' align='center'>
                            <Group gap='sm'>
                                <IconCheck size='1.5rem' color='var(--mantine-color-green-6)' />
                                <Text size='xl' fw={600} c='green.6'>
                                    Xử lý OCR thành công
                                </Text>
                            </Group>

                            <Group gap='md'>
                                <Button variant='outline' leftSection={<IconArrowLeft size='1rem' />} onClick={onBack}>
                                    Quay lại
                                </Button>
                                <Button variant='outline' color='orange' onClick={handleRetry}>
                                    Thử lại OCR
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
                                            Ảnh ban đầu
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
                                {/* Chọn loại phiếu */}
                                <Card withBorder padding='md' radius='md' bg='blue.0'>
                                    <Title order={4} mb='md' c='blue.7'>
                                        Chọn loại phiếu
                                    </Title>
                                    <Select
                                        label='Loại phiếu'
                                        placeholder='Chọn loại phiếu'
                                        data={formTypeOptions}
                                        required
                                        {...form.getInputProps('form_type')}
                                    />
                                </Card>

                                {/* Thông tin cơ bản - Luôn hiển thị */}
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
                                            <Select
                                                label='Giới tính'
                                                placeholder='Chọn giới tính'
                                                data={genderOptions}
                                                {...form.getInputProps('gender')}
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

                                        {/* Số điện thoại bác sỹ - chỉ phiếu 1 */}
                                        {currentFormType === FormType.HEREDITARY_CANCER && (
                                            <Grid.Col span={6}>
                                                <TextInput
                                                    label='Số điện thoại bác sỹ'
                                                    placeholder='Nhập SĐT bác sỹ'
                                                    {...form.getInputProps('doctor_phone')}
                                                />
                                            </Grid.Col>
                                        )}

                                        {/* Ngày thu mẫu - cho phiếu 1 và 3 */}
                                        {(currentFormType === FormType.HEREDITARY_CANCER ||
                                            currentFormType === FormType.PRENATAL_SCREENING) && (
                                            <Grid.Col span={6}>
                                                <DatePickerInput
                                                    label='Ngày thu mẫu'
                                                    placeholder='Chọn ngày thu mẫu'
                                                    {...form.getInputProps('sample_collection_date')}
                                                />
                                            </Grid.Col>
                                        )}

                                        {/* Giờ thu mẫu - chỉ phiếu 3 */}
                                        {currentFormType === FormType.PRENATAL_SCREENING && (
                                            <Grid.Col span={6}>
                                                <TextInput
                                                    label='Giờ thu mẫu'
                                                    placeholder='Nhập giờ thu mẫu'
                                                    {...form.getInputProps('sample_collection_time')}
                                                />
                                            </Grid.Col>
                                        )}

                                        <Grid.Col span={6}>
                                            <TextInput
                                                label='Số điện thoại'
                                                placeholder='Nhập số điện thoại'
                                                {...form.getInputProps('phone')}
                                            />
                                        </Grid.Col>

                                        {/* Email - cho phiếu 2 và 3 */}
                                        {(currentFormType === FormType.GENE_MUTATION ||
                                            currentFormType === FormType.PRENATAL_SCREENING) && (
                                            <Grid.Col span={6}>
                                                <TextInput
                                                    label='Email'
                                                    placeholder='Nhập email'
                                                    {...form.getInputProps('email')}
                                                />
                                            </Grid.Col>
                                        )}

                                        {/* Mã xét nghiệm - cho phiếu 1 và 2 */}
                                        {(currentFormType === FormType.HEREDITARY_CANCER ||
                                            currentFormType === FormType.GENE_MUTATION) && (
                                            <Grid.Col span={6}>
                                                <TextInput
                                                    label='Mã xét nghiệm'
                                                    placeholder='Nhập mã xét nghiệm'
                                                    {...form.getInputProps('test_code')}
                                                />
                                            </Grid.Col>
                                        )}

                                        {/* Hút thuốc - chỉ phiếu 2 */}
                                        {currentFormType === FormType.GENE_MUTATION && (
                                            <Grid.Col span={6}>
                                                <Checkbox
                                                    label='Hút thuốc'
                                                    {...form.getInputProps('smoking', { type: 'checkbox' })}
                                                />
                                            </Grid.Col>
                                        )}

                                        {/* Nơi thu mẫu - chỉ phiếu 3 */}
                                        {currentFormType === FormType.PRENATAL_SCREENING && (
                                            <Grid.Col span={6}>
                                                <TextInput
                                                    label='Nơi thu mẫu'
                                                    placeholder='Nhập nơi thu mẫu'
                                                    {...form.getInputProps('sample_collection_location')}
                                                />
                                            </Grid.Col>
                                        )}

                                        <Grid.Col span={12}>
                                            <Textarea
                                                label='Địa chỉ'
                                                placeholder='Nhập địa chỉ'
                                                {...form.getInputProps('address')}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Card>

                                {/* Xét nghiệm yêu cầu - chỉ phiếu 1 */}
                                {currentFormType === FormType.HEREDITARY_CANCER && (
                                    <Card withBorder padding='md' radius='md'>
                                        <Title order={4} mb='md' c='blue.7'>
                                            Xét nghiệm yêu cầu
                                        </Title>
                                        <Radio.Group
                                            label='Chọn gói xét nghiệm'
                                            description='Lựa chọn 1 trong các gói xét nghiệm ung thư di truyền'
                                            {...form.getInputProps('cancer_screening_package')}
                                        >
                                            <Stack gap='md' mt='sm'>
                                                {cancerScreeningPackageOptions.map((option) => (
                                                    <Radio
                                                        key={option.value}
                                                        value={option.value}
                                                        label={option.label}
                                                    />
                                                ))}
                                            </Stack>
                                        </Radio.Group>
                                    </Card>
                                )}

                                {/* Thông tin bệnh học - chỉ phiếu 2 */}
                                {currentFormType === FormType.GENE_MUTATION && (
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
                                )}

                                {/* Loại bệnh phẩm - chỉ phiếu 2 */}
                                {currentFormType === FormType.GENE_MUTATION && (
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
                                                    {...form.getInputProps('pleural_peritoneal_fluid', {
                                                        type: 'checkbox'
                                                    })}
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
                                )}

                                {/* Loại ung thư và panel xét nghiệm - chỉ phiếu 2 */}
                                {currentFormType === FormType.GENE_MUTATION && (
                                    <Card withBorder padding='md' radius='md'>
                                        <Title order={4} mb='md' c='blue.7'>
                                            Loại ung thư và panel xét nghiệm
                                        </Title>
                                        <Radio.Group
                                            label='Chọn loại ung thư và panel xét nghiệm'
                                            description='Lựa chọn 1 trong các panel xét nghiệm ung thư'
                                            {...form.getInputProps('cancer_panel')}
                                        >
                                            <Stack gap='md' mt='sm'>
                                                {cancerPanelOptions.map((option) => (
                                                    <Radio
                                                        key={option.value}
                                                        value={option.value}
                                                        label={option.label}
                                                    />
                                                ))}
                                            </Stack>
                                        </Radio.Group>
                                    </Card>
                                )}

                                {/* Thông tin lâm sàng - chỉ phiếu 3 */}
                                {currentFormType === FormType.PRENATAL_SCREENING && (
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
                                                    {...form.getInputProps('twin_pregnancy_minor_complication', {
                                                        type: 'checkbox'
                                                    })}
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
                                                    label='Chiều cao thai phụ (cm)'
                                                    placeholder='Nhập chiều cao thai phụ'
                                                    min={0}
                                                    {...form.getInputProps('maternal_height')}
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={6}>
                                                <NumberInput
                                                    label='Cân nặng thai phụ (kg)'
                                                    placeholder='Nhập cân nặng thai phụ'
                                                    min={0}
                                                    {...form.getInputProps('maternal_weight')}
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={12}>
                                                <TextInput
                                                    label='Nguy cơ sàng lọc trước'
                                                    placeholder='Nhập nguy cơ sàng lọc'
                                                    {...form.getInputProps('prenatal_screening_risk_nt')}
                                                />
                                            </Grid.Col>
                                        </Grid>
                                    </Card>
                                )}

                                {/* Thực hiện xét nghiệm - chỉ phiếu 3 */}
                                {currentFormType === FormType.PRENATAL_SCREENING && (
                                    <>
                                        <Card withBorder padding='md' radius='md'>
                                            <Title order={4} mb='md' c='blue.7'>
                                                Thực hiện xét nghiệm
                                            </Title>
                                            <Radio.Group
                                                label='Chọn gói NIPT'
                                                description='Lựa chọn 1 trong các gói NIPT'
                                                {...form.getInputProps('nipt_package')}
                                            >
                                                <Stack gap='sm' mt='sm'>
                                                    {niptPackageOptions.map((option) => (
                                                        <Radio
                                                            key={option.value}
                                                            value={option.value}
                                                            label={option.label}
                                                        />
                                                    ))}
                                                </Stack>
                                            </Radio.Group>
                                        </Card>

                                        {/* Chỉ hiển thị ưu đãi kèm theo khi chọn NIPT24, NIPT 5, hoặc NIPT CNV */}
                                        {['nipt_24', 'nipt_5', 'nipt_cnv'].includes(form.values.nipt_package) && (
                                            <Card withBorder padding='md' radius='md'>
                                                <Title order={4} mb='md' c='blue.7'>
                                                    Lựa chọn ưu đãi kèm theo
                                                </Title>
                                                <Text size='sm' c='dimmed' mb='md'>
                                                    Lựa chọn 1 trong các ưu đãi khi sử dụng các gói NIPT24, NIPT 5, NIPT
                                                    CNV
                                                </Text>
                                                <Radio.Group
                                                    label='Chọn ưu đãi kèm theo'
                                                    {...form.getInputProps('support_package')}
                                                >
                                                    <Stack gap='md' mt='sm'>
                                                        {supportPackageOptions.map((option) => (
                                                            <Radio
                                                                key={option.value}
                                                                value={option.value}
                                                                label={option.label}
                                                            />
                                                        ))}
                                                    </Stack>
                                                </Radio.Group>
                                            </Card>
                                        )}
                                    </>
                                )}

                                {/* Complete Button */}
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
