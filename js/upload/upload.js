document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('form-message');
    const fileInput = document.getElementById('file'); // File input

    // CHECK XEM UP FILE ĐƯỢC CHƯA
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
    

    // --- URL API CỦA BẠN ---
    // !!! THAY THẾ BẰNG ĐỊA CHỈ API THỰC TẾ !!!
    const apiUrl = 'https://tanphudocument.caohoangphuc.id.vn/file/upload'; // Ví dụ: endpoint API của bạn

    // Kiểm tra các phần tử cơ bản
    if (!uploadForm || !submitBtn || !formMessage || !fileInput) {
        console.error("Lỗi: Thiếu form, nút submit, vùng thông báo hoặc input file.");
        return;
    }

    // Xử lý sự kiện submit form
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Ngăn chặn hành vi submit mặc định

        // 1. Chuẩn bị UI: Xóa thông báo cũ, vô hiệu hóa nút
        formMessage.textContent = '';
        formMessage.className = ''; // Xóa class CSS cũ
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang xử lý...';

        // 2. Kiểm tra các trường bắt buộc (có dấu * đỏ trong label)
        let isValid = true;
        const errorMessages = [];
        // Tìm tất cả label trong form
        const labels = uploadForm.querySelectorAll('label');

        labels.forEach(label => {
            // Kiểm tra xem label có chứa span đánh dấu bắt buộc không
            const requiredMark = label.querySelector('span[style*="color: red"]');
            let associatedInput = null;

            if (requiredMark) {
                const inputId = label.getAttribute('for');
                if (inputId) {
                    // Tìm input/select tương ứng qua id
                    associatedInput = document.getElementById(inputId);
                } else {
                    // Trường hợp đặc biệt cho file input (label không có 'for')
                    // Tìm input type=file gần nhất sau label này (hoặc cách khác tùy cấu trúc)
                    // Cách đơn giản nhất là kiểm tra trực tiếp file input nếu biết id
                    if (label.textContent.includes('Chọn tệp tài liệu')) {
                         associatedInput = fileInput;
                    }
                }

                if (associatedInput) {
                    let isEmpty = false;
                    // Kiểm tra giá trị dựa trên loại phần tử
                    if (associatedInput.type === 'file') {
                        isEmpty = associatedInput.files.length === 0;
                    } else if (associatedInput.tagName === 'SELECT') {
                        isEmpty = !associatedInput.value; // value rỗng "" là không hợp lệ
                    } else { // Input text, etc.
                        isEmpty = associatedInput.value.trim() === '';
                    }

                    // Nếu trường bắt buộc bị bỏ trống
                    if (isEmpty) {
                        isValid = false;
                        // Lấy nội dung text của label (bỏ dấu *) để làm thông báo lỗi
                        const labelText = label.textContent.replace('*', '').replace(':', '').trim();
                        errorMessages.push(`Vui lòng nhập/chọn "${labelText}".`);
                        // Thêm class lỗi để thay đổi giao diện (optional)
                        associatedInput.classList.add('is-invalid');
                         // Xử lý thêm class cho label của file input nếu cần
                        if (associatedInput.type === 'file') {
                            const fileLabel = uploadForm.querySelector(`label[for="${associatedInput.id}"]`);
                            if(fileLabel) fileLabel.classList.add('is-invalid-label'); // Ví dụ
                        }
                    } else {
                        // Xóa class lỗi nếu trường đã hợp lệ
                        associatedInput.classList.remove('is-invalid');
                         if (associatedInput.type === 'file') {
                            const fileLabel = uploadForm.querySelector(`label[for="${associatedInput.id}"]`);
                             if(fileLabel) fileLabel.classList.remove('is-invalid-label'); // Ví dụ
                        }
                    }
                }
            }
        });

        // 3. Xử lý nếu có lỗi validation
        if (!isValid) {
            formMessage.textContent = errorMessages.join('\n'); // Hiển thị các lỗi, mỗi lỗi một dòng
            formMessage.className = 'form-error-message'; // Thêm class để CSS (vd: màu đỏ)
            submitBtn.disabled = false; // Kích hoạt lại nút
            submitBtn.textContent = 'Gửi tài liệu';
            return; // Dừng thực thi
        }

        // 4. Tạo FormData nếu không có lỗi
        const formData = new FormData(uploadForm);
        // FormData sẽ tự động lấy tất cả các trường có 'name' và file

        // 5. Gửi dữ liệu bằng Fetch API
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
                // KHÔNG cần đặt 'Content-Type': 'multipart/form-data'
                // Trình duyệt sẽ tự động làm điều đó với boundary chính xác
            });

            // 6. Xử lý phản hồi từ server
            const responseData = await response.json().catch(() => ({})); // Cố gắng parse JSON, lỗi thì trả về {}

            if (response.ok) { // Status 200-299
                formMessage.textContent = responseData.message || 'Đóng góp tài liệu thành công!';
                formMessage.className = 'form-success-message'; // Thêm class CSS (vd: màu xanh)
                uploadForm.reset(); // Xóa nội dung các trường trong form
                // Gọi hàm reset giao diện xem trước file (nếu có)
                if (typeof resetPreview === 'function') {
                    resetPreview();
                } else {
                     // Hoặc reset thủ công nếu hàm không tồn tại
                     const previewPlaceholder = document.getElementById('file-preview-placeholder');
                     const previewDetails = document.getElementById('file-preview-details');
                     if (previewPlaceholder) previewPlaceholder.style.display = 'block';
                     if (previewDetails) previewDetails.style.display = 'none';
                     // ... reset các span khác ...
                }

            } else { // Lỗi từ server (status 4xx, 5xx)
                throw new Error(responseData.message || `Lỗi ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Lỗi khi gửi form:', error);
            formMessage.textContent = `Đã xảy ra lỗi: ${error.message}`;
            formMessage.className = 'form-error-message'; // Class CSS lỗi
        } finally {
            // 7. Luôn kích hoạt lại nút submit sau khi hoàn tất (dù thành công hay lỗi)
            submitBtn.disabled = false;
            submitBtn.textContent = 'Gửi tài liệu';
        }
    });

    // Optional: Xóa viền đỏ/thông báo lỗi khi người dùng sửa đổi input
    uploadForm.querySelectorAll('.form-control, .form-control-file').forEach(input => {
        const eventType = (input.tagName === 'SELECT' || input.type === 'file') ? 'change' : 'input';
        input.addEventListener(eventType, () => {
            input.classList.remove('is-invalid');
            // Xóa class lỗi khỏi label của file input (nếu có)
             if (input.type === 'file') {
                const fileLabel = uploadForm.querySelector(`label[for="${input.id}"]`);
                 if(fileLabel) fileLabel.classList.remove('is-invalid-label');
            }
            // Xóa thông báo lỗi chung khi người dùng bắt đầu sửa
            if (isValid === false && formMessage.classList.contains('form-error-message')) {
                // Chỉ xóa nếu trước đó có lỗi validation hiển thị
                 // formMessage.textContent = '';
                 // formMessage.className = '';
                 // Cân nhắc có nên xóa ngay hay đợi submit lại
            }
        });
    });

}); // Kết thúc DOMContentLoaded

// --- Hàm reset giao diện xem trước file (đặt ở đây hoặc import nếu cần) ---
function resetPreview() {
    const previewContainer = document.getElementById('file-preview-container');
    const previewPlaceholder = document.getElementById('file-preview-placeholder');
    const previewDetails = document.getElementById('file-preview-details');
    const fileNameSpan = document.getElementById('file-name');
    const fileSizeSpan = document.getElementById('file-size');
    const fileTypeSpan = document.getElementById('file-type');
    const fileUploadLabel = document.querySelector('label.file-upload-label[for="file"]'); // Chính xác hơn

    if (fileNameSpan) fileNameSpan.textContent = '';
    if (fileSizeSpan) fileSizeSpan.textContent = '';
    if (fileTypeSpan) fileTypeSpan.textContent = '';
    if (previewPlaceholder) previewPlaceholder.style.display = 'block';
    if (previewDetails) previewDetails.style.display = 'none';
    if (previewContainer) previewContainer.classList.remove('has-file'); // Xóa class khi có file
    // Reset text của nút chọn file tùy chỉnh
    if (fileUploadLabel) {
        const icon = fileUploadLabel.querySelector('i'); // Giữ lại icon nếu có
        fileUploadLabel.innerHTML = (icon ? icon.outerHTML : '') + ' Chọn tệp...';
    }
    // Quan trọng: form.reset() thường sẽ xóa giá trị của input file
    // Nếu không, bạn có thể thử:
    // const fileInput = document.getElementById('file');
    // if(fileInput) fileInput.value = null;
}