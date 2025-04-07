document.addEventListener("DOMContentLoaded", function () {
    const employeeTable = document.querySelector("#employeeTable");
    const employeeForm = document.querySelector("#employeeForm");
    const employeeFirstNameInput = document.querySelector("#employeeFirstName");
    const employeeLastNameInput = document.querySelector("#employeeLastName");
    const employeeRoleInput = document.querySelector("#employeeRole");
    const employeeEmailInput = document.querySelector("#employeeEmail");
    const employeePhoneInput = document.querySelector("#employeePhone");
    const employeeSalaryInput = document.querySelector("#employeeSalary");
    const employeeSubmitBtn = document.querySelector("button[type='submit']");
    const employeeUpdateBtn = document.querySelector("#employeeUpdateBtn");
    const addStaffBtn = document.querySelector("#addStaffBtn");
    const staffForm = document.querySelector("#staffForm");
    const staffUsernameInput = document.querySelector("#staffUsername");
    const staffPasswordInput = document.querySelector("#staffPassword");
    const staffEmployeeSelect = document.querySelector("#staffEmployee");
    const saveStaffBtn = document.querySelector("#saveStaffBtn");
    const addStaffModal = new bootstrap.Modal(document.getElementById('addStaffModal'));

    let employees = [];
    let editEmployeeIndex = null;

    async function fetchEmployees() {
        try {
            const response = await fetch("https://hotel-bed.onrender.com/api/Employee/GetEmployeeList");
            const data = await response.json();
            employees = data.data;
            renderEmployees();
            populateEmployeeDropdown();
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    }

    function renderEmployees() {
        employeeTable.innerHTML = "";
        employees.forEach((employee, index) => {
            let row = `
                <tr>
                    <td>${employee.eFirstName}</td>
                    <td>${employee.eLastName}</td>
                    <td>${employee.ePosition}</td>
                    <td>${employee.eEmail}</td>
                    <td>${employee.ePhoneNumber}</td>
                    <td>${employee.eSalary}</td>
                    <td>
                        <button class="btn btn-primary me-2" onclick="editEmployee(${index})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteEmployee(${index})">Delete</button>
                    </td>
                </tr>
            `;
            employeeTable.innerHTML += row;
        });
        populateEmployeeDropdown();
    }

    const employeeSearchInput = document.querySelector("#employeeSearch");

    // Add search function
    async function searchEmployees(searchTerm) {
        try {
            const response = await fetch(`https://hotel-bed.onrender.com/api/Employee/SearchTblEmployee?s=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            employees = data.data;
            renderEmployees();
        } catch (error) {
            console.error("Error searching employees:", error);
        }
    }

    // Add debounce function to limit API calls
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Wait 300ms after user stops typing to search
    const debouncedSearch = debounce((searchTerm) => {
        if (searchTerm.trim() === "") {
            fetchEmployees();
        } else {
            searchEmployees(searchTerm);
        }
    }, 300);

    employeeSearchInput.addEventListener("input", (e) => {
        debouncedSearch(e.target.value);
    });

    employeeUpdateBtn.addEventListener("click", function () {
        let firstName = employeeFirstNameInput.value.trim();
        let lastName = employeeLastNameInput.value.trim();
        let role = employeeRoleInput.value.trim();
        let email = employeeEmailInput.value.trim();
        let phone = employeePhoneInput.value.trim();
        let salary = parseFloat(employeeSalaryInput.value.trim());

        const employee = {
            eEmployeeId: employees[editEmployeeIndex].eEmployeeId,
            eFirstName: firstName,
            eLastName: lastName,
            eEmail: email,
            ePhoneNumber: phone,
            ePosition: role,
            eSalary: salary
        };

        updateEmployee(employee);
        employeeForm.reset();
        employeeSubmitBtn.style.display = "inline-block";
        employeeUpdateBtn.style.display = "none";
        editEmployeeIndex = null;
    });

    async function addEmployee(employee) {
        try {
            const response = await fetch("https://hotel-bed.onrender.com/api/Employee/InsertTblEmployee", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(employee)
            });
            const data = await response.json();
            employees.push(data.data);
            renderEmployees();
        } catch (error) {
            console.error("Error adding employee:", error);
        }
    }

    employeeForm.addEventListener("submit", function (event) {
        event.preventDefault();
        let firstName = employeeFirstNameInput.value.trim();
        let lastName = employeeLastNameInput.value.trim();
        let role = employeeRoleInput.value.trim();
        let email = employeeEmailInput.value.trim();
        let phone = employeePhoneInput.value.trim();
        let salary = parseFloat(employeeSalaryInput.value.trim());

        const employee = {
            eEmployeeId: crypto.randomUUID(),
            eFirstName: firstName,
            eLastName: lastName,
            eEmail: email,
            ePhoneNumber: phone,
            ePosition: role,
            eSalary: salary
        };

        addEmployee(employee);
        employeeForm.reset();
    });

    window.editEmployee = function (index) {
        let employee = employees[index];
        employeeFirstNameInput.value = employee.eFirstName;
        employeeLastNameInput.value = employee.eLastName;
        employeeRoleInput.value = employee.ePosition;
        employeeEmailInput.value = employee.eEmail;
        employeePhoneInput.value = employee.ePhoneNumber;
        employeeSalaryInput.value = employee.eSalary;

        editEmployeeIndex = index;
        employeeSubmitBtn.style.display = "none";
        employeeUpdateBtn.style.display = "inline-block";
    };

    async function updateEmployee(employee) {
        try {
            await fetch("https://hotel-bed.onrender.com/api/Employee/UpdateTblEmployee", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(employee)
            });
            await fetchEmployees();

        } catch (error) {
            console.error("Error updating employee:", error);
        }
    }

    window.deleteEmployee = function (index) {
        if (confirm("Are you sure to delete this employee?")) {
            deleteEmployee(index);
        }
    };

    async function deleteEmployee(index) {
        try {
            const employee = employees[index];
            await fetch(`https://hotel-bed.onrender.com/api/Employee/XoaTblEmployee?eEmployeeId=${employee.eEmployeeId}`, {
                method: "DELETE",
            });
            await fetchEmployees();

        } catch (error) {
            console.error("Error deleting employee:", error);
        }
    }

    fetchEmployees();

    // Add event listeners
    addStaffBtn.addEventListener("click", () => {
        populateEmployeeDropdown();
        addStaffModal.show();
    });

    saveStaffBtn.addEventListener("click", () => {
        const username = staffUsernameInput.value.trim();
        const password = staffPasswordInput.value.trim();
        const employeeId = staffEmployeeSelect.value;

        if (username && password && employeeId) {
            addStaffAccount(username, password, employeeId);
        } else {
            alert("Please fill in all fields");
        }
    });

    // Function to populate employee dropdown
    function populateEmployeeDropdown() {
        staffEmployeeSelect.innerHTML = '<option value="">Select an employee</option>';
        employees.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.eEmployeeId;
            option.textContent = `${employee.eFirstName} ${employee.eLastName} (${employee.eEmail})`;
            staffEmployeeSelect.appendChild(option);
        });
    }

    // Function to add staff account
    async function addStaffAccount(username, password) {
        try {
            const response = await fetch("https://hotel-bed.onrender.com/api/Auth/AddStaff", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Username: username,
                    Password: password,
                })
            });

            const data = await response.json();

            if (data.code === 100) {
                alert("Staff account created successfully!");
                addStaffModal.hide();
                staffForm.reset();
            } else {
                alert("Error creating staff account: " + data.msg);
            }
        } catch (error) {
            console.error("Error adding staff account:", error);
            alert("An error occurred while creating the staff account");
        }
    }
});