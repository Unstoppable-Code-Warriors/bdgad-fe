export enum Role {
    STAFF = 1,
    LAB_TESTING_TECHNICIAN = 2,
    ANALYSIS_TECHNICIAN = 3,
    VALIDATION_TECHNICIAN = 4,
    DOCTOR = 5
}

export const getDefaultRouteByRole = (roleCode?: number): string => {
    if (!roleCode) return '/'

    switch (roleCode) {
        case Role.LAB_TESTING_TECHNICIAN:
            return '/lab-test'

        case Role.VALIDATION_TECHNICIAN:
            return '/validation'

        case Role.ANALYSIS_TECHNICIAN:
            return '/analysis'

        case Role.DOCTOR:
            return '/patient-folder'

        case Role.STAFF:
        default:
            return '/input-info'
    }
}
export enum FormType {
    PRENATAL_TESTING = 'prenatal_screening',
    HEREDITARY_CANCER = 'hereditary_cancer',
    GENE_MUTATION = 'gene_mutation'
}
