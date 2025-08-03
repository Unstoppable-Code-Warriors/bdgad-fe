export const validateName = (name: string): string | null => {
    if (!name || !name.trim()) {
        return 'Họ và tên là bắt buộc'
    }

    const trimmedName = name.trim()

    // Check if contains only letters, spaces and Vietnamese characters
    const nameRegex =
        /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/

    if (!nameRegex.test(trimmedName)) {
        return 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'
    }

    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(trimmedName)) {
        return 'Giữa hai từ chỉ được có một khoảng trắng'
    }

    // Check minimum length (after trimming)
    if (trimmedName.length < 2) {
        return 'Họ và tên phải có ít nhất 2 ký tự'
    }

    // Check maximum length (after trimming)
    if (trimmedName.length > 50) {
        return 'Họ và tên không được quá 50 ký tự'
    }

    return null
}

export const formatName = (name: string): string => {
    // Remove extra spaces and trim
    return name.trim().replace(/\s+/g, ' ')
}
