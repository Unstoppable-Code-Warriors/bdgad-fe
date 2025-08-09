import type { CommonOCRRes } from '@/types/ocr-file'
import type { EditedOCRRes } from '../types'
import { getDefaultFormValues, type FormValues } from '@/types/prescription-form'

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
