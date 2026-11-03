/* =========================================================
   ARCHGEN DESIGN + CONSTRUCTION
   RECEIPT SYSTEM
   PROJECT ID INTEGRATED VERSION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       DOM
       ===================================================== */

    const receiptBody = document.getElementById("receiptBody");

    const addItemButton = document.getElementById("addItem");
    const calculateButton = document.getElementById("calculate");
    const saveReceiptButton = document.getElementById("saveReceipt");
    const printReceiptButton = document.getElementById("printReceipt");

    const clearRecordsButton = document.getElementById("clearRecords");

    const openProjectPortalButton =
        document.getElementById("openProjectPortal");

    const openProjectFilesButton =
        document.getElementById("openProjectFiles");

    const recordsBody =
        document.getElementById("recordsBody");

    const noRecords =
        document.getElementById("noRecords");

    const subtotalDisplay =
        document.getElementById("subtotal");

    const discountInput =
        document.getElementById("discount");

    const discountAmountDisplay =
        document.getElementById("discountAmount");

    const vatInput =
        document.getElementById("vat");

    const vatAmountDisplay =
        document.getElementById("vatAmount");

    const totalDisplay =
        document.getElementById("total");

    const receiptNoInput =
        document.getElementById("receiptNo");

    const receiptDateInput =
        document.getElementById("receiptDate");

    const clientNameInput =
        document.getElementById("clientName");

    const clientTINInput =
        document.getElementById("clientTIN");

    const projectNameInput =
        document.getElementById("projectName");

    const locationInput =
        document.getElementById("location");

    const projectIdInput =
        document.getElementById("projectId");


    /* =====================================================
       EDIT MODE
       ===================================================== */

    let editingReceiptId = null;


    /* =====================================================
       DATE
       ===================================================== */

    function getToday() {

        const today = new Date();

        const year = today.getFullYear();

        const month =
            String(today.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(today.getDate())
                .padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    if (!receiptDateInput.value) {
        receiptDateInput.value = getToday();
    }


    /* =====================================================
       PROJECT ID FROM URL
       ===================================================== */

    const urlParams =
        new URLSearchParams(window.location.search);

    const urlProjectId =
        urlParams.get("projectId");


    if (urlProjectId) {

        projectIdInput.value =
            urlProjectId.trim();

        localStorage.setItem(
            "architecturalProjectId",
            urlProjectId.trim()
        );
    }
    else {

        const savedProjectId =
            localStorage.getItem(
                "architecturalProjectId"
            );

        if (savedProjectId) {
            projectIdInput.value = savedProjectId;
        }
    }


    projectIdInput.addEventListener(
        "input",
        function () {

            const projectId =
                projectIdInput.value.trim();

            if (projectId) {

                localStorage.setItem(
                    "architecturalProjectId",
                    projectId
                );

            }

        }
    );


    /* =====================================================
       FORMAT MONEY
       ===================================================== */

    function formatMoney(amount) {

        return "₱" +
            Number(amount || 0)
                .toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
    }


    /* =====================================================
       CALCULATE
       ===================================================== */

    function calculateReceipt() {

        let subtotal = 0;

        const rows =
            receiptBody.querySelectorAll("tr");


        rows.forEach(function (row) {

            const qtyInput =
                row.querySelector(".qty");

            const priceInput =
                row.querySelector(".price");

            const amountDisplay =
                row.querySelector(".amount");


            if (
                !qtyInput ||
                !priceInput ||
                !amountDisplay
            ) {
                return;
            }


            let qty =
                parseFloat(qtyInput.value);

            let price =
                parseFloat(priceInput.value);


            if (isNaN(qty) || qty < 0) {
                qty = 0;
            }

            if (isNaN(price) || price < 0) {
                price = 0;
            }


            const amount =
                qty * price;


            amountDisplay.textContent =
                formatMoney(amount);


            subtotal += amount;

        });


        let discountRate =
            parseFloat(discountInput.value);

        if (
            isNaN(discountRate) ||
            discountRate < 0
        ) {
            discountRate = 0;
        }

        if (discountRate > 100) {
            discountRate = 100;
        }


        let vatRate =
            parseFloat(vatInput.value);

        if (
            isNaN(vatRate) ||
            vatRate < 0
        ) {
            vatRate = 0;
        }


        const discountAmount =
            subtotal *
            (discountRate / 100);


        const afterDiscount =
            subtotal -
            discountAmount;


        const vatAmount =
            afterDiscount *
            (vatRate / 100);


        const total =
            afterDiscount +
            vatAmount;


        subtotalDisplay.textContent =
            formatMoney(subtotal);

        discountAmountDisplay.textContent =
            formatMoney(discountAmount);

        vatAmountDisplay.textContent =
            formatMoney(vatAmount);

        totalDisplay.textContent =
            formatMoney(total);


        return {
            subtotal,
            discountRate,
            discountAmount,
            vatRate,
            vatAmount,
            total
        };

    }


    /* =====================================================
       CREATE ITEM ROW
       ===================================================== */

    function createItemRow(item = {}) {

        const row =
            document.createElement("tr");


        const description =
            item.description || "";

        const qty =
            item.qty !== undefined
                ? item.qty
                : 1;

        const price =
            item.price !== undefined
                ? item.price
                : 0;


        row.innerHTML = `

            <td>

                <input
                    type="text"
                    class="description"
                    placeholder="Service description"
                    value="${escapeHTML(description)}"
                >

            </td>


            <td>

                <input
                    type="number"
                    class="qty"
                    value="${qty}"
                    min="0"
                    step="1"
                >

            </td>


            <td>

                <input
                    type="number"
                    class="price"
                    value="${price}"
                    min="0"
                    step="0.01"
                >

            </td>


            <td class="amount">
                ₱0.00
            </td>


            <td>

                <button
                    type="button"
                    class="btn remove-btn"
                >
                    Remove
                </button>

            </td>

        `;


        receiptBody.appendChild(row);

        calculateReceipt();

    }


    /* =====================================================
       ADD ITEM
       ===================================================== */

    addItemButton.addEventListener(
        "click",
        function () {

            createItemRow();

        }
    );


    /* =====================================================
       REMOVE ITEM
       ===================================================== */

    receiptBody.addEventListener(
        "click",
        function (event) {

            const removeButton =
                event.target.closest(
                    ".remove-btn"
                );


            if (!removeButton) {
                return;
            }


            const row =
                removeButton.closest("tr");


            if (row) {
                row.remove();
            }


            if (
                receiptBody.querySelectorAll("tr")
                    .length === 0
            ) {
                createItemRow();
            }


            calculateReceipt();

        }
    );


    /* =====================================================
       AUTO CALCULATE
       ===================================================== */

    receiptBody.addEventListener(
        "input",
        function () {
            calculateReceipt();
        }
    );


    discountInput.addEventListener(
        "input",
        calculateReceipt
    );


    vatInput.addEventListener(
        "input",
        calculateReceipt
    );


    /* =====================================================
       CALCULATE BUTTON
       ===================================================== */

    calculateButton.addEventListener(
        "click",
        function () {

            calculateReceipt();

            alert(
                "Receipt calculated successfully."
            );

        }
    );


    /* =====================================================
       COLLECT ITEMS
       ===================================================== */

    function collectItems() {

        const items = [];

        const rows =
            receiptBody.querySelectorAll("tr");


        rows.forEach(function (row) {

            const descriptionInput =
                row.querySelector(".description");

            const qtyInput =
                row.querySelector(".qty");

            const priceInput =
                row.querySelector(".price");


            if (
                !descriptionInput ||
                !qtyInput ||
                !priceInput
            ) {
                return;
            }


            const description =
                descriptionInput.value.trim();

            const qty =
                parseFloat(qtyInput.value) || 0;

            const price =
                parseFloat(priceInput.value) || 0;


            if (
                description !== "" ||
                qty !== 0 ||
                price !== 0
            ) {

                items.push({
                    description,
                    qty,
                    price,
                    amount: qty * price
                });

            }

        });


        return items;

    }


    /* =====================================================
       SAVE RECEIPT
       ===================================================== */

    saveReceiptButton.addEventListener(
        "click",
        function () {

            const calculation =
                calculateReceipt();


            const receiptNo =
                receiptNoInput.value.trim();

            const receiptDate =
                receiptDateInput.value;

            const clientName =
                clientNameInput.value.trim();

            const clientTIN =
                clientTINInput.value.trim();

            const projectName =
                projectNameInput.value.trim();

            const location =
                locationInput.value.trim();

            const projectId =
                projectIdInput.value.trim();


            if (!receiptNo) {
                alert(
                    "Please enter a Receipt Number."
                );
                receiptNoInput.focus();
                return;
            }


            if (!receiptDate) {
                alert(
                    "Please enter the Receipt Date."
                );
                receiptDateInput.focus();
                return;
            }


            if (!clientName) {
                alert(
                    "Please enter the Client Name."
                );
                clientNameInput.focus();
                return;
            }


            if (!projectId) {
                alert(
                    "Please enter the Project ID."
                );
                projectIdInput.focus();
                return;
            }


            const items =
                collectItems();


            if (items.length === 0) {

                alert(
                    "Please add at least one service or material item."
                );

                return;
            }


            let receipts =
                getReceipts();


            /* =================================================
               EDIT EXISTING RECEIPT
               ================================================= */

            if (editingReceiptId !== null) {

                const index =
                    receipts.findIndex(
                        function (receipt) {
                            return (
                                Number(receipt.id) ===
                                Number(editingReceiptId)
                            );
                        }
                    );


                if (index === -1) {

                    alert(
                        "The receipt being edited could not be found."
                    );

                    editingReceiptId = null;

                    return;
                }


                const duplicate =
                    receipts.some(
                        function (receipt) {

                            return (
                                receipt.receiptNo === receiptNo &&
                                Number(receipt.id) !==
                                Number(editingReceiptId)
                            );

                        }
                    );


                if (duplicate) {

                    alert(
                        "Another receipt already uses this Receipt Number."
                    );

                    return;
                }


                receipts[index] = {

                    ...receipts[index],

                    receiptNo,
                    date: receiptDate,
                    clientName,
                    clientTIN,
                    projectName,
                    location,
                    projectId,
                    items,

                    subtotal:
                        calculation.subtotal,

                    discountRate:
                        calculation.discountRate,

                    discountAmount:
                        calculation.discountAmount,

                    vatRate:
                        calculation.vatRate,

                    vatAmount:
                        calculation.vatAmount,

                    total:
                        calculation.total,

                    updatedAt:
                        new Date().toISOString()

                };


                saveReceipts(receipts);


                editingReceiptId = null;

                saveReceiptButton.innerHTML =
                    "Save Receipt";


                displayRecords();


                alert(
                    "Receipt updated successfully."
                );


                return;
            }


            /* =================================================
               NEW RECEIPT
               ================================================= */

            const duplicate =
                receipts.some(
                    function (receipt) {
                        return (
                            receipt.receiptNo ===
                            receiptNo
                        );
                    }
                );


            if (duplicate) {

                alert(
                    "Receipt Number " +
                    receiptNo +
                    " already exists."
                );

                return;
            }


            const receipt = {

                id: Date.now(),

                receiptNo,

                date: receiptDate,

                clientName,

                clientTIN,

                projectName,

                location,

                projectId,

                items,

                subtotal:
                    calculation.subtotal,

                discountRate:
                    calculation.discountRate,

                discountAmount:
                    calculation.discountAmount,

                vatRate:
                    calculation.vatRate,

                vatAmount:
                    calculation.vatAmount,

                total:
                    calculation.total,

                createdAt:
                    new Date().toISOString()

            };


            receipts.push(receipt);


            saveReceipts(receipts);


            displayRecords();


            alert(
                "Receipt " +
                receiptNo +
                " has been saved successfully."
            );


            resetForNewReceipt();

        }
    );


    /* =====================================================
       RECEIPT STORAGE
       ===================================================== */

    function getReceipts() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    "architecturalReceipts"
                )
            ) || [];

        }
        catch (error) {

            console.error(error);

            return [];

        }

    }


    function saveReceipts(receipts) {

        localStorage.setItem(
            "architecturalReceipts",
            JSON.stringify(receipts)
        );

    }


    /* =====================================================
       DISPLAY RECORDS
       ===================================================== */

    function displayRecords() {

        const receipts =
            getReceipts();


        recordsBody.innerHTML = "";


        if (receipts.length === 0) {

            noRecords.style.display =
                "block";

            return;

        }


        noRecords.style.display =
            "none";


        receipts
            .slice()
            .reverse()
            .forEach(function (receipt) {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${escapeHTML(
                            receipt.receiptNo
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            receipt.date
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            receipt.clientName
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            receipt.projectName
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            receipt.projectId
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            receipt.subtotal
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            receipt.discountAmount
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            receipt.vatAmount
                        )}
                    </td>

                    <td class="record-total">
                        ${formatMoney(
                            receipt.total
                        )}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="record-view-btn"
                            data-id="${receipt.id}"
                        >
                            VIEW
                        </button>

                        <button
                            type="button"
                            class="record-portal-btn"
                            data-project-id="${escapeHTML(
                                receipt.projectId
                            )}"
                        >
                            PORTAL
                        </button>

                        <button
                            type="button"
                            class="record-delete-btn"
                            data-id="${receipt.id}"
                        >
                            DELETE
                        </button>

                    </td>

                `;


                recordsBody.appendChild(row);

            });

    }


    /* =====================================================
       VIEW / PORTAL / DELETE
       ===================================================== */

    recordsBody.addEventListener(
        "click",
        function (event) {

            const viewButton =
                event.target.closest(
                    ".record-view-btn"
                );


            const portalButton =
                event.target.closest(
                    ".record-portal-btn"
                );


            const deleteButton =
                event.target.closest(
                    ".record-delete-btn"
                );


            if (viewButton) {

                viewReceipt(
                    Number(viewButton.dataset.id)
                );

                return;
            }


            if (portalButton) {

                const projectId =
                    portalButton.dataset.projectId;

                openPortal(projectId);

                return;
            }


            if (deleteButton) {

                deleteReceipt(
                    Number(deleteButton.dataset.id)
                );

            }

        }
    );


    /* =====================================================
       VIEW RECEIPT
       ===================================================== */

    function viewReceipt(id) {

        const receipts =
            getReceipts();


        const receipt =
            receipts.find(
                function (item) {
                    return Number(item.id) === id;
                }
            );


        if (!receipt) {

            alert(
                "Receipt not found."
            );

            return;
        }


        editingReceiptId =
            Number(receipt.id);


        receiptNoInput.value =
            receipt.receiptNo || "";

        receiptDateInput.value =
            receipt.date || getToday();

        clientNameInput.value =
            receipt.clientName || "";

        clientTINInput.value =
            receipt.clientTIN || "";

        projectNameInput.value =
            receipt.projectName || "";

        locationInput.value =
            receipt.location || "";

        projectIdInput.value =
            receipt.projectId || "";


        if (receipt.projectId) {

            localStorage.setItem(
                "architecturalProjectId",
                receipt.projectId
            );

        }


        discountInput.value =
            receipt.discountRate || 0;

        vatInput.value =
            receipt.vatRate !== undefined
                ? receipt.vatRate
                : 12;


        receiptBody.innerHTML = "";


        if (
            Array.isArray(receipt.items) &&
            receipt.items.length > 0
        ) {

            receipt.items.forEach(
                function (item) {

                    createItemRow(item);

                }
            );

        }
        else {

            createItemRow();

        }


        calculateReceipt();


        saveReceiptButton.innerHTML =
            "Update Receipt";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /* =====================================================
       DELETE RECEIPT
       ===================================================== */

    function deleteReceipt(id) {

        const receipts =
            getReceipts();


        const receipt =
            receipts.find(
                function (item) {
                    return Number(item.id) === id;
                }
            );


        if (!receipt) {
            return;
        }


        const confirmed =
            confirm(
                "Delete receipt " +
                receipt.receiptNo +
                "?"
            );


        if (!confirmed) {
            return;
        }


        const updated =
            receipts.filter(
                function (item) {
                    return Number(item.id) !== id;
                }
            );


        saveReceipts(updated);


        if (
            Number(editingReceiptId) === id
        ) {

            editingReceiptId = null;

            saveReceiptButton.innerHTML =
                "Save Receipt";

        }


        displayRecords();

    }


    /* =====================================================
       CLEAR RECORDS
       ===================================================== */

    clearRecordsButton.addEventListener(
        "click",
        function () {

            const receipts =
                getReceipts();


            if (receipts.length === 0) {

                alert(
                    "There are no saved records."
                );

                return;
            }


            const confirmed =
                confirm(
                    "Are you sure you want to delete ALL receipt records?"
                );


            if (!confirmed) {
                return;
            }


            localStorage.removeItem(
                "architecturalReceipts"
            );


            editingReceiptId = null;

            saveReceiptButton.innerHTML =
                "Save Receipt";


            displayRecords();


            alert(
                "All receipt records have been deleted."
            );

        }
    );


    /* =====================================================
       OPEN PROJECT PORTAL
       ===================================================== */

    function openPortal(projectId) {

        if (!projectId) {

            alert(
                "Please enter or select a Project ID first."
            );

            return;
        }


        const cleanId =
            String(projectId).trim();


        localStorage.setItem(
            "architecturalProjectId",
            cleanId
        );


        window.location.href =
            "project-portal.html?projectId=" +
            encodeURIComponent(cleanId);

    }


    openProjectPortalButton.addEventListener(
        "click",
        function () {

            openPortal(
                projectIdInput.value.trim()
            );

        }
    );


    /* =====================================================
       PROJECT FILES
       ===================================================== */

    openProjectFilesButton.addEventListener(
        "click",
        function () {

            const projectId =
                projectIdInput.value.trim();


            if (!projectId) {

                alert(
                    "Please enter a Project ID before opening Project Files."
                );

                projectIdInput.focus();

                return;
            }


            localStorage.setItem(
                "architecturalProjectId",
                projectId
            );


            window.location.href =
                "project-files.html?projectId=" +
                encodeURIComponent(projectId);

        }
    );


    /* =====================================================
       RESET
       ===================================================== */

    function resetForNewReceipt() {

        editingReceiptId = null;

        saveReceiptButton.innerHTML =
            "Save Receipt";

        receiptNoInput.value =
            generateNextReceiptNumber();

        receiptDateInput.value =
            getToday();

        clientTINInput.value =
            "";

        receiptBody.innerHTML = "";


        createItemRow({
            description:
                "Architectural Design",

            qty: 1,

            price: 0
        });


        discountInput.value = 0;

        vatInput.value = 12;


        calculateReceipt();

    }


    /* =====================================================
       NEXT RECEIPT NUMBER
       ===================================================== */

    function generateNextReceiptNumber() {

        const receipts =
            getReceipts();


        let highest = 0;


        receipts.forEach(
            function (receipt) {

                const match =
                    String(
                        receipt.receiptNo || ""
                    )
                    .match(
                        /^AR-(\d+)$/i
                    );


                if (match) {

                    const number =
                        parseInt(
                            match[1],
                            10
                        );


                    if (number > highest) {
                        highest = number;
                    }

                }

            }
        );


        return (
            "AR-" +
            String(highest + 1)
                .padStart(4, "0")
        );

    }


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }


        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       PRINT
       ===================================================== */

    printReceiptButton.addEventListener(
        "click",
        function () {

            calculateReceipt();

            window.print();

        }
    );


    /* =====================================================
       INITIALIZE
       ===================================================== */

    if (
        receiptNoInput.value === "AR-0001" &&
        getReceipts().length > 0
    ) {

        receiptNoInput.value =
            generateNextReceiptNumber();

    }


    calculateReceipt();

    displayRecords();

});