document.addEventListener("DOMContentLoaded", function () {
    const guestTable = document.querySelector("#guestTable");
    const guestForm = document.querySelector("#guestForm");
    const guestFirstNameInput = document.querySelector("#guestFirstName");
    const guestLastNameInput = document.querySelector("#guestLastName");
    const guestEmailInput = document.querySelector("#guestEmail");
    const guestPhoneInput = document.querySelector("#guestPhone");
    const guestSubmitBtn = document.querySelector("button[type='submit']");
    const guestUpdateBtn = document.querySelector("#guestUpdateBtn");

    let guests = [];
    let editGuestIndex = null;

    async function fetchGuests() {
        try {
            const response = await fetch("https://hotel-bed.onrender.com/api/Guest/GetGuestList");
            const data = await response.json();
            guests = data.data;
            renderGuests();
        } catch (error) {
            console.error("Error fetching guests:", error);
        }
    }

    function renderGuests() {
        guestTable.innerHTML = "";
        guests.forEach((guest, index) => {
            let row = `
                <tr>
                    <td>${guest.gFirstName}</td>
                    <td>${guest.gLastName}</td>
                    <td>${guest.gEmail}</td>
                    <td>${guest.gPhoneNumber}</td>
                    <td>
                        <button class="btn btn-primary me-2" onclick="editGuest(${index})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteGuest(${index})">Delete</button>
                    </td>
                </tr>
            `;
            guestTable.innerHTML += row;
        });
    }

    const guestSearchInput = document.querySelector("#guestSearch");

    // Add search function
    async function searchGuests(searchTerm) {
        try {
            const response = await fetch(`https://hotel-bed.onrender.com/api/Guest/SearchTblGuest?s=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            guests = data.data;
            renderGuests();
        } catch (error) {
            console.error("Error searching guests:", error);
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
            fetchGuests();
        } else {
            searchGuests(searchTerm);
        }
    }, 300);

    guestSearchInput.addEventListener("input", (e) => {
        debouncedSearch(e.target.value);
    });

    guestForm.addEventListener("submit", function (event) {
        event.preventDefault();
        let firstName = guestFirstNameInput.value.trim();
        let lastName = guestLastNameInput.value.trim();
        let email = guestEmailInput.value.trim();
        let phone = guestPhoneInput.value.trim();

        const guest = {
            gGuestId: crypto.randomUUID(),
            gFirstName: firstName,
            gLastName: lastName,
            gEmail: email,
            gPhoneNumber: phone
        };

        addGuest(guest);
        guestForm.reset();
    });

    async function addGuest(guest) {
        try {
            const response = await fetch("https://hotel-bed.onrender.com/api/Guest/InsertTblGuest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(guest)
            });
            const data = await response.json();
            guests.push(data.data);
            renderGuests();
        } catch (error) {
            console.error("Error adding guest:", error);
        }
    }

    window.editGuest = function (index) {
        let guest = guests[index];
        guestFirstNameInput.value = guest.gFirstName;
        guestLastNameInput.value = guest.gLastName;
        guestEmailInput.value = guest.gEmail;
        guestPhoneInput.value = guest.gPhoneNumber;

        editGuestIndex = index;
        guestSubmitBtn.style.display = "none";
        guestUpdateBtn.style.display = "inline-block";
    };

    guestUpdateBtn.addEventListener("click", function () {
        let firstName = guestFirstNameInput.value.trim();
        let lastName = guestLastNameInput.value.trim();
        let email = guestEmailInput.value.trim();
        let phone = guestPhoneInput.value.trim();

        const guest = {
            gGuestId: guests[editGuestIndex].gGuestId,
            gFirstName: firstName,
            gLastName: lastName,
            gEmail: email,
            gPhoneNumber: phone
        };

        updateGuest(guest);
        guestForm.reset();
        guestSubmitBtn.style.display = "inline-block";
        guestUpdateBtn.style.display = "none";
        editGuestIndex = null;
    });

    async function updateGuest(guest) {
        try {
            await fetch("https://hotel-bed.onrender.com/api/Guest/UpdateTblGuest", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(guest)
            });
            await fetchGuests();

        } catch (error) {
            console.error("Error updating guest:", error);
        }
    }

    window.deleteGuest = async function (index) {
        if (confirm("Are you sure to delete this customer?")) {
            const guest = guests[index];
            try {
                const response = await fetch(`https://hotel-bed.onrender.com/api/Guest/XoaTblGuest?gGuestId=${guest.gGuestId}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    alert("Cannot delete customer with bookings.");
                    return;
                }

                alert("Customer deleted successfully.");
                await fetchGuests();

            } catch (error) {
                console.error("Error deleting guest:", error);
            }
        }
    };

    fetchGuests();
});