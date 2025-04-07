document.addEventListener("DOMContentLoaded", function () {
    const partnerTable = document.querySelector("#partnerTable");
    const partnerForm = document.querySelector("#partnerForm");
    const partnerNameInput = document.querySelector("#partnerName");
    const partnerTypeInput = document.querySelector("#partnerType");
    const partnerEmailInput = document.querySelector("#partnerEmail");
    const partnerPhoneInput = document.querySelector("#partnerPhone");
    const partnerAddressInput = document.querySelector("#partnerAddress");
    const partnerSubmitBtn = document.querySelector("button[type='submit']");
    const partnerUpdateBtn = document.querySelector("#partnerUpdateBtn");

    let partners = [];
    let editPartnerIndex = null;

    async function fetchPartners() {
        try {
            const response = await fetch("https://hotel-bed.onrender.com/api/Partner/GetPartnerList");
            const data = await response.json();
            partners = data.data;
            renderPartners();
        } catch (error) {
            console.error("Error fetching partners:", error);
        }
    }

    function renderPartners() {
        partnerTable.innerHTML = "";
        partners.forEach((partner, index) => {
            let row = `
                <tr>
                    <td>${partner.pPartnerName}</td>
                    <td>${partner.pPartnerType}</td>
                    <td>${partner.pEmail}</td>
                    <td>${partner.pPhoneNumber}</td>
                    <td>${partner.pAddress}</td>
                    <td>
                        <button class="btn btn-primary me-2" onclick="editPartner(${index})">Edit</button>
                        <button class="btn btn-danger" onclick="deletePartner(${index})">Delete</button>
                    </td>
                </tr>
            `;
            partnerTable.innerHTML += row;
        });
    }

    const partnerSearchInput = document.querySelector("#partnerSearch");

    // Add search function
    async function searchPartners(searchTerm) {
        try {
            const response = await fetch(`https://hotel-bed.onrender.com/api/Partner/SearchTblPartner?s=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            partners = data.data;
            renderPartners();
        } catch (error) {
            console.error("Error searching partners:", error);
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
            fetchPartners();
        } else {
            searchPartners(searchTerm);
        }
    }, 300);

    partnerSearchInput.addEventListener("input", (e) => {
        debouncedSearch(e.target.value);
    });

    async function addPartner(partner) {
        try {
            const response = await fetch("https://hotel-bed.onrender.com/api/Partner/InsertTblPartner", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(partner)
            });
            const data = await response.json();
            partners.push(data.data);
            renderPartners();
        } catch (error) {
            console.error("Error adding partner:", error);
        }
    }

    async function updatePartner(partner) {
        try {
            const response = await fetch("https://hotel-bed.onrender.com/api/Partner/UpdateTblPartner", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(partner)
            });
            await fetchPartners();

        } catch (error) {
            console.error("Error updating partner:", error);
        }
    }

    async function deletePartner(index) {
        try {
            const partner = partners[index];
            await fetch(`https://hotel-bed.onrender.com/api/Partner/XoaTblPartner?pPartnerId=${partner.pPartnerId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ pPartnerId: partner.pPartnerId })
            });
            await fetchPartners();

        } catch (error) {
            console.error("Error deleting partner:", error);
        }
    }

    partnerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        let name = partnerNameInput.value.trim();
        let type = partnerTypeInput.value.trim();
        let email = partnerEmailInput.value.trim();
        let phone = partnerPhoneInput.value.trim();
        let address = partnerAddressInput.value.trim();

        const partner = {
            pPartnerId: crypto.randomUUID(),
            pPartnerName: name,
            pPartnerType: type,
            pEmail: email,
            pPhoneNumber: phone,
            pAddress: address
        };

        addPartner(partner);
        partnerForm.reset();
    });

    window.editPartner = function (index) {
        let partner = partners[index];
        partnerNameInput.value = partner.pPartnerName;
        partnerTypeInput.value = partner.pPartnerType;
        partnerEmailInput.value = partner.pEmail;
        partnerPhoneInput.value = partner.pPhoneNumber;
        partnerAddressInput.value = partner.pAddress;

        editPartnerIndex = index;
        partnerSubmitBtn.style.display = "none";
        partnerUpdateBtn.style.display = "inline-block";
    };

    partnerUpdateBtn.addEventListener("click", function () {
        let name = partnerNameInput.value.trim();
        let type = partnerTypeInput.value.trim();
        let email = partnerEmailInput.value.trim();
        let phone = partnerPhoneInput.value.trim();
        let address = partnerAddressInput.value.trim();

        const partner = {
            pPartnerId: partners[editPartnerIndex].pPartnerId,
            pPartnerName: name,
            pPartnerType: type,
            pEmail: email,
            pPhoneNumber: phone,
            pAddress: address
        };

        updatePartner(partner);
        partnerForm.reset();
        partnerSubmitBtn.style.display = "inline-block";
        partnerUpdateBtn.style.display = "none";
        editPartnerIndex = null;
    });

    window.deletePartner = function (index) {
        if (confirm("Are you sure to delete this partner?")) {
            deletePartner(index);
        }
    };

    fetchPartners();
});