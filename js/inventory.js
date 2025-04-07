// Constants
const API_BASE_URL = "https://hotel-bed.onrender.com/api";

// State
const state = {
    productsList: [],
    editProductId: null,
    importDetailsList: [],
    servicePackagesList: [],
    packageDetailsList: [],
};

// DOM Elements
const domElements = {
    goodsTableBody: document.querySelector("#goods-table-body"),
    servicesTableBody: document.querySelector("#services-table-body"),
    productHistoryTable: document.querySelector("#product-history-table"),
    historyProductName: document.querySelector("#history-product-name"),
    addProductForm: document.querySelector("#add-product-form"),
    pProductNameInput: document.querySelector("#p-product-name"),
    pCategoryInput: document.querySelector("#p-category"),
    pUnitInput: document.querySelector("#p-unit"),
    pCostPriceInput: document.querySelector("#p-cost-price"),
    pSellingPriceInput: document.querySelector("#p-selling-price"),
    pIsServiceCheckbox: document.querySelector("#p-is-service"),
    addProductBtn: document.querySelector("#add-product-btn"),
    updateProductBtn: document.querySelector("#update-product-btn"),
    productSearchInput: document.querySelector("#product-search-input"),
    importGoodsTableBody: document.querySelector("#import-goods-table-body"),
    addImportTable: document.querySelector("#add-import-table"),
    importDetailTable: document.querySelector("#import-detail-table"),
    igSupplierInput: document.querySelector("#ig-supplier"),
    igdProductSelect: document.querySelector("#igd-product-select"),
    igdQuantityInput: document.querySelector("#igd-quantity"),
    addImportDetailBtn: document.querySelector("#add-import-detail-btn"),
    finalizeImportBtn: document.querySelector("#finalize-import-btn"),
    importHistoryTableBody: document.querySelector("#import-history-table-body"),
    servicePackagesTableBody: document.querySelector("#service-packages-table-body"),
    addServicePackageForm: document.querySelector("#add-service-package-form"),
    spPackageNameInput: document.querySelector("#sp-package-name"),
    pdProductSelect: document.querySelector("#pd-product-select"),
    pdQuantityInput: document.querySelector("#pd-quantity"),
    addPackageDetailBtn: document.querySelector("#add-package-detail-btn"),
    finalizeServicePackageBtn: document.querySelector("#finalize-service-package-btn"),
    packageSearchInput: document.querySelector("#package-search-input"),
};

// Initialization
document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
    setupEventListeners();
    fetchInitialData();
}

// Debounce function to limit the rate
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

// Search Functions
async function searchProducts(searchTerm) {
    if (!searchTerm.trim()) {
        await api.fetchProducts();
        return;
    }
    const filteredProducts = state.productsList.filter(product =>
        product.pProductName.toLowerCase().includes(searchTerm)
    );
    renderProductsTable(filteredProducts);
}

async function searchPackages(searchTerm) {
    if (!searchTerm.trim()) {
        await api.fetchServicePackages();
        return;
    }
    const filteredPackages = state.servicePackagesList.filter(package =>
        package.spPackageName.toLowerCase().includes(searchTerm)
    );
    renderServicePackagesTable(filteredPackages);
}

const debouncedProductSearch = debounce((searchTerm) => {
    searchProducts(searchTerm);
}, 300);

const debouncedPackageSearch = debounce((searchTerm) => {
    searchPackages(searchTerm);
}, 300);

// Event Listeners
function setupEventListeners() {
    domElements.addProductForm.addEventListener("submit", handleAddProduct);
    domElements.goodsTableBody.addEventListener("click", handleProductsTableActions);
    domElements.servicesTableBody.addEventListener("click", handleProductsTableActions);
    domElements.updateProductBtn.addEventListener("click", handleUpdateProduct);
    domElements.addImportDetailBtn.addEventListener("click", handleAddImportDetail);
    domElements.finalizeImportBtn.addEventListener("click", handleFinalizeImport);
    domElements.addPackageDetailBtn.addEventListener("click", handleAddPackageDetail);
    domElements.finalizeServicePackageBtn.addEventListener("click", handleFinalizeServicePackage);
    domElements.servicePackagesTableBody.addEventListener("click", handleServicePackagesTableActions);

    domElements.productSearchInput.addEventListener("input", (e) => {
        debouncedProductSearch(e.target.value.trim().toLowerCase());
    });
    domElements.packageSearchInput.addEventListener("input", (e) => {
        debouncedPackageSearch(e.target.value.trim().toLowerCase());
    });
}

// Data Fetching
async function fetchInitialData() {
    await Promise.all([
        api.fetchProducts(),
        api.fetchImportGoods(),
        api.fetchImportHistory(),
        api.fetchServicePackages(),
    ]);
}

// API Calls
const api = {
    fetchProducts: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/Product/GetProductList`);
            if (!response.ok) throw new Error((await response.json()).message || "Failed to fetch products");
            const data = await response.json();
            state.productsList = data.data;
            renderProductsTable();
            populateIgdProductSelect(data.data);
            populatePdProductSelect(data.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    },

    fetchProductHistory: async (productId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/Igd/GetImportGoodsDetailListByGood/${productId}`);
            if (!response.ok) throw new Error((await response.json()).message || "Failed to fetch product history");
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error("Error fetching product history:", error);
            return [];
        }
    },

    fetchImportGoods: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/ImportGood/GetImportGoodList`);
            if (!response.ok) throw new Error((await response.json()).message || "Failed to fetch import goods");
            const data = await response.json();
            renderImportGoodsTable(data.data);
        } catch (error) {
            console.error("Error fetching import goods:", error);
        }
    },

    fetchImportDetails: async (importId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/Igd/GetImportGoodsDetailListByImport/${importId}`);
            if (!response.ok) throw new Error((await response.json()).message || "Failed to fetch import details");
            const data = await response.json();
            renderImportDetails(data.data);
        } catch (error) {
            console.error("Error fetching import details:", error);
        }
    },

    fetchImportHistory: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/Igd/GetImportGoodsDetailList`);
            if (!response.ok) throw new Error((await response.json()).message || "Failed to fetch import history");
            const data = await response.json();
            renderImportHistoryTable(data.data);
        } catch (error) {
            console.error("Error fetching import history:", error);
        }
    },

    fetchServicePackages: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/Package/GetPackageList`);
            if (!response.ok) throw new Error((await response.json()).message || "Failed to fetch service packages");
            const data = await response.json();
            state.servicePackagesList = data.data;
            renderServicePackagesTable(data.data);
        } catch (error) {
            console.error("Error fetching service packages:", error);
        }
    },

    addProduct: async (product) => {
        const response = await fetch(`${API_BASE_URL}/Product/InsertTblProduct`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product),
        });
        if (!response.ok) throw new Error((await response.json()).message || "Failed to add product");
        return await response.json();
    },

    updateProduct: async (product) => {
        const response = await fetch(`${API_BASE_URL}/Product/UpdateTblProduct`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product),
        });
        if (!response.ok) throw new Error((await response.json()).message || "Failed to update product");
        return await response.json();
    },

    deleteProduct: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Product/XoaTblProduct?pProductId=${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error((await response.json()).message || "Failed to delete product");
        return await response.json();
    },

    insertImportGood: async (importData) => {
        const response = await fetch(`${API_BASE_URL}/ImportGood/InsertTblImportGood`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(importData),
        });
        if (!response.ok) throw new Error((await response.json()).message || "Failed to insert import good");
        return await response.json();
    },

    insertImportGoodsDetail: async (detailData) => {
        const response = await fetch(`${API_BASE_URL}/Igd/InsertTblImportGoodsDetail`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(detailData),
        });
        if (!response.ok) throw new Error((await response.json()).message || "Failed to insert import goods detail");
        return await response.json();
    },

    addServicePackage: async (servicePackage) => {
        const response = await fetch(`${API_BASE_URL}/Package/InsertTblPackage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(servicePackage),
        });
        if (!response.ok) throw new Error((await response.json()).message || "Failed to add service package");
        return await response.json();
    },

    deleteServicePackage: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Package/XoaTblPackage?spPackageId=${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error((await response.json()).message || "Failed to delete service package");
        return await response.json();
    },
};

// Products Management
async function handleAddProduct(event) {
    event.preventDefault();
    const newProduct = {
        pProductName: domElements.pProductNameInput.value.trim(),
        pCategory: domElements.pCategoryInput.value.trim(),
        pQuantity: 0,
        pUnit: domElements.pUnitInput.value.trim(),
        pCostPrice: parseFloat(domElements.pCostPriceInput.value),
        pSellingPrice: parseFloat(domElements.pSellingPriceInput.value),
        pCurrency: "USD",
        pIsService: domElements.pIsServiceCheckbox.checked,
        isActive: true,
    };
    try {
        await api.addProduct(newProduct);
        await api.fetchProducts();
        domElements.addProductForm.reset();
        domElements.pIsServiceCheckbox.checked = false;
        alert("Product added successfully.");
    } catch (error) {
        console.error("Error adding product:", error);
        alert(error.message);
    }
}

function handleProductsTableActions(event) {
    const target = event.target;
    const productId = target.dataset.productId;
    if (target.classList.contains("update-product-btn")) {
        editProduct(productId);
    } else if (target.classList.contains("delete-product-btn")) {
        deleteProduct(productId);
    } else if (target.classList.contains("history-btn")) {
        showProductHistory(productId, target.dataset.productName);
    }
}

function editProduct(productId) {
    const product = state.productsList.find((p) => p.pProductId === productId);
    if (!product) return;
    domElements.pProductNameInput.value = product.pProductName;
    domElements.pCategoryInput.value = product.pCategory;
    domElements.pUnitInput.value = product.pUnit;
    domElements.pCostPriceInput.value = product.pCostPrice;
    domElements.pSellingPriceInput.value = product.pSellingPrice;
    domElements.pIsServiceCheckbox.checked = product.pIsService === true;
    state.editProductId = productId;
    domElements.addProductBtn.style.display = "none";
    domElements.updateProductBtn.style.display = "inline-block";
}

async function handleUpdateProduct() {
    const product = state.productsList.find((p) => p.pProductId === state.editProductId);
    if (!product) return;
    const isService = domElements.pIsServiceCheckbox.checked;
    product.pProductName = domElements.pProductNameInput.value.trim();
    product.pCategory = domElements.pCategoryInput.value.trim();
    product.pUnit = domElements.pUnitInput.value.trim();
    product.pCostPrice = parseFloat(domElements.pCostPriceInput.value);
    product.pSellingPrice = parseFloat(domElements.pSellingPriceInput.value);
    product.pCurrency = "USD";
    product.pIsService = isService ? true : false;
    product.isActive = true;
    try {
        const result = await api.updateProduct(product);
        await api.fetchProducts();
        domElements.addProductForm.reset();
        domElements.addProductBtn.style.display = "inline-block";
        domElements.updateProductBtn.style.display = "none";
        domElements.pIsServiceCheckbox.checked = false;
        state.editProductId = null;
        alert(result.message);
    } catch (error) {
        console.error("Error updating product:", error);
        alert(error.message);
    }
}

async function deleteProduct(productId) {
    if (confirm("Are you sure you want to delete this product?")) {
        try {
            const result = await api.deleteProduct(productId);
            await api.fetchProducts();
            alert(result.message);
        } catch (error) {
            console.error("Error deleting product:", error);
            alert(error.message);
        }
    }
}

async function showProductHistory(productId, productName) {
    const history = await api.fetchProductHistory(productId);
    renderProductHistoryTable(history, productName);
}

// Add Import Functions
function handleAddImportDetail() {
    const productId = domElements.igdProductSelect.value;
    const quantity = parseInt(domElements.igdQuantityInput.value);
    const selectedOption = domElements.igdProductSelect.selectedOptions[0];
    const costPrice = parseFloat(selectedOption.dataset.cost);
    const productName = selectedOption.text;
    if (!productId || !quantity || quantity <= 0) {
        alert("Please select a product and enter a valid quantity");
        return;
    }
    if (state.importDetailsList.some((detail) => detail.productId === productId)) {
        alert("This product is already added to the import");
        return;
    }
    state.importDetailsList.push({ productId, quantity, costPrice, productName });
    renderAddImportTable();
    domElements.igdQuantityInput.value = "";
}

function handleRemoveImportDetail(index) {
    state.importDetailsList.splice(index, 1);
    renderAddImportTable();
}

async function handleFinalizeImport() {
    if (state.importDetailsList.length === 0) {
        alert("Please add at least one item to import");
        return;
    }
    const totalPrice = state.importDetailsList.reduce(
        (sum, detail) => sum + detail.quantity * detail.costPrice,
        0
    );
    const importData = {
        igSupplier: domElements.igSupplierInput.value.trim(),
        igSumPrice: totalPrice,
        igCurrency: "USD",
        igImportDate: new Date().toISOString(),
    };
    try {
        const importResult = await api.insertImportGood(importData);
        const importId = importResult.data.igImportId;
        const detailPromises = state.importDetailsList.map((detail) => {
            const detailData = {
                igdImportId: importId,
                igdGoodsId: detail.productId,
                igdQuantity: detail.quantity,
                igdCostPrice: detail.costPrice,
            };
            return api.insertImportGoodsDetail(detailData);
        });
        await Promise.all(detailPromises);
        const quantityUpdates = state.importDetailsList.map((detail) => {
            const product = state.productsList.find((p) => p.pProductId === detail.productId);
            product.pQuantity += detail.quantity;
            return api.updateProduct(product);
        });
        await Promise.all(quantityUpdates);
        state.importDetailsList = [];
        domElements.igSupplierInput.value = "";
        renderAddImportTable();
        await Promise.all([api.fetchProducts(), api.fetchImportGoods(), api.fetchImportHistory()]);
        alert(importResult.message || "Import successfully added!");
        bootstrap.Modal.getInstance(document.getElementById("import-modal")).hide();
    } catch (error) {
        console.error("Error finalizing import:", error);
        alert(error.message);
    }
}

// Service Package Functions
function handleAddPackageDetail() {
    const productId = domElements.pdProductSelect.value;
    const quantity = parseInt(domElements.pdQuantityInput.value);
    const selectedOption = domElements.pdProductSelect.selectedOptions[0];
    const productName = selectedOption.text;
    const costPrice = parseFloat(selectedOption.dataset.cost);
    const sellingPrice = parseFloat(selectedOption.dataset.sellingPrice || 0);
    if (!productId || !quantity || quantity <= 0) {
        alert("Please select a product and enter a valid quantity");
        return;
    }
    if (state.packageDetailsList.some((detail) => detail.productId === productId)) {
        alert("This product is already added to the package");
        return;
    }
    state.packageDetailsList.push({ productId, quantity, productName, costPrice, sellingPrice });
    renderPackageDetailsTable();
    domElements.pdQuantityInput.value = "";
}

function handleRemovePackageDetail(index) {
    state.packageDetailsList.splice(index, 1);
    renderPackageDetailsTable();
}

async function handleFinalizeServicePackage() {
    if (state.packageDetailsList.length === 0) {
        alert("Please add at least one product to the package");
        return;
    }
    const totalCostPrice = state.packageDetailsList.reduce(
        (sum, detail) => sum + detail.costPrice * detail.quantity,
        0
    );
    const totalSellPrice = state.packageDetailsList.reduce(
        (sum, detail) => sum + detail.sellingPrice * detail.quantity,
        0
    );
    const servicePackageData = {
        spPackageName: domElements.spPackageNameInput.value.trim(),
        sServiceCostPrice: totalCostPrice,
        sServiceSellPrice: totalSellPrice,
        packageDetails: state.packageDetailsList.map(detail => ({
            pdProductId: detail.productId,
            pdQuantity: detail.quantity
        })),
        isActive: true,
    };
    try {
        const result = await api.addServicePackage(servicePackageData);
        await api.fetchServicePackages();
        state.packageDetailsList = [];
        domElements.addServicePackageForm.reset();
        renderPackageDetailsTable();
        alert(result.message || "Service package added successfully!");
        bootstrap.Modal.getInstance(document.getElementById("service-modal")).hide();
    } catch (error) {
        console.error("Error adding service package:", error);
        alert(error.message);
    }
}

function handleServicePackagesTableActions(event) {
    const target = event.target;
    const servicePackageId = target.dataset.servicePackageId;
    if (target.classList.contains("delete-service-package-btn")) {
        deleteServicePackage(servicePackageId);
    }
}

async function deleteServicePackage(servicePackageId) {
    if (confirm("Are you sure you want to delete this service package?")) {
        try {
            const result = await api.deleteServicePackage(servicePackageId);
            await api.fetchServicePackages();
            alert(result.message);
        } catch (error) {
            console.error("Error deleting service package:", error);
            alert(error.message);
        }
    }
}

// Rendering Functions
function renderProductsTable(products = state.productsList) {
    domElements.goodsTableBody.innerHTML = "";
    domElements.servicesTableBody.innerHTML = "";
    products
        .filter((product) => product.pIsService === false)
        .forEach((product) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.pProductName}</td>
                <td>${product.pCategory}</td>
                <td>${product.pQuantity}</td>
                <td>${product.pUnit}</td>
                <td>${product.pCostPrice}</td>
                <td>${product.pSellingPrice}</td>
                <td>${product.pCurrency}</td>
                <td>
                    <button class="history-btn btn btn-sm btn-info" data-product-id="${product.pProductId}" data-product-name="${product.pProductName}" data-bs-toggle="modal" data-bs-target="#product-history-modal">History</button>
                    <button class="update-product-btn btn btn-sm btn-primary" data-product-id="${product.pProductId}">Update</button>
                    <button class="delete-product-btn btn btn-sm btn-danger" data-product-id="${product.pProductId}">Delete</button>
                </td>
            `;
            domElements.goodsTableBody.appendChild(row);
        });
    products
        .filter((product) => product.pIsService === true)
        .forEach((product) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.pProductName}</td>
                <td>${product.pCategory}</td>
                <td>${product.pUnit}</td>
                <td>${product.pCostPrice}</td>
                <td>${product.pSellingPrice}</td>
                <td>${product.pCurrency}</td>
                <td>
                    <button class="update-product-btn btn btn-sm btn-primary" data-product-id="${product.pProductId}">Update</button>
                    <button class="delete-product-btn btn btn-sm btn-danger" data-product-id="${product.pProductId}">Delete</button>
                </td>
            `;
            domElements.servicesTableBody.appendChild(row);
        });
}

function renderProductHistoryTable(history, productName) {
    domElements.historyProductName.textContent = productName;
    domElements.productHistoryTable.innerHTML = "";
    if (history && history.length > 0) {
        const sortedHistory = [...history].sort((a, b) => new Date(b.igImportDate) - new Date(a.igImportDate));
        sortedHistory.forEach((record) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${record.igSupplier}</td>
                <td>${record.igdQuantity}</td>
                <td>${record.igdCostPrice}</td>
                <td>${new Date(record.igImportDate).toLocaleDateString()}</td>
            `;
            domElements.productHistoryTable.appendChild(row);
        });
    } else {
        domElements.productHistoryTable.innerHTML = '<tr><td colspan="4">No import history found</td></tr>';
    }
}

function renderImportGoodsTable(importGoods) {
    domElements.importGoodsTableBody.innerHTML = "";
    const sortedImportGoods = [...importGoods].sort((a, b) => new Date(b.igImportDate) - new Date(a.igImportDate));
    sortedImportGoods.forEach((importGood) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${importGood.igSupplier}</td>
            <td>${importGood.igSumPrice}</td>
            <td>${importGood.igCurrency}</td>
            <td>${new Date(importGood.igImportDate).toLocaleString()}</td>
            <td>
                <button class="view-details-btn btn btn-sm btn-info" data-import-id="${importGood.igImportId}" data-bs-toggle="modal" data-bs-target="#import-detail-modal">View Details</button>
            </td>
        `;
        domElements.importGoodsTableBody.appendChild(row);
    });
    document.querySelectorAll(".view-details-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            const importId = button.getAttribute("data-import-id");
            await api.fetchImportDetails(importId);
        });
    });
}

function populateIgdProductSelect(products) {
    domElements.igdProductSelect.innerHTML = '<option value="">Select a product</option>';
    products
        .filter(product => product.pIsService === false)
        .forEach((product) => {
            domElements.igdProductSelect.innerHTML += `
            <option value="${product.pProductId}" data-cost="${product.pCostPrice}">${product.pProductName}</option>
        `;
        });
}

function renderAddImportTable() {
    domElements.addImportTable.innerHTML = "";
    state.importDetailsList.forEach((detail, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${detail.productName}</td>
            <td>${detail.quantity}</td>
            <td><button class="btn btn-danger btn-sm" onclick="handleRemoveImportDetail(${index})">Remove</button></td>
        `;
        domElements.addImportTable.appendChild(row);
    });
}

function renderImportDetails(importDetails) {
    domElements.importDetailTable.innerHTML = "";
    importDetails.forEach((importDetail) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${importDetail.pProductName}</td>
            <td>${importDetail.igdQuantity}</td>
            <td>${importDetail.igdCostPrice}</td>
        `;
        domElements.importDetailTable.appendChild(row);
    });
}

function renderImportHistoryTable(history) {
    domElements.importHistoryTableBody.innerHTML = "";
    if (history && history.length > 0) {
        const sortedHistory = [...history].sort((a, b) => new Date(b.igImportDate) - new Date(a.igImportDate));
        sortedHistory.forEach((record) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${record.pProductName}</td>
                <td>${record.igdQuantity}</td>
                <td>${record.igdCostPrice}</td>
                <td>${record.igSupplier}</td>
                <td>${new Date(record.igImportDate).toLocaleString()}</td>
            `;
            domElements.importHistoryTableBody.appendChild(row);
        });
    }
}

function renderServicePackagesTable(servicePackages) {
    domElements.servicePackagesTableBody.innerHTML = "";
    servicePackages.forEach((servicePackage) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${servicePackage.spPackageName}</td>
            <td>${servicePackage.productsInfo.split('\n').join('<br>')}</td>
            <td>${servicePackage.sServiceCostPrice.toLocaleString()} USD</td>
            <td>${servicePackage.sServiceSellPrice.toLocaleString()} USD</td>
            <td>
                <button class="delete-service-package-btn btn btn-sm btn-danger" data-service-package-id="${servicePackage.spPackageId}">Delete</button>
            </td>
        `;
        domElements.servicePackagesTableBody.appendChild(row);
    });
}

function renderPackageDetailsTable() {
    const tableBody = document.querySelector("#package-details-table-body");
    tableBody.innerHTML = "";
    state.packageDetailsList.forEach((detail, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${detail.productName}</td>
            <td>${detail.quantity}</td>
            <td>${(detail.costPrice * detail.quantity).toLocaleString()} USD</td>
            <td>${(detail.sellingPrice * detail.quantity).toLocaleString()} USD</td>
            <td><button class="btn btn-danger btn-sm" onclick="handleRemovePackageDetail(${index})">Remove</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function populatePdProductSelect(products) {
    domElements.pdProductSelect.innerHTML = '<option value="">Select a product</option>';
    products.forEach((product) => {
        domElements.pdProductSelect.innerHTML += `
            <option value="${product.pProductId}" data-cost="${product.pCostPrice}" data-selling-price="${product.pSellingPrice}">${product.pProductName}</option>
        `;
    });
}