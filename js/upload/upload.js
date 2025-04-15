document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('form-message');
    const fileInput = document.getElementById('file');

    // --- URL API CỦA BẠN ---
    const apiUrl = 'https://tanphudocument.caohoangphuc.id.vn/file/upload';

    // ----- Code preview file không đổi -----
    fileInput.addEventListener('change', function () {
        const file = fileInput.files[0];
        const previewPlaceholder = document.getElementById('file-preview-placeholder');
        const previewDetails = document.getElementById('file-preview-details');
        const fileNameSpan = document.getElementById('file-name');
        const fileSizeSpan = document.getElementById('file-size');
        const fileTypeSpan = document.getElementById('file-type');
        const fileUploadLabel = document.querySelector('label.file-upload-label[for="file"]');

        if (file) {
            if (previewPlaceholder) previewPlaceholder.style.display = 'none';
            if (previewDetails) previewDetails.style.display = 'block';
            fileNameSpan.textContent = file.name;
            fileSizeSpan.textContent = (file.size / 1024).toFixed(2) + ' KB';
            fileTypeSpan.textContent = file.type || 'Không xác định';
            if (fileUploadLabel) {
                const icon = fileUploadLabel.querySelector('i');
                fileUploadLabel.innerHTML = (icon ? icon.outerHTML : '') + ` ${file.name}`;
            }
        } else {
            resetPreview();
        }
    });
    // ----- Hết code preview file -----


    if (!uploadForm || !submitBtn || !formMessage || !fileInput) {
        console.error("Lỗi: Thiếu form, nút submit, vùng thông báo hoặc input file.");
        return;
    }

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        formMessage.textContent = '';
        formMessage.className = '';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang xử lý...';

        // ----- Code validation không đổi -----
        let isValid = true;
        const errorMessages = [];
        const labels = uploadForm.querySelectorAll('label');
        labels.forEach(label => {
            const requiredMark = label.querySelector('span[style*="color: red"]');
            let associatedInput = null;
            if (requiredMark) {
                const inputId = label.getAttribute('for');
                if (inputId) {
                    associatedInput = document.getElementById(inputId);
                } else if (label.textContent.includes('Chọn tệp tài liệu')) {
                     associatedInput = fileInput;
                }
                if (associatedInput) {
                    let isEmpty = false;
                    if (associatedInput.type === 'file') isEmpty = associatedInput.files.length === 0;
                    else if (associatedInput.tagName === 'SELECT') isEmpty = !associatedInput.value;
                    else isEmpty = associatedInput.value.trim() === '';
                    if (isEmpty) {
                        isValid = false;
                        const labelText = label.textContent.replace('*', '').replace(':', '').trim();
                        errorMessages.push(`Vui lòng nhập/chọn "${labelText}".`);
                        associatedInput.classList.add('is-invalid');
                        if (associatedInput.type === 'file') {
                            const fileLabel = uploadForm.querySelector(`label[for="${associatedInput.id}"], label.file-upload-label`);
                            if(fileLabel) fileLabel.classList.add('is-invalid-label');
                        }
                    } else {
                        associatedInput.classList.remove('is-invalid');
                         if (associatedInput.type === 'file') {
                            const fileLabel = uploadForm.querySelector(`label[for="${associatedInput.id}"], label.file-upload-label`);
                             if(fileLabel) fileLabel.classList.remove('is-invalid-label');
                        }
                    }
                }
            }
        });
        if (!isValid) {
            formMessage.textContent = errorMessages.join('\n');
            formMessage.className = 'form-error-message'; // Class CSS lỗi (đỏ)
            submitBtn.disabled = false;
            submitBtn.textContent = 'Gửi tài liệu';
            return;
        }
        // ----- Hết code validation -----

        const formData = new FormData(uploadForm);

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            });

            const responseText = await response.text(); // Lấy text thô từ server

            // *** THAY ĐỔI LOGIC HIỂN THỊ VÀ MÀU SẮC ***

            // 1. Hiển thị trực tiếp nội dung server trả về
            formMessage.textContent = responseText; // Chỉ hiển thị text, không thêm tiền tố

            // 2. Xác định màu sắc (class CSS) và hành động (reset form)
            if (response.ok) { // Status 200-299 - Về mặt kỹ thuật là thành công
                // Kiểm tra heuristic: xem nội dung có giống thông báo lỗi không
                // *** Tùy chỉnh các từ khóa này cho phù hợp với các thông báo lỗi thực tế của bạn ***
                const errorKeywords = ['không chứa', 'lỗi', 'thất bại', 'error', 'fail', 'invalid', 'không hợp lệ', 'không thành công', 'đã có người đăng'];
                const isLogicalError = errorKeywords.some(keyword =>
                    responseText.toLowerCase().includes(keyword)
                );

                if (isLogicalError) {
                     // Mặc dù status 200, nhưng nội dung giống lỗi -> màu đỏ
                     formMessage.className = 'form-error-message';
                     // Không reset form để người dùng sửa
                } else {
                     // Status 200 và nội dung không giống lỗi -> màu xanh, thành công thực sự
                     formMessage.className = 'form-success-message';
                     uploadForm.reset(); // Reset form
                     resetPreview();     // Reset preview file
                }
            } else { // Status 4xx, 5xx - Lỗi HTTP -> màu đỏ
                formMessage.className = 'form-error-message';
                // Không reset form
            }
            // *** HẾT PHẦN THAY ĐỔI ***

        } catch (error) {
            console.error('Lỗi mạng hoặc xử lý response:', error);
            formMessage.textContent = `Đã xảy ra lỗi kết nối hoặc xử lý phản hồi:\n${error.message}`;
            formMessage.className = 'form-error-message'; // Lỗi kết nối -> màu đỏ
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Gửi tài liệu';
        }
    });

    // ----- Code xóa lỗi validation khi người dùng sửa input không đổi -----
    uploadForm.querySelectorAll('input, select').forEach(input => {
        const eventType = (input.tagName === 'SELECT' || input.type === 'file') ? 'change' : 'input';
        input.addEventListener(eventType, () => {
            input.classList.remove('is-invalid');
             if (input.type === 'file') {
                const fileLabel = uploadForm.querySelector(`label[for="${input.id}"], label.file-upload-label`);
                 if(fileLabel) fileLabel.classList.remove('is-invalid-label');
            }
        });
    });
}); // Kết thúc DOMContentLoaded

// --- Hàm resetPreview không đổi ---
function resetPreview() {
    const previewPlaceholder = document.getElementById('file-preview-placeholder');
    const previewDetails = document.getElementById('file-preview-details');
    const fileNameSpan = document.getElementById('file-name');
    const fileSizeSpan = document.getElementById('file-size');
    const fileTypeSpan = document.getElementById('file-type');
    const fileUploadLabel = document.querySelector('label.file-upload-label[for="file"]');

    if (fileNameSpan) fileNameSpan.textContent = '';
    if (fileSizeSpan) fileSizeSpan.textContent = '';
    if (fileTypeSpan) fileTypeSpan.textContent = '';
    if (previewPlaceholder) previewPlaceholder.style.display = 'block';
    if (previewDetails) previewDetails.style.display = 'none';
    if (fileUploadLabel) {
        const icon = fileUploadLabel.querySelector('i');
        fileUploadLabel.innerHTML = (icon ? icon.outerHTML : '') + ' Chọn tệp...';
        fileUploadLabel.classList.remove('is-invalid-label');
    }
    const fileInput = document.getElementById('file');
    if (fileInput) fileInput.classList.remove('is-invalid');
}