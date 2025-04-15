// Đợi cho toàn bộ nội dung HTML được tải xong
document.addEventListener('DOMContentLoaded', () => {

    // (Giữ nguyên phần lấy tham chiếu đến các phần tử DOM và xử lý ID/name trùng lặp như script trước)
    const searchButton = document.getElementById('main-search-button');
    const keywordInput = document.getElementById('search-input-keyword');
    const teacherSelect = document.getElementById('filter-teacher');
    const yearSelect = document.getElementById('filter-year');
    const subjectSelect = document.getElementById('filter-subject');
    const gradeSelect = document.querySelector('select[name="grade"]');
    const gradeNameSelects = document.querySelectorAll('select[name="grade"]');
    const semesterSelect = gradeNameSelects.length > 1 ? gradeNameSelects[1] : null;
    const examTypeSelect = gradeNameSelects.length > 2 ? gradeNameSelects[2] : null;

    if (!searchButton || !keywordInput || !teacherSelect || !yearSelect || !subjectSelect || !gradeSelect || (gradeNameSelects.length > 1 && !semesterSelect) || (gradeNameSelects.length > 2 && !examTypeSelect) ) {
        console.error("Lỗi: Không tìm thấy một hoặc nhiều phần tử input/select cần thiết. Vui lòng kiểm tra lại ID và cấu trúc HTML.");
        alert("Đã xảy ra lỗi khi tải các bộ lọc. Vui lòng thử tải lại trang.");
        return;
    }

    // Thêm sự kiện 'click' cho nút tìm kiếm
    searchButton.addEventListener('click', () => {
        // Tùy chọn: Hiển thị trạng thái đang tải
        searchButton.disabled = true; // Vô hiệu hóa nút tránh click nhiều lần
        searchButton.querySelector('.search-button-text').textContent = 'Đang tìm...';
        fetchData();
    });

    // Hàm để xây dựng URL và thực hiện fetch
    function fetchData() {
        const baseUrl = 'https://tanphudocument.caohoangphuc.id.vn/file/find';
        const params = new URLSearchParams();

        const keyword = keywordInput.value.trim();
        const teacher = teacherSelect.value;
        const year = yearSelect.value;
        const subject = subjectSelect.value;
        const grade = gradeSelect.value;
        // Chỉ lấy giá trị nếu các select tồn tại
        const semester = semesterSelect ? semesterSelect.value : '';
        const examType = examTypeSelect ? examTypeSelect.value : '';

        if (keyword) params.append('keyword', keyword);
        if (teacher) params.append('teacher', teacher);
        if (year) params.append('year', year);
        if (subject) params.append('subject', subject);
        if (grade) params.append('grade', grade);
        if (semester) params.append('semester', semester);
        if (examType) params.append('exam_type', examType);

        const fullUrl = `${baseUrl}?${params.toString()}`;
        console.log('Đang gửi yêu cầu đến:', fullUrl);

        fetch(fullUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Dữ liệu nhận được:', data);

                // --- XỬ LÝ SAU KHI FETCH THÀNH CÔNG ---
                if (data && Array.isArray(data)) {
                    try {
                        // 1. Lưu trữ kết quả vào sessionStorage
                        // sessionStorage chỉ lưu trữ chuỗi, nên cần chuyển đổi mảng/đối tượng thành JSON string
                        sessionStorage.setItem('searchResults', JSON.stringify(data));

                        // 2. Chuyển hướng đến trang document.html
                        window.location.href = '../document/document.html'; // Đảm bảo đường dẫn này chính xác

                    } catch (e) {
                        console.error("Lỗi khi lưu dữ liệu vào sessionStorage:", e);
                        alert("Đã xảy ra lỗi khi chuẩn bị hiển thị kết quả.");
                        // Khôi phục lại nút tìm kiếm nếu có lỗi
                        resetSearchButton();
                    }
                } else {
                    console.warn("API không trả về một mảng dữ liệu hợp lệ.");
                    alert("Không tìm thấy kết quả phù hợp hoặc dữ liệu trả về không đúng định dạng.");
                    resetSearchButton();
                }
                // -----------------------------------------

            })
            .catch(error => {
                console.error('Đã xảy ra lỗi khi fetch dữ liệu:', error);
                alert(`Đã xảy ra lỗi khi tìm kiếm: ${error.message}. Vui lòng thử lại.`);
                // Khôi phục lại nút tìm kiếm nếu có lỗi
                resetSearchButton();
            });
    }

    function resetSearchButton() {
        searchButton.disabled = false;
        searchButton.querySelector('.search-button-text').textContent = 'Tìm kiếm';
    }

}); // Kết thúc DOMContentLoaded