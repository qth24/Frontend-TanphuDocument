document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results-container');

    if (!resultsContainer) {
        console.error("Không tìm thấy phần tử #results-container để hiển thị kết quả.");
        return;
    }

    // --- ĐỐI TƯỢNG ÁNH XẠ TÊN MÔN HỌC ---
    const subjectMap = {
        "Physics": "Vật lý",
        "Math": "Toán học",
        "Chemistry": "Hoá học",
        "Biology": "Sinh học",
        "Literature": "Ngữ văn",
        "History": "Lịch sử",
        "Geography": "Địa lý",
        "CivicEducation": "GDCD",
        "EconomicsAndLaw": "Kinh tế & Pháp luật",
        "Technology": "Công nghệ",
        "Informatics": "Tin học",
        "DefenseEducation": "GDQP & An ninh",
        "English": "Anh Văn",
        "Chinese": "Tiếng Trung",
        // ---->>> THÊM CÁC MÔN HỌC KHÁC CỦA BẠN VÀO ĐÂY <<<----
    };
    // ------------------------------------------


    // Lấy dữ liệu từ sessionStorage
    const resultsDataString = sessionStorage.getItem('searchResults');

    // Xóa dữ liệu khỏi sessionStorage sau khi lấy
    if (resultsDataString) {
        sessionStorage.removeItem('searchResults');
    }

    // Xóa thông báo "Đang tải..." hoặc nội dung cũ
    resultsContainer.innerHTML = '';

    if (resultsDataString) {
        try {
            // Parse dữ liệu JSON
            const results = JSON.parse(resultsDataString);

            // Kiểm tra xem có phải mảng và có phần tử không
            if (Array.isArray(results) && results.length > 0) {

                // Lặp qua từng item kết quả
                results.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.classList.add('search-result-item');

                    // --- Bắt đầu xây dựng nội dung HTML cho một item ---
                    let innerHTML = '';

                    // 1. Tiêu đề tài liệu
                    innerHTML += `<h3 class="result-item-title">${item.name || 'Không có tên'}</h3>`;

                    // 2. Phần Metadata
                    innerHTML += `<div class="result-item-meta">`;
                    innerHTML += `<p><strong>Tên file:</strong> ${item.filename || 'N/A'}</p>`;
                    innerHTML += `<p><strong>Tác giả:</strong> ${item.author || 'N/A'}</p>`;
                    const uploadDate = item.upload_time
                        ? new Date(item.upload_time).toLocaleString('vi-VN', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                          })
                        : 'N/A';
                    innerHTML += `<p><strong>Ngày tải lên:</strong> ${uploadDate}</p>`;
                    innerHTML += `</div>`; // Kết thúc .result-item-meta

                    // 3. Phần Tags
                    if (item.tag && typeof item.tag === 'object') {
                        innerHTML += `<div class="result-item-tags">`;

                        // ---- Xử lý Môn học ----
                        if (item.tag.subject) {
                            const apiSubject = item.tag.subject;
                            const displaySubject = subjectMap[apiSubject] || apiSubject;
                            innerHTML += `<span class="result-tag subject">Môn: ${displaySubject}</span>`;
                        }
                        // -------------------------

                        // ---- Xử lý Khối lớp ----
                        if (item.tag.grade) {
                            innerHTML += `<span class="result-tag grade">Khối: ${item.tag.grade}</span>`;
                        }
                        // -------------------------

                        // ---- Xử lý Năm học (Hiển thị dạng khoảng) ----
                        if (item.tag.year) {
                            const apiYearValue = item.tag.year;
                            // Cố gắng chuyển đổi thành số nguyên
                            const endYear = parseInt(apiYearValue, 10);

                            let displayYearText = ''; // Biến lưu text năm hiển thị

                            // Kiểm tra xem có phải là số hợp lệ không
                            if (!isNaN(endYear) && endYear > 1000) { // Thêm kiểm tra > 1000 để tránh năm không hợp lệ
                                const startYear = endYear - 1;
                                displayYearText = `${startYear}-${endYear}`; // Định dạng "YYYY-YYYY"
                            } else {
                                // Nếu không phải số hợp lệ, hiển thị giá trị gốc (nếu có)
                                displayYearText = apiYearValue ? apiYearValue.toString() : '';
                            }

                            if (displayYearText) { // Chỉ thêm tag nếu có text
                                innerHTML += `<span class="result-tag year">Năm: ${displayYearText}</span>`;
                            }
                        }
                        // ---------------------------------------------

                        // ---- Xử lý Kỳ học/Thi ----
                        let apiSemester = item.tag.semester;
                        let displaySemester = '';

                        switch (apiSemester) {
                            case 1: displaySemester = "Giữa kỳ I"; break;
                            case 2: displaySemester = "Cuối kỳ I"; break;
                            case 3: displaySemester = "Giữa kỳ II"; break;
                            case 4: displaySemester = "Cuối kỳ II"; break;
                            case 'GK1': displaySemester = "Giữa kỳ I"; break;
                            case 'CK1': displaySemester = "Cuối kỳ I"; break;
                            case 'GK2': displaySemester = "Giữa kỳ II"; break;
                            case 'CK2': displaySemester = "Cuối kỳ II"; break;
                            case 'THPTQG': displaySemester = "THPT Quốc Gia"; break;
                            case 'DGNL': displaySemester = "Đánh giá năng lực"; break;
                            case 'HSG': displaySemester = "HSG Cấp tỉnh"; break;
                            // ---->>> THÊM CÁC LOẠI KỲ THI KHÁC <<<----
                            default:
                                if (typeof apiSemester === 'string' && apiSemester.trim().length > 0) {
                                     displaySemester = apiSemester;
                                }
                                break;
                        }

                        if (displaySemester) {
                             innerHTML += `<span class="result-tag semester">Kỳ: ${displaySemester}</span>`;
                        }
                        // -------------------------

                        // ---- Xử lý Giáo viên ----
                        if (item.tag.teacher) {
                             innerHTML += `<span class="result-tag">GV: ${item.tag.teacher}</span>`;
                        }
                        // -------------------------

                        innerHTML += `</div>`; // Kết thúc .result-item-tags
                    }

                    // 4. Phần Hành động và Thống kê
                    innerHTML += `<div class="result-item-actions">`;
                     // Thống kê
                    innerHTML += `<div class="result-item-stats">
                                    <i class="fas fa-eye"></i> ${item.view || 0} Lượt xem
                                       |   
                                    <i class="fas fa-download"></i> ${item.download || 0} Lượt tải
                                  </div>`;
                     // Nút Tải xuống
                    if (item.public_url) {
                        innerHTML += `<a href="${item.public_url}" class="download-link" target="_blank" rel="noopener noreferrer">
                                        <i class="fas fa-cloud-download-alt"></i> Xem / Tải xuống
                                      </a>`;
                    }
                    innerHTML += `</div>`; // Kết thúc .result-item-actions
                    // --- Kết thúc xây dựng nội dung HTML ---


                    // Gán HTML vào itemElement
                    itemElement.innerHTML = innerHTML;

                    // Thêm item vào container chính
                    resultsContainer.appendChild(itemElement);
                }); // Kết thúc vòng lặp forEach

            } else {
                // Trường hợp không có kết quả
                resultsContainer.innerHTML = `
                    <div class="no-results-message">
                         <i class="fas fa-search"></i>
                         Không tìm thấy tài liệu nào phù hợp với tiêu chí tìm kiếm của bạn.
                         <br>Vui lòng thử lại với từ khóa hoặc bộ lọc khác.
                    </div>`;
            }

        } catch (e) {
            // Xử lý lỗi
            console.error("Lỗi khi phân tích hoặc hiển thị dữ liệu từ sessionStorage:", e);
            resultsContainer.innerHTML = `
                 <div class="no-results-message" style="border-color: #f5c6cb; background-color: #f8d7da; color: #721c24;">
                     <i class="fas fa-exclamation-triangle" style="color: #721c24;"></i>
                     Đã xảy ra lỗi khi hiển thị kết quả. Dữ liệu có thể bị lỗi.
                     <br>Vui lòng thử tìm kiếm lại.
                 </div>`;
        }
    } else {
        // Trường hợp không có dữ liệu trong sessionStorage
        resultsContainer.innerHTML = `
            <div class="no-results-message">
                <i class="fas fa-info-circle"></i>
                Không có dữ liệu kết quả để hiển thị.
                <br>Vui lòng quay lại trang chủ và thực hiện tìm kiếm.
            </div>`;
    }
}); // Kết thúc sự kiện DOMContentLoaded