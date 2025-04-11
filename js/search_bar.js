document.addEventListener('DOMContentLoaded', function() {

    // --- Get DOM Elements ---
    const keywordInput = document.getElementById('search-input-keyword');
    const teacherSelect = document.getElementById('filter-teacher');
    const yearSelect = document.getElementById('filter-year');
    const subjectSelect = document.getElementById('filter-subject');
    // Add other select elements here if you create more filters (e.g., gradeSelect)
    // const gradeSelect = document.getElementById('filter-grade');
    const searchButton = document.getElementById('main-search-button');

    // --- Define Filter Options (Replace with your actual data) ---
    const teacherOptions = ["Thầy Anh", "Cô B", "Thầy C", "Cô D"]; // Example
    const yearOptions = ["2024-2025", "2023-2024", "2022-2023"]; // Example
    const subjectOptions = [
        "Toán học", "Vật lý", "Hoá học", "Sinh học",
        "Ngữ văn", "Lịch sử", "Địa lý", "GD KT&PL",
        "Công nghệ", "Tin học", "GDQP&AN",
        "Anh Văn", "Tiếng Trung"
    ]; // Example from your nav

    // --- Helper Function to Populate a Select Dropdown ---
    function populateSelect(selectElement, options) {
        if (!selectElement) return; // Exit if the element doesn't exist

        // Start from index 1 to keep the default "-- Tất cả --" option
        // Or clear completely if you prefer: selectElement.innerHTML = '<option value="">-- Default --</option>';
        options.forEach(optionText => {
            const option = document.createElement('option');
            option.value = optionText; // Or use an ID if you have one
            option.textContent = optionText;
            selectElement.appendChild(option);
        });
    }

    // --- Function to Handle Search Action ---
    function performSearch() {
        const keyword = keywordInput.value.trim();
        const selectedTeacher = teacherSelect.value;
        const selectedYear = yearSelect.value;
        const selectedSubject = subjectSelect.value;
        // Get values from other selects if added
        // const selectedGrade = gradeSelect.value;

        // Build the query parameters object
        const queryParams = {};
        if (keyword) queryParams.q = keyword; // 'q' is common for keyword query
        if (selectedTeacher) queryParams.teacher = selectedTeacher;
        if (selectedYear) queryParams.year = selectedYear;
        if (selectedSubject) queryParams.subject = selectedSubject;
        // if (selectedGrade) queryParams.grade = selectedGrade;

        // Construct the search URL
        const queryString = new URLSearchParams(queryParams).toString();

        // Log for debugging
        console.log("Search Criteria:", queryParams);
        console.log("Query String:", queryString);

        if (queryString) {
            // Redirect to the search results page (replace '/search' if needed)
            window.location.href = `/search?${queryString}`;
        } else {
            // Optional: Handle case where nothing was entered or selected
            console.log("No search criteria provided.");
            keywordInput.placeholder = "Vui lòng nhập từ khóa hoặc chọn bộ lọc!";
            // You might want to briefly highlight the input or filters
            setTimeout(() => {
               keywordInput.placeholder = "Nhập từ khóa tìm kiếm (tùy chọn)...";
            }, 2500);
        }
    }

    // --- Populate Dropdowns on Page Load ---
    populateSelect(teacherSelect, teacherOptions);
    populateSelect(yearSelect, yearOptions);
    populateSelect(subjectSelect, subjectOptions);
    // Populate other selects if added
    // populateSelect(gradeSelect, gradeOptions);


    // --- Add Event Listeners ---

    // Search Button Click
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    } else {
        console.error("Search button (#main-search-button) not found!");
    }

    // Enter Key in Keyword Input
    if (keywordInput) {
        keywordInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.keyCode === 13) {
                event.preventDefault(); // Prevent potential form submission
                performSearch();
            }
        });
    }

    // Optional: Trigger search if Enter is pressed while a select is focused
    [teacherSelect, yearSelect, subjectSelect].forEach(select => {
        if (select) {
            select.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.keyCode === 13) {
                    event.preventDefault();
                    performSearch();
                }
            });
        }
    });

});