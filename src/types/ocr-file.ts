import type { FormType } from '@/utils/constant'

export interface CommonOCRRes<T> {
    message: string
    ocrResult: T
}

export interface OCRRes {
    document_name: FormType
    full_name: string
    gender: string
    clinic: string
    date_of_birth: string
    doctor: string
    doctor_phone: string
    sample_collection_date: string
    sample_collection_time: string
    phone: string
    email: string
    'Test code': string
    smoking: string
    address: string
    non_invasive_prenatal_testing: {
        clinical_information: {
            single_pregnancy: {
                yes: boolean
                no: boolean
            }
            maternal_height: string
            twin_pregnancy_minor_complication: {
                yes: boolean
                no: boolean
            }
            ivf_pregnancy: {
                yes: boolean
                no: boolean
            }
            gestational_age_weeks: string
            ultrasound_date: string
            crown_rump_length_crl: string
            nuchal_translucency: string
            maternal_weight: string
            prenatal_screening_risk_nt: string
        }
        test_options: Array<{
            package_name: string
            is_selected: boolean
        }>
    }
    additional_selection_notes: {
        torch_fetal_infection_risk_survey: boolean
        carrier_18_common_recessive_hereditary_disease_genes_in_vietnamese_thalassemia_hypo_hyper_thyroidism_g6pd_deficiency_pompe_wilson_cf: boolean
        no_support_package_selected: boolean
    }
    hereditary_cancer: {
        breast_cancer_bcare: {
            is_selected: boolean
            description: any
        }
        '15_hereditary_cancer_types_more_care': {
            is_selected: boolean
            description: any
        }
        '20_hereditary_cancer_types_vip_care': {
            is_selected: boolean
            description: any
        }
    }
    gene_mutation_testing: {
        clinical_information: {
            clinical_diagnosis: string
            disease_stage: string
            pathology_result: string
            tumor_location_size_differentiation: string
            time_of_detection: string
            treatment_received: string
        }
        specimen_and_test_information: {
            specimen_type: {
                biopsy_tissue_ffpe: boolean
                blood_stl_ctdna: boolean
                pleural_peritoneal_fluid: boolean
            }
            gpb_code: string
            sample_collection_date: string
            cancer_type_and_test_panel_please_tick_one: {
                onco_81: {
                    is_selected: boolean
                    description: any
                }
                onco_500_plus: {
                    is_selected: boolean
                    description: any
                }
                lung_cancer: {
                    is_selected: boolean
                    description: any
                }
                ovarian_cancer: {
                    is_selected: boolean
                    description: any
                }
                colorectal_cancer: {
                    is_selected: boolean
                    description: any
                }
                prostate_cancer: {
                    is_selected: boolean
                    description: any
                }
                breast_cancer: {
                    is_selected: boolean
                    description: any
                }
                cervical_cancer: {
                    is_selected: boolean
                    description: any
                }
                gastric_cancer: {
                    is_selected: boolean
                    description: any
                }
                pancreatic_cancer: {
                    is_selected: boolean
                    description: any
                }
                thyroid_cancer: {
                    is_selected: boolean
                    description: any
                }
                gastrointestinal_stromal_tumor_gist: {
                    is_selected: boolean
                    description: any
                }
            }
        }
    }
}
