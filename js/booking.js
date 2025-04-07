let cusid = "";
let availableroomfound = [];
let SelectedRooms = [];

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
}

// Add Customer
document.getElementById("add-customer").addEventListener("click", function () {
    document.getElementById("customer-modal").style.display = "flex";
});

document.getElementById("cancel-customer").addEventListener("click", function () {
    document.getElementById("customer-modal").style.display = "none";
});

document.getElementById("confirm-customer").addEventListener("click", function () {
    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const email = document.getElementById("customer-email").value.trim();
    const phoneNumber = document.getElementById("customer-phone").value.trim();

    if (!firstName || !lastName || !email || !phoneNumber) {
        alert("Please fill in all customer details.");
        return;
    }

    if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (!isValidPhone(phoneNumber)) {
        alert("Please enter a valid 10-digit phone number.");
        return;
    }

    fetch(
        `https://hotel-bed.onrender.com/api/Booking/AddGuest?firstname=${encodeURIComponent(firstName)}&lastname=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}&phonenum=${encodeURIComponent(phoneNumber)}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }
    )
        .then(response => {
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            document.getElementById("name").value = `${firstName} ${lastName}`;
            document.getElementById("phonenum").value = phoneNumber;
            cusid = data.data;
            alert("Customer added successfully!");
            document.getElementById("customer-modal").style.display = "none";
        })
        .catch(error => {
            console.error("Error adding customer:", error);
            alert(`Failed to add customer: ${error.message}`);
        });
});

// Find Available Rooms
document.getElementById("bt_findroom").addEventListener("click", function () {
    document.getElementById("find-room-modal").style.display = "flex";
});

document.getElementById("cancel-findroom").addEventListener("click", function () {
    availableroomfound = [];
    document.getElementById("search-room-body").innerHTML = "";
    document.getElementById("checkin").value = "";
    document.getElementById("checkout").value = "";
    document.getElementById("floor").value = "";
    document.getElementById("find-room-modal").style.display = "none";
});

document.getElementById("bt_search").addEventListener("click", function () {
    const checkinDate = document.getElementById("checkin").value;
    const checkoutDate = document.getElementById("checkout").value;
    const floor = document.getElementById("floor").value.trim();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(checkinDate) < today) {
        alert("Check-in date cannot be in the past.");
        return;
    }

    if (!checkinDate || !checkoutDate) {
        alert("Please select both check-in and check-out dates.");
        return;
    }

    if (new Date(checkinDate) >= new Date(checkoutDate)) {
        alert("Check-out date must be after check-in date.");
        return;
    }

    if (floor === "") {
        alert("Please select a floor.");
        return;
    }

    const formattedCheckin = encodeURIComponent(`${checkinDate}:00.000`);
    const formattedCheckout = encodeURIComponent(`${checkoutDate}:00.000`);
    const apiUrl = `https://hotel-bed.onrender.com/api/Booking/FindAvailableRooms?indate=${formattedCheckin}&outdate=${formattedCheckout}&floor=${encodeURIComponent(floor)}`;

    fetch(apiUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch available rooms");
            return response.json();
        })
        .then(data => {
            const searchRoomBody = document.getElementById("search-room-body");
            searchRoomBody.innerHTML = "";
            availableroomfound = data || [];

            if (availableroomfound.length === 0) {
                alert("No rooms available for the selected time and floor.");
                return;
            }

            availableroomfound.forEach((room, index) => {
                const row = document.createElement("tr");
                row.setAttribute("data-room-id", room.roomId);
                row.innerHTML = `
                    <td class="align-middle">${room.roomNumber}</td>
                    <td class="align-middle">${room.floor}</td>
                    <td class="align-middle">${room.roomType}</td>
                    <td class="align-middle">${room.pricePerHour}</td>
                    <td class="align-middle">
                        <div class="form-check d-flex justify-content-center">
                            <input type="checkbox" class="form-check-input room-select" data-index="${index}">
                        </div>
                    </td>
                `;
                searchRoomBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error finding rooms:", error);
            alert("An error occurred while searching for rooms.");
        });
});

document.getElementById("choose-room").addEventListener("click", function () {
    const checkinDate = document.getElementById("checkin").value;
    const checkoutDate = document.getElementById("checkout").value;

    document.querySelectorAll(".room-select:checked").forEach(checkbox => {
        const index = checkbox.getAttribute("data-index");
        const room = availableroomfound[index];

        const selectedRoom = {
            roomId: room.roomId,
            roomNumber: room.roomNumber,
            floor: room.floor,
            roomType: room.roomType,
            pricePerHour: room.pricePerHour,
            checkInDate: checkinDate,
            checkOutDate: checkoutDate
        };

        const isAlreadySelected = SelectedRooms.some(r => r.roomId === room.roomId);
        if (!isAlreadySelected) {
            SelectedRooms.push(selectedRoom);
        } else {
            alert(`Room ${room.roomNumber} is already selected.`);
            return;
        }

        const tableBody = document.getElementById("room-table-body");
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="text" class="form-control form-control-sm" style="border: none; box-shadow: none;" value="${room.roomNumber}" readonly></td>
            <td><input type="text" class="form-control form-control-sm" style="border: none; box-shadow: none;" value="${room.floor}" readonly></td>
            <td><input type="text" class="form-control form-control-sm" style="border: none; box-shadow: none;" value="${room.roomType}" readonly></td>
            <td><input type="text" class="form-control form-control-sm" style="border: none; box-shadow: none;" value="${room.pricePerHour}" readonly></td>
            <td><input type="datetime-local" class="form-control" style="border: none; box-shadow: none;" value="${checkinDate}" readonly></td>
            <td><input type="datetime-local" class="form-control" style="border: none; box-shadow: none;" value="${checkoutDate}" readonly></td>
            <td>
                <button class="btn btn-danger btn-sm delete-room">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);

        row.querySelector(".delete-room").addEventListener("click", () => {
            row.remove();
            SelectedRooms = SelectedRooms.filter(r => r.roomId !== room.roomId);
            calculateTotalMoney();
        });

        calculateTotalMoney();
    });

    availableroomfound = [];
    document.getElementById("search-room-body").innerHTML = "";
    document.getElementById("checkin").value = "";
    document.getElementById("checkout").value = "";
    document.getElementById("floor").value = "";
    document.getElementById("find-room-modal").style.display = "none";
});

// Book Immediately
document.getElementById("book-room").addEventListener("click", function () {
    if (!cusid) {
        alert("No customer ID found. Please add a customer first.");
        return;
    }

    if (SelectedRooms.length === 0) {
        alert("Please select at least one room to book.");
        return;
    }

    const requestBody = {
        GuestId: cusid,
        BRdto: SelectedRooms.map(room => ({
            RoomId: room.roomId,
            CheckInDate: room.checkInDate,
            CheckOutDate: room.checkOutDate ,
            // CheckInDate: new Date(room.checkInDate).toISOString(),
            // CheckOutDate: new Date(room.checkOutDate).toISOString(),
        })),
    };

    fetch("https://hotel-bed.onrender.com/api/Booking/BookImmediately", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
    })
        .then(response => {
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            alert("Room booked successfully!");
            console.log("Booking response:", data);
            SelectedRooms = [];
            document.getElementById("room-table-body").innerHTML = "";
            cusid = "";
            document.getElementById("name").value = "";
            document.getElementById("phonenum").value = "";
            document.getElementById("deposit").value = "";
            document.getElementById("total-money").value = "0.00";
        })
        .catch(error => {
            console.error("Booking error:", error);
            alert(`Failed to book room: ${error.message}`);
        });
});

// Pre-Book
document.getElementById("pre-book").addEventListener("click", function () {
    if (!cusid) {
        alert("No customer ID found. Please add a customer first.");
        return;
    }

    if (SelectedRooms.length === 0) {
        alert("Please select at least one room to pre-book.");
        return;
    }

    const deposit = parseFloat(document.getElementById("deposit").value) || 0;
    if (deposit <= 0) {
        alert("Please enter a valid deposit amount.");
        return;
    }

    const requestBody = {
        GuestId: cusid,
        Deposit: deposit,
        BRdto: SelectedRooms.map(room => ({
            RoomId: room.roomId,
            CheckInDate: room.checkInDate,
            CheckOutDate: room.checkOutDate,
            // CheckInDate: new Date(room.checkInDate).toISOString(),
            // CheckOutDate: new Date(room.checkOutDate).toISOString(),
        })),
    };

    fetch("https://hotel-bed.onrender.com/api/Booking/BookInAdvance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
    })
        .then(response => {
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            alert("Room pre-booked successfully!");
            console.log("Pre-booking response:", data);
            SelectedRooms = [];
            document.getElementById("room-table-body").innerHTML = "";
            document.getElementById("deposit").value = "";
            document.getElementById("total-money").value = "0.00";
        })
        .catch(error => {
            console.error("Pre-booking error:", error);
            alert(`Failed to pre-book room: ${error.message}`);
        });
});

function calculateTotalMoney() {
    let totalMoney = 0;
    const rows = document.querySelectorAll("#room-table-body tr");

    rows.forEach(row => {
        const pricePerHour = parseFloat(row.cells[3].querySelector("input").value) || 0;
        const checkInValue = row.cells[4].querySelector("input").value;
        const checkOutValue = row.cells[5].querySelector("input").value;

        if (checkInValue && checkOutValue) {
            const checkIn = new Date(checkInValue);
            const checkOut = new Date(checkOutValue);

            if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime()) && checkOut > checkIn) {
                const hours = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60));
                totalMoney += pricePerHour * hours;
            }
        }
    });

    document.getElementById("total-money").value = totalMoney.toFixed(2);
}

document.getElementById("phonenum").addEventListener("input", async function () {
    const resultList = document.getElementById("customer-result-list");
    resultList.innerHTML = ""; // Clear previous results

    let phone = this.value.trim();
    if (phone.length < 2) {
        resultList.style.display = "none";
        return;
    }

    try {
        let response = await fetch(`https://hotel-bed.onrender.com/api/Guest/SearchTblGuest?s=${phone}`);
        let data = await response.json();

        if (data.data.length > 0) {
            data.data.forEach(guest => {
                let item = document.createElement("div");
                item.classList.add("customer-item");
                item.textContent = `${guest.gFirstName} ${guest.gLastName} - ${guest.gPhoneNumber}`;
                item.dataset.name = `${guest.gFirstName} ${guest.gLastName}`;
                item.dataset.phone = guest.gPhoneNumber;
                item.dataset.id = guest.gGuestId;

                item.addEventListener("click", function () {
                    document.getElementById("name").value = this.dataset.name;
                    document.getElementById("phonenum").value = this.dataset.phone;
                    cusid = this.dataset.id;
                    resultList.style.display = "none";
                });

                resultList.appendChild(item);
            });
            resultList.style.display = "block";
        } else {
            resultList.style.display = "none";
        }
    } catch (error) {
        console.error("Error when call API:", error);
    }
});
