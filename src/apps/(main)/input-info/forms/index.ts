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

import type { CommonOCRRes } from '@/types/ocr-file'
import type { EditedOCRRes } from '../types'

export const mapOCRToFormValues = (ocrResult: CommonOCRRes<EditedOCRRes> | undefined): FormValues => {
    const defaultValues = getDefaultFormValues()

    if (!ocrResult) return defaultValues

    // Handle nested ocrResult structure
    const data = ocrResult.ocrResult

    if (!data) return defaultValues

    // If there's edited data, prioritize that
    if (data.editedData) {
        return data.editedData
    }

    // Helper function to safely parse dates
    const safeDateParse = (dateValue: any): Date | null => {
        if (!dateValue) return null

        // If it's already a Date object, check if it's valid
        if (dateValue instanceof Date) {
            return isNaN(dateValue.getTime()) ? null : dateValue
        }

        // If it's a string, try to parse it
        if (typeof dateValue === 'string') {
            // Skip obviously invalid date strings
            if (dateValue.toLowerCase().includes('invalid') || dateValue === 'Invalid Date {}') {
                return null
            }

            const parsed = new Date(dateValue)
            return isNaN(parsed.getTime()) ? null : parsed
        }

        return null
    }

    // Extract basic information
    const basicInfo: Partial<FormValues> = {
        form_type: data.document_name || '',
        full_name: data.full_name || '',
        clinic: data.clinic || '',
        date_of_birth: safeDateParse(data.date_of_birth),
        gender: data.gender || '',
        doctor: data.doctor || '',
        doctor_phone: data.doctor_phone || '',
        sample_collection_date: safeDateParse(data.sample_collection_date),
        sample_collection_time: data.sample_collection_time || '',
        phone: data.phone || '',
        email: data.email || '',
        test_code: data['Test code'] || '', // Note: 'Test code' with space
        smoking: typeof data.smoking === 'boolean' ? data.smoking : false,
        address: data.address || ''
    }

    // Extract gene mutation testing info if available
    const geneMutationInfo: Partial<FormValues> = {}
    if (data.gene_mutation_testing?.clinical_information) {
        const clinicalInfo = data.gene_mutation_testing.clinical_information
        geneMutationInfo.clinical_diagnosis = clinicalInfo.clinical_diagnosis || ''
        geneMutationInfo.disease_stage = clinicalInfo.disease_stage || ''
        geneMutationInfo.pathology_result = clinicalInfo.pathology_result || ''
        geneMutationInfo.tumor_location_size_differentiation = clinicalInfo.tumor_location_size_differentiation || ''
        geneMutationInfo.time_of_detection = clinicalInfo.time_of_detection || ''
        geneMutationInfo.treatment_received = clinicalInfo.treatment_received || ''
    }

    // Extract specimen info if available
    if (data.gene_mutation_testing?.specimen_and_test_information) {
        const specimenInfo = data.gene_mutation_testing.specimen_and_test_information
        if (specimenInfo.specimen_type) {
            // Map individual boolean fields to the radio group value
            if (specimenInfo.specimen_type.biopsy_tissue_ffpe) {
                geneMutationInfo.specimen_type = 'biopsy_tissue_ffpe'
            } else if (specimenInfo.specimen_type.blood_stl_ctdna) {
                geneMutationInfo.specimen_type = 'blood_stl_ctdna'
            } else if (specimenInfo.specimen_type.pleural_peritoneal_fluid) {
                geneMutationInfo.specimen_type = 'pleural_peritoneal_fluid'
            }

            // Keep the original boolean fields for backward compatibility
            geneMutationInfo.biopsy_tissue_ffpe = specimenInfo.specimen_type.biopsy_tissue_ffpe || false
            geneMutationInfo.blood_stl_ctdna = specimenInfo.specimen_type.blood_stl_ctdna || false
            geneMutationInfo.pleural_peritoneal_fluid = specimenInfo.specimen_type.pleural_peritoneal_fluid || false
        }
        geneMutationInfo.gpb_code = specimenInfo.gpb_code || ''

        // Extract cancer panel selection
        if (specimenInfo.cancer_type_and_test_panel_please_tick_one) {
            const panels = specimenInfo.cancer_type_and_test_panel_please_tick_one

            // Create reverse mapping from OCR keys to form values
            const ocrToFormMapping: { [key: string]: string } = {
                onco_81: 'Onco81',
                onco_500_plus: 'Onco500',
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

            // Find the selected panel
            for (const [ocrKey, panel] of Object.entries(panels)) {
                if (panel && typeof panel === 'object' && 'is_selected' in panel && panel.is_selected) {
                    const formValue = ocrToFormMapping[ocrKey]
                    if (formValue) {
                        geneMutationInfo.cancer_panel = formValue
                        break
                    }
                }
            }
        }
    }

    // Extract prenatal testing info if available
    const prenatalInfo: Partial<FormValues> = {}
    if (data.non_invasive_prenatal_testing?.clinical_information) {
        const clinicalInfo = data.non_invasive_prenatal_testing.clinical_information
        prenatalInfo.single_pregnancy = clinicalInfo.single_pregnancy?.yes || false
        prenatalInfo.twin_pregnancy_minor_complication = clinicalInfo.twin_pregnancy_minor_complication?.yes || false
        prenatalInfo.ivf_pregnancy = clinicalInfo.ivf_pregnancy?.yes || false
        prenatalInfo.gestational_age_weeks = parseInt(clinicalInfo.gestational_age_weeks || '0') || 0
        prenatalInfo.ultrasound_date = safeDateParse(clinicalInfo.ultrasound_date)
        prenatalInfo.crown_rump_length_crl = clinicalInfo.crown_rump_length_crl || ''
        prenatalInfo.nuchal_translucency = clinicalInfo.nuchal_translucency || ''
        prenatalInfo.maternal_height = parseFloat(clinicalInfo.maternal_height || '0') || 0
        prenatalInfo.maternal_weight = parseFloat(clinicalInfo.maternal_weight || '0') || 0
        prenatalInfo.prenatal_screening_risk_nt = clinicalInfo.prenatal_screening_risk_nt || ''
    }

    // Extract NIPT package selection from test_options
    if (
        data.non_invasive_prenatal_testing?.test_options &&
        Array.isArray(data.non_invasive_prenatal_testing.test_options)
    ) {
        const testOptions = data.non_invasive_prenatal_testing.test_options

        // Find the selected NIPT package
        const selectedOption = testOptions.find(
            (option) => option && typeof option === 'object' && 'is_selected' in option && option.is_selected
        )
        if (selectedOption && 'package_name' in selectedOption) {
            prenatalInfo.nipt_package = selectedOption.package_name
        }
    }

    // Extract support package selection
    if (data.additional_selection_notes) {
        const supportNotes = data.additional_selection_notes
        if (supportNotes.torch_fetal_infection_risk_survey) {
            prenatalInfo.support_package = 'torch'
        } else if (
            supportNotes.carrier_18_common_recessive_hereditary_disease_genes_in_vietnamese_thalassemia_hypo_hyper_thyroidism_g6pd_deficiency_pompe_wilson_cf
        ) {
            prenatalInfo.support_package = 'carrier'
        } else if (supportNotes.no_support_package_selected) {
            prenatalInfo.support_package = 'no_support'
        }
    }

    // Extract hereditary cancer screening package selection
    const hereditaryInfo: Partial<FormValues> = {}
    if (data.hereditary_cancer) {
        const cancerScreening = data.hereditary_cancer
        if (cancerScreening.breast_cancer_bcare?.is_selected) {
            hereditaryInfo.cancer_screening_package = 'breast_cancer_bcare'
        } else if (cancerScreening['15_hereditary_cancer_types_more_care']?.is_selected) {
            hereditaryInfo.cancer_screening_package = '15_hereditary_cancer_types_more_care'
        } else if (cancerScreening['20_hereditary_cancer_types_vip_care']?.is_selected) {
            hereditaryInfo.cancer_screening_package = '20_hereditary_cancer_types_vip_care'
        }
    }

    return {
        ...defaultValues,
        ...basicInfo,
        ...geneMutationInfo,
        ...prenatalInfo,
        ...hereditaryInfo
    }
}
