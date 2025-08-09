export interface FormValues {
    // Thông tin cơ bản (chung cho tất cả)
    form_type: string // Tên loại phiếu
    full_name: string
    clinic: string
    date_of_birth: Date | null
    gender: string
    doctor: string
    doctor_phone: string // Số điện thoại bác sỹ (cho phiếu 1)
    sample_collection_date: Date | null
    sample_collection_time: string
    phone: string
    email: string
    test_code: string
    smoking: boolean // Chỉ cho phiếu 2
    address: string
    sample_collection_location: string // Nơi thu mẫu (cho phiếu 3)

    // Xét nghiệm yêu cầu (chỉ phiếu 1) - Radio group
    cancer_screening_package: string // Radio group: 'bcare' | 'more_care' | 'vip_care' | ''

    // Thông tin bệnh học (chỉ phiếu 2)
    clinical_diagnosis: string
    disease_stage: string
    pathology_result: string
    tumor_location_size_differentiation: string
    time_of_detection: string
    treatment_received: string

    // Loại bệnh phẩm (chỉ phiếu 2)
    specimen_type: string // Radio group: 'biopsy_tissue_ffpe' | 'blood_stl_ctdna' | 'pleural_peritoneal_fluid' | ''
    biopsy_tissue_ffpe: boolean
    blood_stl_ctdna: boolean
    pleural_peritoneal_fluid: boolean
    gpb_code: string

    // Loại ung thư và panel xét nghiệm (chỉ phiếu 2) - Radio group
    cancer_panel: string // Radio group: 'onco_81' | 'onco_500_plus' | 'lung_cancer' | etc. | ''

    // Thông tin lâm sàng (chỉ phiếu 3)
    single_pregnancy: boolean
    twin_pregnancy_minor_complication: boolean
    ivf_pregnancy: boolean
    gestational_age_weeks: number
    ultrasound_date: Date | null
    crown_rump_length_crl: string
    nuchal_translucency: string
    maternal_height: number
    maternal_weight: number
    prenatal_screening_risk_nt: string

    // Thực hiện xét nghiệm (chỉ phiếu 3) - Radio group
    nipt_package: string // Radio group: 'nipt_cnv' | 'nipt_24' | 'nipt_5' | 'nipt_4' | 'nipt_3' | ''

    // Lựa chọn ưu đãi kèm theo (chỉ khi chọn NIPT24, NIPT 5, NIPT CNV) - Radio group
    support_package: string // Radio group: 'torch' | 'carrier' | 'no_support' | ''
}

export const formTypeOptions = [
    {
        value: 'hereditary_cancer',
        label: 'Phiếu đồng thuận thực hiện xét nghiệm tầm soát nguy cơ ung thư di truyền'
    },
    {
        value: 'gene_mutation',
        label: 'Phiếu xét nghiệm đột biến gen'
    },
    {
        value: 'prenatal_screening',
        label: 'Phiếu đồng thuận thực hiện xét nghiệm sàng lọc tiền sinh không xâm lấn'
    }
]

export const genderOptions = [
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'other', label: 'Khác' }
]

export const cancerScreeningPackageOptions = [
    { value: 'breast_cancer_bcare', label: 'Ung thư vú (BCARE)' },
    { value: '15_hereditary_cancer_types_more_care', label: '15 loại ung thư di truyền (MORE CARE)' },
    { value: '20_hereditary_cancer_types_vip_care', label: '20 loại ung thư di truyền (VIP CARE)' }
]

export const niptPackageOptions = [
    { value: 'NIPT CNV', label: 'NIPT CNV' },
    { value: 'NIPT 24', label: 'NIPT 24' },
    { value: 'NIPT 5', label: 'NIPT 5' },
    { value: 'NIPT 4', label: 'NIPT 4' },
    { value: 'NIPT 3', label: 'NIPT 3' }
]

export const supportPackageOptions = [
    { value: 'torch', label: 'Torch: khảo sát nguy cơ nhiễm trùng bào thai gây dị tật' },
    {
        value: 'carrier',
        label: 'Carrier: Nhóm 18 gen gây bệnh di truyền lặn phổ biến ở người VN (Thalassemia, suy-cường-u giáp, thiếu G6PD, Pompe, Wilson, CF⋯)'
    },
    { value: 'no_support', label: 'Không chọn gói hỗ trợ' }
]

export const cancerPanelOptions = [
    { value: 'Onco81', label: 'Onco 81' },
    { value: 'Onco500', label: 'Onco500 Plus' },
    { value: 'lung_cancer', label: 'Ung thư phổi' },
    { value: 'ovarian_cancer', label: 'Ung thư buồng trứng' },
    { value: 'colorectal_cancer', label: 'Ung thư đại trực tràng' },
    { value: 'prostate_cancer', label: 'Ung thư tuyến tiền liệt' },
    { value: 'breast_cancer', label: 'Ung thư vú' },
    { value: 'cervical_cancer', label: 'Ung thư cổ tử cung' },
    { value: 'gastric_cancer', label: 'Ung thư dạ dày' },
    { value: 'pancreatic_cancer', label: 'Ung thư tụy' },
    { value: 'thyroid_cancer', label: 'Ung thư tuyến giáp' },
    { value: 'gastrointestinal_stromal_tumor_gist', label: 'U mô đệm đường tiêu hóa (GIST)' }
]

export const sampleTypeOptions = [
    { value: 'biopsy_tissue_ffpe', label: 'Mô sinh thiết FFPE' },
    { value: 'blood_stl_ctdna', label: 'Máu STL ctDNA' },
    { value: 'pleural_peritoneal_fluid', label: 'Dịch màng phổi/phúc mạc' },
    { value: 'blood', label: 'Máu' },
    { value: 'tissue', label: 'Mô' },
    { value: 'plasma', label: 'Huyết tương' },
    { value: 'serum', label: 'Huyết thanh' },
    { value: 'urine', label: 'Nước tiểu' },
    { value: 'saliva', label: 'Nước bọt' }
]

export const getDefaultFormValues = (): FormValues => ({
    form_type: '',
    full_name: '',
    clinic: '',
    date_of_birth: null,
    gender: '',
    doctor: '',
    doctor_phone: '',
    sample_collection_date: null,
    sample_collection_time: '',
    phone: '',
    email: '',
    test_code: '',
    smoking: false,
    address: '',
    sample_collection_location: '',
    cancer_screening_package: '',
    clinical_diagnosis: '',
    disease_stage: '',
    pathology_result: '',
    tumor_location_size_differentiation: '',
    time_of_detection: '',
    treatment_received: '',
    specimen_type: '',
    biopsy_tissue_ffpe: false,
    blood_stl_ctdna: false,
    pleural_peritoneal_fluid: false,
    gpb_code: '',
    cancer_panel: '',
    single_pregnancy: false,
    twin_pregnancy_minor_complication: false,
    ivf_pregnancy: false,
    gestational_age_weeks: 0,
    ultrasound_date: null,
    crown_rump_length_crl: '',
    nuchal_translucency: '',
    maternal_height: 0,
    maternal_weight: 0,
    prenatal_screening_risk_nt: '',
    nipt_package: '',
    support_package: ''
})

export const formValidationRules = {
    full_name: (value: string) => (value.length < 2 ? 'Tên phải có ít nhất 2 ký tự' : null),
    phone: (value: string) => {
        const phoneRegex = /^[0-9]{10,11}$/
        return phoneRegex.test(value) ? null : 'Số điện thoại không hợp lệ'
    },
    email: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value) ? null : 'Email không hợp lệ'
    }
}



