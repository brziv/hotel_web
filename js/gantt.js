let upcomingBookings = [];
let currentBookings = [];
let pastBookings = [];
let allBookings = [];
let chart;
let dataTable;
let bookingid;
let guestName;
let deposit;
let initialtotalMoney;
let servicesList = [];
let allroom = [];

async function fetchBookings() {
    let floor = document.getElementById("floorSelect").value;
    let inDate = document.getElementById("startDate").value;
    let outDate = document.getElementById("endDate").value;

    let formattedInDate = encodeURIComponent(inDate.replace("T", " ") + ":00.000");
    let formattedOutDate = encodeURIComponent(outDate.replace("T", " ") + ":00.000");

    let apiUrl1 = `https://hotel-bed.onrender.com/api/Booking/FindBookings?indate=${formattedInDate}&outdate=${formattedOutDate}&floornum=${floor}`;
    let apiUrl2 = `https://hotel-bed.onrender.com/api/Booking/FindAllRooms?floornum=${floor}`;

    try {
        let response = await fetch(apiUrl2);
        if (!response.ok) throw new Error("Error loading data!");

        let data = await response.json();
        allroom = [];
        allroom = data;
    } catch (error) {
        console.error("Error calling API:", error);
    }
    try {
        let response = await fetch(apiUrl1);
        if (!response.ok) throw new Error("Error loading data!");

        let data = await response.json();
        allBookings = [];
        upcomingBookings = [];
        currentBookings = [];
        pastBookings = [];
        allBookings = data.bookings;
        processBookings(data.bookings);
    } catch (error) {
        console.error("Error calling API:", error);
    }
}

function processBookings(bookings) {
    if (!bookings || !Array.isArray(bookings)) {
        console.error("Bookings data is invalid:", bookings);
        return;
    }

    bookings.forEach(booking => {
        let checkinDate = new Date(booking.checkInDate);
        let checkoutDate = new Date(booking.checkOutDate);

        if (booking.bookingStatus === "Pending") {
            upcomingBookings.push([
                booking.bookingId,
                booking.firstName,
                booking.lastName,
                booking.roomnum,
                booking.bookingStatus,
                booking.totalMoney || 0,
                booking.deposit || 0,
                checkinDate,
                checkoutDate,
                booking.priceperhour
            ]);
        } else if (booking.bookingStatus === "Confirmed") {
            currentBookings.push([
                booking.bookingId,
                booking.firstName,
                booking.lastName,
                booking.roomnum,
                booking.bookingStatus,
                booking.totalMoney || 0,
                booking.deposit || 0,
                checkinDate,
                checkoutDate,
                booking.priceperhour
            ]);
        } else if (booking.bookingStatus === "Paid" || booking.bookingStatus === "Cancelled") {
            pastBookings.push([
                booking.bookingId,
                booking.firstName,
                booking.lastName,
                booking.roomnum,
                booking.bookingStatus,
                booking.totalMoney,
                booking.deposit || 0,
                checkinDate,
                checkoutDate,
                booking.priceperhour
            ]);
        }
    });

    console.log("Upcoming:", upcomingBookings);
    console.log("Current:", currentBookings);
    console.log("Past:", pastBookings);

    drawChart();
}

function changeTimePeriod() {
    fetchBookings();
}

function changeFloor() {
    fetchBookings();
}

function drawChart() {
    var container = document.getElementById("timeline");
    if (!container) {
        console.error("Timeline container not found");
        return;
    }

    chart = new google.visualization.Timeline(container);
    dataTable = new google.visualization.DataTable();

    dataTable.addColumn({ type: "string", id: "RoomNumber" });
    dataTable.addColumn({ type: "string", id: "dummy GuestName" });
    dataTable.addColumn({ type: "string", role: "tooltip", p: { html: true } });
    dataTable.addColumn({ type: 'string', id: 'style', role: 'style' });
    dataTable.addColumn({ type: "datetime", id: "Start" });
    dataTable.addColumn({ type: "datetime", id: "End" });

    let sortedAllBooking = [...upcomingBookings, ...currentBookings, ...pastBookings];
    console.log("sortedAllBooking", sortedAllBooking);

    // Colors
    let upcomingColor = "#FFA500"; // Orange (Pending)
    let currentColor = "#00FF7F";  // Green (Confirmed)
    let pastColor = "#CCCCCC";     // Gray (Paid)

    let formattedData = sortedAllBooking.map(booking => {
        try {
            let tooltipContent = `
                <div style="padding:10px;">
                    <strong>Guest:</strong> ${booking[1]} ${booking[2]} <br>
                    <strong>Room:</strong> ${booking[3]} <br>
                    <strong>Status:</strong> ${booking[4]} <br>
                    <strong>Total:</strong> $${booking[5]} <br>
                    <strong>Deposit:</strong> $${booking[6]} <br>
                    <strong>Check-in:</strong> ${new Date(booking[7]).toLocaleString()} <br>
                    <strong>Check-out:</strong> ${new Date(booking[8]).toLocaleString()}
                </div>
            `;

            // Set color based on booking status
            let bookingColor;
            if (booking[4] === "Pending") {
                bookingColor = upcomingColor;
            } else if (booking[4] === "Confirmed") {
                bookingColor = currentColor;
            } else if (booking[4] === "Paid") {
                bookingColor = pastColor;
            } else {
                bookingColor = "#CCCCCC"; // Default to gray
            }

            return [
                String(booking[3]),  // Room number
                "",
                tooltipContent,
                bookingColor,  // Color
                new Date(booking[7]), // Check-in
                new Date(booking[8])  // Check-out
            ];
        } catch (e) {
            console.error("Error formatting booking:", booking, e);
            return null;
        }
    }).filter(row => row !== null);

    // Get start and end dates from input
    const startDate = new Date(document.getElementById("startDate").value);
    const endDate = new Date(document.getElementById("endDate").value);

    // Add all rooms to the timeline
    for (let i = 0; i < allroom.length; i++) {
        let roomNum = allroom[i];
        formattedData.push([
            roomNum,
            "",
            `<div style="padding:10px;">
                <strong>Room:</strong> ${roomNum}
            </div>`,
            "#DDDDDD", // Light gray
            startDate,
            startDate
        ]);
    }

    allroom.forEach(roomNum => {
        formattedData.push([
            roomNum,
            "",
            `<div style="padding:10px;">
                <strong>Room:</strong> ${roomNum} 
            </div>`,
            "#DDDDDD", // Light gray
            endDate,
            endDate
        ]);
    });

    // Sort formattedData based on room number
    formattedData.sort((a, b) => {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
        return 0;
    });

    dataTable.addRows(formattedData);

    console.log('datatable', dataTable);
    console.log('formattedData', formattedData);
    var options = {
        alternatingRowStyle: false,
        hAxis: {
            format: "EEE, dd/MM",
        },
        height: 500
    };

    // Change cursor when hovering booked rooms
    google.visualization.events.addListener(chart, "onmouseover", function () {
        container.style.cursor = "pointer";
    });

    google.visualization.events.addListener(chart, "onmouseout", function () {
        container.style.cursor = "default";
    });

    // Open modal when selecting a booked room
    google.visualization.events.addListener(chart, 'select', function () {
        var selection = chart.getSelection();
        if (selection.length > 0) {
            var row = selection[0].row;
            // Get booking status from dataTable or use booking array
            var name = null;
            var roomnumber = null;
            var status = null;
            var totalMoney = null;
            var deposit = null;
            var timein = null;
            var timeout = null;

            // Find the corresponding booking in our arrays
            const roomNumber = dataTable.getValue(row, 0); // Assuming room number is in column 0
            const checkinDate = dataTable.getValue(row, 4);
            // Search in all booking arrays to find matching booking
            for (let booking of [...upcomingBookings, ...currentBookings, ...pastBookings]) {
                if (booking[3] === roomNumber && booking[7].getTime() === checkinDate.getTime()) { // booking[3] contains the room number
                    selectedBooking = booking;
                    name = booking[1] + ' ' + booking[2];
                    roomnumber = booking[3];
                    status = booking[4];
                    totalMoney = booking[5];
                    deposit = booking[6];
                    timein = booking[7].toLocaleString();
                    timeout = booking[8].toLocaleString();
                    break;
                }
            }
            showModal(name, roomnumber, status, totalMoney, deposit, timein, timeout);
        }
    });

    chart.draw(dataTable, options);
}

function changeBookingType() {
    var selectedFloor = parseInt(document.getElementById("floorSelect").value);
    drawChart(selectedFloor, selectedType);
}

function showModal(name, roomnumber, status, totalMoney, deposit, timein, timeout) {
    var selection = chart.getSelection();
    if (selection.length > 0) {
        var row = selection[0].row;
        // Get booking status from dataTable or use booking array
        var bookingStatus = "";

        // Find the corresponding booking in our arrays
        const roomNumber = dataTable.getValue(row, 0); // Assuming room number is in column 0
        const checkinDate = dataTable.getValue(row, 4);

        // Search in all booking arrays to find matching booking
        let selectedBooking = null;
        for (let booking of [...upcomingBookings, ...currentBookings, ...pastBookings]) {
            if (booking[3] === roomNumber && booking[7].getTime() === checkinDate.getTime()) { // booking[3] contains the room number
                selectedBooking = booking;
                bookingStatus = booking[4]; // booking[4] contains the status
                bookingid = booking[0];
                initialtotalMoney = booking[5];
                break;
            }
        }
    }
    const bookServiceBtn = document.getElementById('book-service-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkinBtn = document.getElementById('checkin-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    bookServiceBtn.style.display = 'none';
    checkoutBtn.style.display = 'none';
    checkinBtn.style.display = 'none';
    cancelBtn.style.display = 'none';

    // Show buttons based on status
    if (bookingStatus === "Confirmed") {
        // If confirmed, show check out and book service
        checkoutBtn.style.display = 'inline-block';
        bookServiceBtn.style.display = 'inline-block';
    } else if (bookingStatus === "Pending") {
        // If pending, only show check in
        checkinBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
    } else if (bookingStatus === "Paid") {
        // If paid, don't show any buttons except close
        // No additional buttons needed
    }

    document.getElementById('cust-name').textContent = name;
    document.getElementById('cust-room-num').textContent = roomnumber;
    document.getElementById('cust-status').textContent = status;
    document.getElementById('cust-total-money').textContent = totalMoney;
    document.getElementById('cust-deposit').textContent = deposit;
    document.getElementById('cust-time-in').textContent = timein;
    document.getElementById('cust-time-out').textContent = timeout;

    document.getElementById('modal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    document.body.classList.add("modal-open");
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';

    document.body.classList.remove("modal-open");
}

async function checkin() {
    var selection = chart.getSelection();
    if (selection.length > 0) {
        var row = selection[0].row;
        // Get booking status from dataTable or use booking array
        var bookingId = "";

        // Find the corresponding booking in our arrays
        const roomNumber = dataTable.getValue(row, 0); // Assuming room number is in column 0
        const checkinDate = dataTable.getValue(row, 4);

        // Search in all booking arrays to find matching booking
        for (let booking of [...upcomingBookings, ...currentBookings, ...pastBookings]) {
            if (booking[3] === roomNumber && booking[7].getTime() === checkinDate.getTime()) { // booking[3] contains the room number
                bookingId = booking[0];
                break;
            }
        }
    }
    let apiUrl = `https://hotel-bed.onrender.com/api/Booking/Checkin?id=${bookingId}`;

    try {
        let response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) throw new Error("Error loading data!");
        fetchBookings();
        closeModal();
    } catch (error) {
        console.error("Error calling API:", error);
    }
}

async function bookService() {
    document.getElementById('addservice-modal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'none';

    document.getElementById('addservice-customerName').value = document.getElementById('cust-name').textContent;
    document.getElementById('addservice-roomNumber').value = document.getElementById('cust-room-num').textContent;

    try {
        const response = await fetch(`https://hotel-bed.onrender.com/api/Package/GetPackageList`);
        const data = await response.json();
        servicesList = data.data;

        document.getElementById('addserviceTableBody').innerHTML = "";
        servicesList.forEach((service) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${service.spPackageName}</td>
                <td>${service.productsInfo.split('\n').join('<br>')}</td>
                <td>${service.sServiceSellPrice.toLocaleString()}</td>
                <td><button class="btn btn-add" onclick="addService(this)">+</button></td>
            `;
            document.getElementById('addserviceTableBody').appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching services:", error);
    }

    try {
        const response = await fetch(`https://hotel-bed.onrender.com/api/Package/FindUsedService?bookingId=${bookingid}`);
        const data = await response.json();
        var UsedservicesList = data.data;

        document.getElementById('addservice-UsedServices').querySelector('tbody').innerHTML = "";
        UsedservicesList.forEach((service) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${service.spPackageName}</td>
                <td>${service.productsInfo.split('\n').join('<br>')}</td>
                <td>${service.sServiceSellPrice.toLocaleString()}</td>
                <td>${service.quantity}</td>
                <td>${(service.sServiceSellPrice * service.quantity).toLocaleString()}</td>
            `;
            document.getElementById('addservice-UsedServices').querySelector('tbody').appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching services:", error);
    }
}

function filterServices() {
    const searchValue = document.getElementById("searchService").value.toLowerCase();
    const rows = document.querySelectorAll("#addserviceTableBody tr");

    rows.forEach(row => {
        const serviceName = row.cells[0].innerText.toLowerCase(); // Service Name column
        row.style.display = serviceName.includes(searchValue) ? "" : "none";
    });
}

function addService(button) {
    let row = button.parentElement.parentElement;
    let serviceName = row.cells[0].innerText;
    let serviceDetail = row.cells[1].innerText;
    let price = parseInt(row.cells[2].innerText.replace(/,/g, ''));

    let selectedTable = document.getElementById('addservice-selectedServices').querySelector('tbody');

    let existingRow = [...selectedTable.rows].find(r => r.cells[0].innerText === serviceName);

    if (existingRow) {
        let qtyCell = existingRow.cells[3];
        let totalCell = existingRow.cells[4];
        let qty = parseInt(qtyCell.querySelector('input').value) + 1;
        qtyCell.querySelector('input').value = qty;
        totalCell.innerText = (qty * price).toLocaleString();
    } else {
        let newRow = selectedTable.insertRow();
        newRow.innerHTML = `
            <td>${serviceName}</td>
            <td>${serviceDetail}</td>
            <td>${price.toLocaleString()}</td>
            <td><input type="number" id="addservice-quantity" class="quantity-input" value="1"></td>
            <td>${price.toLocaleString()}</td>
            <td><button class="btn btn-remove" onclick="removeService(this)">-</button></td>
        `;
    }
    document.getElementById('searchService').value = "";
}

document.addEventListener("DOMContentLoaded", function () {
    let tableBody = document.getElementById('addservice-selectedServices')?.querySelector('tbody');
    if (tableBody) {
        tableBody.addEventListener('input', function (event) {
            let targetCell = event.target;
            if (targetCell.classList.contains("quantity-input")) {
                let row = targetCell.closest('tr');
                let qty = parseInt(targetCell.value) || 0;
                let price = parseInt(row.cells[2].innerText.replace(/,/g, '')) || 0;
                let totalCell = row.cells[4];
                totalCell.innerText = (qty * price).toLocaleString();
            }
        });
    } else {
        console.error("addservice-selectedServices table not found");
    }
});

function removeService(button) {
    let row = button.parentElement.parentElement;
    row.remove();
}

async function addServicetoBooking() {
    try {
        // Get information from the selected services table
        const selectedTable = document.getElementById('addservice-selectedServices').querySelector('tbody');

        // If no services are selected
        if (selectedTable.rows.length === 0) {
            alert("Please select at least one service!");
            return;
        }

        // Create an array for API data
        const servicesData = [];

        // Loop through each row in the selected table
        for (let i = 0; i < selectedTable.rows.length; i++) {
            const row = selectedTable.rows[i];
            const serviceName = row.cells[0].innerText;
            const quantity = parseInt(row.cells[3].querySelector('input').value);

            // Find serviceID from the service name in servicesList
            const service = servicesList.find(s => s.spPackageName === serviceName);
            if (!service) {
                console.error(`Service with name not found: ${serviceName}`);
                continue;
            }

            servicesData.push({
                "packageID": service.spPackageId,
                "quantity": quantity
            });
        }

        if (servicesData.length === 0) {
            alert("Could not find IDs for the selected services!");
            return;
        }

        // Call API to add services with BookingID and service list
        const response = await fetch(`https://hotel-bed.onrender.com/api/Package/AddService?BookingID=${bookingid}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(servicesData)
        });

        if (response.ok) {
            console.log('Services added successfully');
        }
        // Close modal and refresh data
        closeAddServiceModal();
        fetchBookings();

    } catch (error) {
        console.error('ERROR:', error);
        alert('An error occurred!');
    }
}

function closeAddServiceModal() {
    document.getElementById('addservice-modal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('addservice-UsedServices').querySelector('tbody').innerHTML = "";
    document.getElementById('addservice-selectedServices').querySelector('tbody').innerHTML = "";
    document.getElementById('searchService').value = "";

    document.body.classList.remove("modal-open");
}

async function showCheckoutModal() {
    // Hide booking details modal
    document.getElementById('modal').style.display = 'none';

    // Get information from booking details modal
    const guestName = document.getElementById('cust-name').textContent;
    const deposit = document.getElementById('cust-deposit').textContent;

    // Display information in checkout modal
    document.getElementById('checkout-guest-name').textContent = guestName;

    // Get current time for checkout
    const now = new Date();

    // Find all rooms in currentBookings with the same bookingid
    const checkoutRooms = currentBookings.filter(booking => booking[0] === bookingid);
    console.log(now);
    // Prepare HTML for room information table
    let roomDetailsHTML = '';
    let totalRoomPrice = 0;

    if (checkoutRooms.length > 0) {
        checkoutRooms.forEach(room => {
            const roomNumber = room[3];
            const timeIn = new Date(room[7]);
            const timeOut = new Date(room[8]);

            const timeInFormatted = formatDateTimeLocal(timeIn);
            const timeOutFormatted = formatDateTimeLocal(timeOut);

            const roomPrice = room[9];

            const timeUsed = Math.ceil((timeOut - timeIn) / (1000 * 60 * 60));

            const roomTotalPrice = timeUsed * roomPrice;
            totalRoomPrice += roomTotalPrice;

            roomDetailsHTML += `
                <tr>
                    <td>${roomNumber}</td>
                    <td>
                        <input type="datetime-local" value="${timeInFormatted}" class="checkout-time-input" id="checkout-time-in" readonly>
                    </td>
                    <td>
                        <input type="datetime-local" value="${timeOutFormatted}" class="checkout-time-input" id="checkout-time-out" >
                    </td>
                    <td>${timeUsed.toFixed(2)}</td>
                    <td>${roomPrice.toLocaleString()} USD/h</td>
                    <td>${roomTotalPrice.toLocaleString()} USD</td>
                </tr>
            `;
        });
    } else {
        roomDetailsHTML = `<tr><td colspan="6" class="text-center">Can't find room information</td></tr>`;
    }

    document.getElementById('checkout-room-details').innerHTML = roomDetailsHTML;

    // Add event listener for datetime inputs to recalculate usage time and total when changed
    setTimeout(() => {
        const timeInputs = document.querySelectorAll('.checkout-time-input');
        timeInputs.forEach(input => {
            input.addEventListener('change', updateCheckoutCalculations);
        });
    }, 100);

    try {
        const response = await fetch(`https://hotel-bed.onrender.com/api/Package/FindUsedService?bookingId=${bookingid}`);
        const data = await response.json();
        var checkoutUsedservicesList = data.data;
        var totalServicePrice = 0;
        if (checkoutUsedservicesList.length > 0) {
            document.getElementById('checkout-services-details').innerHTML = "";
            checkoutUsedservicesList.forEach((service) => {
                const row = document.createElement("tr");
                var servicetotalprice = service.sServiceSellPrice * service.quantity;
                totalServicePrice += servicetotalprice;
                row.innerHTML = `
                    <td>${service.spPackageName}</td>
                    <td>${service.productsInfo.split('\n').join('<br>')}</td>
                    <td>${service.sServiceSellPrice.toLocaleString()}</td>
                    <td>${service.quantity}</td>
                    <td>${servicetotalprice.toLocaleString()}</td>
                `;
                document.getElementById('checkout-services-details').appendChild(row);
            });
        } else {
            document.getElementById('checkout-services-details').innerHTML = `<tr><td colspan="5" class="text-center">There are no services</td></tr>`;
        }
    } catch (error) {
        console.error("Error fetching services:", error);
    }

    // Calculate total amount
    const grandTotal = totalRoomPrice + totalServicePrice;
    const depositAmount = parseInt(deposit) || 0;
    const remaining = grandTotal - depositAmount;

    document.getElementById('checkout-total-price').textContent = grandTotal.toLocaleString();
    document.getElementById('checkout-deposit').textContent = depositAmount.toLocaleString();
    document.getElementById('checkout-remaining').textContent = remaining.toLocaleString();

    // Show checkout modal
    document.getElementById('checkoutdetail-modal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function updateCheckoutCalculations() {
    const timeInInput = document.getElementById('checkout-time-in');
    const timeOutInput = document.getElementById('checkout-time-out');

    if (!timeInInput || !timeOutInput) return;

    const timeIn = new Date(timeInInput.value);
    const timeOut = new Date(timeOutInput.value);

    if (isNaN(timeIn) || isNaN(timeOut)) return;

    // Find the current room in currentBookings
    const room = currentBookings.find(b => b[0] === bookingid);
    if (!room) return;

    const roomPrice = room[9] || initialtotalMoney / 24;

    // Calculate usage time (hours)
    const timeUsed = (timeOut - timeIn) / (1000 * 60 * 60);

    // Calculate total room price
    const roomTotalPrice = timeUsed * roomPrice;

    // Update UI
    const row = timeInInput.closest('tr');
    if (row) {
        row.cells[3].textContent = timeUsed.toFixed(2);
        row.cells[5].textContent = roomTotalPrice.toLocaleString() + ' USD';
    }

    // Update totals
    const servicesTotal = document.querySelectorAll('#checkout-services-details tr')
        .reduce((total, row) => {
            const priceCell = row.cells[4];
            if (priceCell) {
                const price = parseInt(priceCell.textContent.replace(/[^\d]/g, '')) || 0;
                return total + price;
            }
            return total;
        }, 0);

    const grandTotal = roomTotalPrice + servicesTotal;
    const depositAmount = parseInt(document.getElementById('checkout-deposit').textContent.replace(/[^\d]/g, '')) || 0;
    const remaining = grandTotal - depositAmount;

    document.getElementById('checkout-total-price').textContent = grandTotal.toLocaleString();
    document.getElementById('checkout-remaining').textContent = remaining.toLocaleString();
}

function closeCheckoutModal() {
    document.getElementById('checkoutdetail-modal').style.display = 'none';
    document.getElementById('modal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.body.classList.remove("modal-open");
}

async function checkOut() {
    try {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        const grandTotalText = document.getElementById('checkout-total-price').textContent;
        const grandTotal = parseFloat(grandTotalText.replace(/,/g, ''));

        const response = await fetch('https://hotel-bed.onrender.com/api/Booking/Checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: bookingid,
                payMethod: paymentMethod,
                total: grandTotal
            })
        });

        if (!response.ok) {
            throw new Error('Error during checkout');
        }

        alert('Payment successful!');
        closeCheckoutModal();
        fetchBookings();
        document.body.classList.remove("modal-open");
    } catch (error) {
        console.error('Error during checkout:', error);
    }
}

// Add a new function to format time correctly for datetime-local input
function formatDateTimeLocal(date) {
    // Convert time to match local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function showCancelBookingModal() {
    // Hide booking details modal
    document.getElementById('modal').style.display = 'none';

    // Get information from booking details modal
    const guestName = document.getElementById('cust-name').textContent;
    const deposit = document.getElementById('cust-deposit').textContent;

    // Display information in cancel booking modal
    document.getElementById('cancelbooking-guest-name').textContent = guestName;
    document.getElementById('cancelbooking-deposit').textContent = deposit;

    // Show cancel booking modal
    document.getElementById('cancelbooking-modal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function closeCancelBookingModal() {
    document.getElementById('cancelbooking-modal').style.display = 'none';
    document.getElementById('modal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.body.classList.remove("modal-open");
}

async function confirmCancelBooking() {
    try {
        const paymentMethod = document.querySelector('input[name="cancelPaymentMethod"]:checked').value;
        const depositText = document.getElementById('cancelbooking-deposit').textContent;
        const deposit = parseFloat(depositText.replace(/,/g, ''));

        console.log('Cancel booking with ID:', bookingid, 'and payment method:', paymentMethod, 'and deposit:', deposit);

        // Call API to cancel booking
        const response = await fetch(`https://hotel-bed.onrender.com/api/Booking/Cancelbooking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: bookingid,
                paymethod: paymentMethod,
                total: deposit
            })
        });

        if (!response.ok) {
            throw new Error('Error during booking cancellation');
        }

        // Success notification
        alert('Booking canceled successfully!');

        // Close modal and refresh data
        closeCancelBookingModal();
        fetchBookings();
        document.body.classList.remove("modal-open");

    } catch (error) {
        console.error('Error during booking cancellation:', error);
    }
}