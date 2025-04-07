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
        if (!response.ok) throw new Error("Lỗi khi tải dữ liệu!");

        let data = await response.json();
        allroom = [];
        allroom = data;
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
    }
    try {
        let response = await fetch(apiUrl1);
        if (!response.ok) throw new Error("Lỗi khi tải dữ liệu!");

        let data = await response.json();
        allBookings = [];
        upcomingBookings = [];
        currentBookings = [];
        pastBookings = [];
        allBookings = data.bookings;
        processBookings(data.bookings);
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
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
                    <strong>Room:</strong> ${booking[3]} <br>
                    <strong>Status:</strong> ${booking[4]} <br>
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


    // Add all rooms to the timeline
    // Lấy ngày bắt đầu và kết thúc từ input
    const startDate = new Date(document.getElementById("startDate").value);
    const endDate = new Date(document.getElementById("endDate").value);

    // // Thêm tất cả phòng vào timeline
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
    console.log('formateđât', formattedData);
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

    // Open modal when select a booked room
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

    document.getElementById('cust-room-num').textContent = roomnumber;
    document.getElementById('cust-status').textContent = status;
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

// Thêm hàm mới để định dạng đúng thời gian cho input datetime-local
function formatDateTimeLocal(date) {
    // Chuyển đổi thời gian để phù hợp với múi giờ địa phương
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}
