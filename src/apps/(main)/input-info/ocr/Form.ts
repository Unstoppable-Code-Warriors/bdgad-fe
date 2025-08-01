export enum FormType {
    NON_INVASIVE_PRENATAL_TESTING = 'non_invasive_prenatal_testing',
    HEREDITARY_CANCER = 'hereditary_cancer',
    GENE_MUTATION_TESTING = 'gene_mutation_testing'
}

export const formTypeOptions = [
    { 
        value: FormType.HEREDITARY_CANCER, 
        label: 'Phiếu đồng thuận thực hiện xét nghiệm tầm soát nguy cơ ung thư di truyền' 
    },
    { 
        value: FormType.GENE_MUTATION_TESTING, 
        label: 'Phiếu xét nghiệm đột biến gen' 
    },
    { 
        value: FormType.NON_INVASIVE_PRENATAL_TESTING, 
        label: 'Phiếu đồng thuận thực hiện xét nghiệm sàng lọc tiền sinh không xâm lấn' 
    }
]

export interface FormValues {
    // Thông tin cơ bản (chung cho tất cả)
    form_type: string  // Tên loại phiếu
    full_name: string
    clinic: string
    date_of_birth: Date | null
    gender: string 
    doctor: string
    doctor_phone: string  // Số điện thoại bác sỹ (cho phiếu 1)
    sample_collection_date: Date | null
    sample_collection_time: string
    phone: string
    email: string
    test_code: string
    smoking: boolean  // Chỉ cho phiếu 2
    address: string
    sample_collection_location: string  // Nơi thu mẫu (cho phiếu 3)
    
    // Xét nghiệm yêu cầu (chỉ phiếu 1) - Radio group
    cancer_screening_package: string  // Radio group: 'bcare' | 'more_care' | 'vip_care' | ''
    
    // Thông tin bệnh học (chỉ phiếu 2)
    clinical_diagnosis: string
    disease_stage: string
    pathology_result: string
    tumor_location_size_differentiation: string
    time_of_detection: string
    treatment_received: string
    
    // Loại bệnh phẩm (chỉ phiếu 2)
    biopsy_tissue_ffpe: boolean
    blood_stl_ctdna: boolean
    pleural_peritoneal_fluid: boolean
    gpb_code: string
    
    // Loại ung thư và panel xét nghiệm (chỉ phiếu 2) - Radio group
    cancer_panel: string  // Radio group: 'onco_81' | 'onco_500_plus' | 'lung_cancer' | etc. | ''
    
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
    nipt_package: string  // Radio group: 'nipt_cnv' | 'nipt_24' | 'nipt_5' | 'nipt_4' | 'nipt_3' | ''
    
    // Lựa chọn ưu đãi kèm theo (chỉ khi chọn NIPT24, NIPT 5, NIPT CNV) - Radio group
    support_package: string  // Radio group: 'torch' | 'carrier' | 'no_support' | ''
}

export const cancerScreeningPackageOptions = [
    { value: 'bcare', label: 'Ung thư vú (BCARE)' },
    { value: 'more_care', label: '15 loại ung thư di truyền (MORE CARE)' },
    { value: 'vip_care', label: '20 loại ung thư di truyền (VIP CARE)' }
]

export const niptPackageOptions = [
    { value: 'nipt_cnv', label: 'NIPT CNV' },
    { value: 'nipt_24', label: 'NIPT 24' },
    { value: 'nipt_5', label: 'NIPT 5' },
    { value: 'nipt_4', label: 'NIPT 4' },
    { value: 'nipt_3', label: 'NIPT 3' }
]

export const supportPackageOptions = [
    { value: 'torch', label: 'Torch: khảo sát nguy cơ nhiễm trùng bào thai gây dị tật' },
    { value: 'carrier', label: 'Carrier: Nhóm 18 gen gây bệnh di truyền lặn phổ biến ở người VN (Thalassemia, suy-cường-u giáp, thiếu G6PD, Pompe, Wilson, CF⋯)' },
    { value: 'no_support', label: 'Không chọn gói hỗ trợ' }
]

// Cancer panel options for radio group (phiếu 2)
export const cancerPanelOptions = [
    { value: 'onco_81', label: 'Onco 81' },
    { value: 'onco_500_plus', label: 'Onco500 Plus' },
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

// Default form values
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
    
    // Xét nghiệm yêu cầu - Radio group
    cancer_screening_package: '',
    
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
    
    // Loại ung thư và panel xét nghiệm - Radio group
    cancer_panel: '',
    
    // Thông tin lâm sàng
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
    
    // Thực hiện xét nghiệm - Radio group
    nipt_package: '',
    
    // Lựa chọn ưu đãi kèm theo - Radio group
    support_package: ''
})

// Form validation rules
export const formValidationRules = {
    full_name: (value: string) => (!value ? 'Họ tên là bắt buộc' : null),
    clinic: (value: string) => (!value ? 'PK/Bệnh viện là bắt buộc' : null),
    form_type: (value: string) => (!value ? 'Loại phiếu là bắt buộc' : null)
}

// Gender options
export const genderOptions = [
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'other', label: 'Khác' }
]

// Function to map OCR result to FormValues for all form types
export const mapOCRToFormValues = (ocrResult: any): FormValues => {
    const formValues = getDefaultFormValues();
    
    if (!ocrResult) return formValues;

    // Set form type based on document_name
    if (ocrResult.document_name === 'gene_mutation_testing') {
        formValues.form_type = FormType.GENE_MUTATION_TESTING;
    } else if (ocrResult.document_name === 'non_invasive_prenatal_testing') {
        formValues.form_type = FormType.NON_INVASIVE_PRENATAL_TESTING;
    } else if (ocrResult.document_name === 'hereditary_cancer') {
        formValues.form_type = FormType.HEREDITARY_CANCER;
    }

    // Basic information mapping (common for all forms)
    formValues.full_name = ocrResult.full_name || '';
    formValues.clinic = ocrResult.clinic || '';
    formValues.doctor = ocrResult.doctor || '';
    formValues.doctor_phone = (ocrResult.doctor_phone && ocrResult.doctor_phone !== 'NA') ? ocrResult.doctor_phone : '';
    formValues.phone = (ocrResult.phone && ocrResult.phone !== 'NA') ? ocrResult.phone : '';
    formValues.email = (ocrResult.email && ocrResult.email !== 'NA') ? ocrResult.email : '';
    formValues.address = ocrResult.address || '';

    // Date mapping
    if (ocrResult.date_of_birth) {
        try {
            formValues.date_of_birth = new Date(ocrResult.date_of_birth);
        } catch (e) {
            formValues.date_of_birth = null;
        }
    }

    if (ocrResult.sample_collection_date) {
        try {
            formValues.sample_collection_date = new Date(ocrResult.sample_collection_date);
        } catch (e) {
            formValues.sample_collection_date = null;
        }
    }

    formValues.sample_collection_time = (ocrResult.sample_collection_time && ocrResult.sample_collection_time !== 'NA') ? ocrResult.sample_collection_time : '';

    // Gender mapping
    if (ocrResult.gender) {
        const gender = ocrResult.gender.toLowerCase();
        if (gender.includes('male') && !gender.includes('female')) {
            formValues.gender = 'male';
        } else if (gender.includes('female')) {
            formValues.gender = 'female';
        } else {
            formValues.gender = 'other';
        }
    }

    // Test code mapping
    formValues.test_code = (ocrResult['Test code'] && ocrResult['Test code'] !== 'NA') ? ocrResult['Test code'] : '';

    // Smoking mapping
    if (ocrResult.smoking && ocrResult.smoking !== 'NA') {
        formValues.smoking = ocrResult.smoking.toLowerCase().includes('có') || 
                           ocrResult.smoking.toLowerCase().includes('yes');
    }

    // Gene mutation specific mapping
    if (ocrResult.gene_mutation_testing) {
        const geneTest = ocrResult.gene_mutation_testing;

        // Clinical information
        if (geneTest.clinical_information) {
            const clinicalInfo = geneTest.clinical_information;
            formValues.clinical_diagnosis = clinicalInfo.clinical_diagnosis || '';
            formValues.disease_stage = clinicalInfo.disease_stage || '';
            formValues.pathology_result = clinicalInfo.pathology_result || '';
            formValues.tumor_location_size_differentiation = clinicalInfo.tumor_location_size_differentiation || '';
            formValues.time_of_detection = clinicalInfo.time_of_detection || '';
            formValues.treatment_received = clinicalInfo.treatment_received || '';
        }

        // Specimen information
        if (geneTest.specimen_and_test_information) {
            const specimenInfo = geneTest.specimen_and_test_information;
            
            // GPB code
            formValues.gpb_code = specimenInfo.gpb_code || '';

            // Specimen types
            if (specimenInfo.specimen_type) {
                formValues.biopsy_tissue_ffpe = specimenInfo.specimen_type.biopsy_tissue_ffpe || false;
                formValues.blood_stl_ctdna = specimenInfo.specimen_type.blood_stl_ctdna || false;
                formValues.pleural_peritoneal_fluid = specimenInfo.specimen_type.pleural_peritoneal_fluid || false;
            }

            // Cancer panel selection
            if (specimenInfo.cancer_type_and_test_panel_please_tick_one) {
                const panelOptions = specimenInfo.cancer_type_and_test_panel_please_tick_one;
                
                // Find selected panel
                Object.keys(panelOptions).forEach(panelKey => {
                    if (panelOptions[panelKey]?.is_selected) {
                        formValues.cancer_panel = panelKey;
                    }
                });
            }
        }
    }

    // Prenatal screening specific mapping
    if (ocrResult.non_invasive_prenatal_testing) {
        const prenatalTest = ocrResult.non_invasive_prenatal_testing;

        // Clinical information
        if (prenatalTest.clinical_information) {
            const clinicalInfo = prenatalTest.clinical_information;
            
            // Pregnancy types
            formValues.single_pregnancy = clinicalInfo.single_pregnancy?.yes || false;
            formValues.twin_pregnancy_minor_complication = clinicalInfo.twin_pregnancy_minor_complication?.yes || false;
            formValues.ivf_pregnancy = clinicalInfo.ivf_pregnancy?.yes || false;
            
            // Maternal information
            if (clinicalInfo.maternal_height && clinicalInfo.maternal_height !== 'N/A') {
                formValues.maternal_height = parseFloat(clinicalInfo.maternal_height) || 0;
            }
            if (clinicalInfo.maternal_weight && clinicalInfo.maternal_weight !== 'N/A') {
                formValues.maternal_weight = parseFloat(clinicalInfo.maternal_weight) || 0;
            }
            
            // Gestational age
            if (clinicalInfo.gestational_age_weeks && clinicalInfo.gestational_age_weeks !== 'N/A') {
                const gestationalAge = clinicalInfo.gestational_age_weeks.replace('≥', '').trim();
                formValues.gestational_age_weeks = parseFloat(gestationalAge) || 0;
            }
            
            // Other clinical fields
            formValues.crown_rump_length_crl = clinicalInfo.crown_rump_length_crl === 'N/A' ? '' : (clinicalInfo.crown_rump_length_crl || '');
            formValues.nuchal_translucency = clinicalInfo.nuchal_translucency === 'N/A' ? '' : (clinicalInfo.nuchal_translucency || '');
            formValues.prenatal_screening_risk_nt = clinicalInfo.prenatal_screening_risk_nt === 'N/A' ? '' : (clinicalInfo.prenatal_screening_risk_nt || '');
            
            // Ultrasound date
            if (clinicalInfo.ultrasound_date && clinicalInfo.ultrasound_date !== 'N/A') {
                try {
                    formValues.ultrasound_date = new Date(clinicalInfo.ultrasound_date);
                } catch (e) {
                    formValues.ultrasound_date = null;
                }
            }
        }

        // Test options mapping
        if (prenatalTest.test_options && Array.isArray(prenatalTest.test_options)) {
            // Find selected NIPT package
            const selectedTest = prenatalTest.test_options.find((option: any) => 
                option.is_selected && ['NIPT CNV', 'NIPT 24', 'NIPT 5', 'NIPT 4', 'NIPT 3'].some(pkg => 
                    option.package_name.includes(pkg)
                )
            );
            
            if (selectedTest) {
                const packageName = selectedTest.package_name;
                if (packageName.includes('NIPT CNV')) {
                    formValues.nipt_package = 'nipt_cnv';
                } else if (packageName.includes('NIPT 24')) {
                    formValues.nipt_package = 'nipt_24';
                } else if (packageName.includes('NIPT 5')) {
                    formValues.nipt_package = 'nipt_5';
                } else if (packageName.includes('NIPT 4')) {
                    formValues.nipt_package = 'nipt_4';
                } else if (packageName.includes('NIPT 3')) {
                    formValues.nipt_package = 'nipt_3';
                }
            }
        }
    }

    // Additional selection notes for prenatal screening
    if (ocrResult.additional_selection_notes) {
        const additionalNotes = ocrResult.additional_selection_notes;
        
        if (additionalNotes.torch_fetal_infection_risk_survey && additionalNotes.carrier_18_common_recessive_hereditary_disease_genes_in_vietnamese_thalassemia_hypo_hyper_thyroidism_g6pd_deficiency_pompe_wilson_cf) {
            // Both torch and carrier are selected - this doesn't map to a specific option
            formValues.support_package = '';
        } else if (additionalNotes.torch_fetal_infection_risk_survey) {
            formValues.support_package = 'torch';
        } else if (additionalNotes.carrier_18_common_recessive_hereditary_disease_genes_in_vietnamese_thalassemia_hypo_hyper_thyroidism_g6pd_deficiency_pompe_wilson_cf) {
            formValues.support_package = 'carrier';
        } else if (additionalNotes.no_support_package_selected) {
            formValues.support_package = 'no_support';
        }
    }

    // Hereditary cancer mapping
    if (ocrResult.hereditary_cancer) {
        const hereditaryCancer = ocrResult.hereditary_cancer;
        
        // Find the first selected option (since radio groups only allow one selection)
        if (hereditaryCancer.breast_cancer_bcare?.is_selected) {
            formValues.cancer_screening_package = 'bcare';
        } else if (hereditaryCancer['15_hereditary_cancer_types_more_care']?.is_selected) {
            formValues.cancer_screening_package = 'more_care';
        } else if (hereditaryCancer['20_hereditary_cancer_types_vip_care']?.is_selected) {
            formValues.cancer_screening_package = 'vip_care';
        }
        
        // If multiple are selected, prioritize the most comprehensive one
        if (hereditaryCancer['20_hereditary_cancer_types_vip_care']?.is_selected) {
            formValues.cancer_screening_package = 'vip_care';
        } else if (hereditaryCancer['15_hereditary_cancer_types_more_care']?.is_selected) {
            formValues.cancer_screening_package = 'more_care';
        } else if (hereditaryCancer.breast_cancer_bcare?.is_selected) {
            formValues.cancer_screening_package = 'bcare';
        }
    }

    return formValues;
};