document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* =====================================================
           PROJECT ID
           ===================================================== */

        const params =
            new URLSearchParams(
                window.location.search
            );


        const projectId =
            (
                params.get("projectId") ||
                localStorage.getItem(
                    "architecturalProjectId"
                ) ||
                ""
            ).trim();


        if (!projectId) {

            alert(
                "No Project ID was provided."
            );

            window.location.href =
                "index.html";

            return;

        }


        localStorage.setItem(
            "architecturalProjectId",
            projectId
        );


        /* =====================================================
           DOM HELPER
           ===================================================== */

        function $(id) {

            return document.getElementById(id);

        }


        /* =====================================================
           MONEY
           ===================================================== */

        function formatMoney(value) {

            return "₱" +
                Number(
                    value || 0
                ).toLocaleString(
                    "en-PH",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );

        }


        function parseAmount(value) {

            const number =
                parseFloat(
                    String(value ?? "")
                        .replace(/,/g, "")
                        .replace(/[₱\s]/g, "")
                );


            if (
                !Number.isFinite(number) ||
                number < 0
            ) {

                return 0;

            }


            return number;

        }


        function escapeHTML(value) {

            return String(
                value ?? ""
            )
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );

        }


        function clampPercent(value) {

            return Math.max(
                0,
                Math.min(
                    100,
                    value || 0
                )
            );

        }


        /* =====================================================
           STORAGE KEYS
           ===================================================== */

        const CHECKLIST_KEY =
            "architecturalProjectChecklists";


        const FINANCIAL_KEY =
            "architecturalProjectFinancials";


        const PROJECT_DATES_KEY =
            "architecturalProjectDates";


        const BUDGET_KEY =
            "architecturalProjectBudgets";


        const RECEIPTS_KEY =
            "architecturalReceipts";


        const ADDITIONAL_EXPENSES_KEY =
            "architecturalAdditionalProjectExpenses";


        /* =====================================================
           JSON STORAGE
           ===================================================== */

        function readJSON(
            key,
            fallback
        ) {

            try {

                const value =
                    JSON.parse(
                        localStorage.getItem(
                            key
                        )
                    );


                return value ?? fallback;

            }
            catch (error) {

                return fallback;

            }

        }


        /* =====================================================
           PROJECT CHECKLIST
           
           44 INDIVIDUAL CHECKLIST ITEMS
           
           Structure:
           
           I.   REGULAR DESIGN
           II.  CONSTRUCTION PHASE
           A.   PRELIMINARIES AND TEMPORARY WORKS
           B.   SITE DEVELOPMENT AND CIVIL WORKS
           C.   STRUCTURAL WORKS
           D.   ARCHITECTURAL WORKS
           E.   MEPF AND AUXILIARY WORKS
           F.   TURNOVER
           G.   POST-TURNOVER / WARRANTY
           ===================================================== */

        const CHECKLIST_PHASES = [

            {
                title:
                    "I. REGULAR DESIGN",

                tasks: [

                    "Pre-design: Client consultation, project brief, budget, and site assessment.",

                    "Conceptual Design: Prepare concept design and initial space planning.",

                    "Schematic Design: Present schematic plans, elevations, and material direction for approval.",

                    "Design Development: Final architectural and engineering plans.",

                    "Construction Documents: Prepare specifications, cost estimate, and complete signed-and-sealed architectural and engineering drawings.",

                    "Bidding, Procurement and Pre-construction."

                ]

            },


            {
                title:
                    "II. CONSTRUCTION PHASE",

                tasks: [

                    "Confirm the final approved scope, drawings, specifications, bill of quantities, and contract inclusions/exclusions.",

                    "Building permit processing."

                ]

            },


            {
                title:
                    "A. PRELIMINARIES AND TEMPORARY WORKS",

                tasks: [

                    "Mobilization, site office, temporary utilities, fencing, safety signs, and security.",

                    "Site clearing, protection of existing structures, and construction layout.",

                    "Temporary access, storage areas, scaffolding, formwork, and debris management."

                ]

            },


            {
                title:
                    "B. SITE DEVELOPMENT AND CIVIL WORKS",

                tasks: [

                    "Demolition and removal works, if applicable.",

                    "Excavation, backfilling, compaction, and grading.",

                    "Drainage, sewer, septic tank, catch basins, and water-line works.",

                    "Driveways, walkways, parking areas, retaining walls, landscaping, and external works."

                ]

            },


            {
                title:
                    "C. STRUCTURAL WORKS",

                tasks: [

                    "Foundations, footings, columns, beams, slabs, and structural framing.",

                    "Reinforcement, formwork, concrete pouring, curing, and testing.",

                    "Steel, roof framing, trusses, and required structural connections."

                ]

            },


            {
                title:
                    "D. ARCHITECTURAL WORKS",

                tasks: [

                    "Masonry, partitions, plastering, ceilings, and drywall works.",

                    "Roofing, waterproofing, insulation, gutters, and downspouts.",

                    "Doors, windows, glass, railings, stairs, and hardware.",

                    "Floor, wall, and ceiling finishes.",

                    "Painting, cabinetry, countertops, fixtures, and final accessories.",

                    "Exterior façade, cladding, canopies, and architectural features."

                ]

            },


            {
                title:
                    "E. MEPF AND AUXILIARY WORKS",

                tasks: [

                    "Plumbing, sanitary, storm drainage, and water-supply systems.",

                    "Electrical power, lighting, grounding, panels, and convenience outlets.",

                    "Mechanical ventilation, air-conditioning, and exhaust systems.",

                    "Fire-protection and fire-alarm systems, where required.",

                    "Communications, data, CCTV, access control, and other auxiliary systems.",

                    "Testing, commissioning, and coordination of all installed systems."

                ]

            },


            {
                title:
                    "F. TURNOVER",

                tasks: [

                    "Conduct final inspection with client.",

                    "Confirm all punch-list items are closed.",

                    "Turn over keys, access cards, remotes, and equipment controls.",

                    "Turn over as-built plans, warranties, manuals, and maintenance schedules.",

                    "Conduct client or facility-team orientation on building systems.",

                    "Execute certificate of completion, acceptance, and turnover documents.",

                    "Release final payment subject to contract conditions.",

                    "Start defects-liability or warranty-period monitoring."

                ]

            },


            {
                title:
                    "G. POST-TURNOVER / WARRANTY",

                tasks: [

                    "Schedule periodic warranty inspections.",

                    "Record and coordinate correction of defects.",

                    "Issue final warranty closeout confirmation.",

                    "Archive project records, final drawings, photos, and financial documents.",

                    "Request client feedback and project testimonial."

                ]

            }

        ];


        /* =====================================================
           CHECKLIST STATE
           ===================================================== */

        function getChecklistState() {

            const all =
                readJSON(
                    CHECKLIST_KEY,
                    {}
                );


            const saved =
                Array.isArray(
                    all[projectId]
                )
                    ? all[projectId]
                    : [];


            return saved;

        }


        function getTotalChecklistTasks() {

            return CHECKLIST_PHASES.reduce(
                function (
                    total,
                    phase
                ) {

                    return total +
                        phase.tasks.length;

                },
                0
            );

        }


        /* =====================================================
           RENDER CHECKLIST
           ===================================================== */

        function renderChecklist() {

            const saved =
                getChecklistState();


            const container =
                $("checklistContainer");


            if (!container) {

                return;

            }


            container.innerHTML = "";


            let index = 0;


            CHECKLIST_PHASES.forEach(
                function (phase) {

                    const box =
                        document.createElement(
                            "div"
                        );


                    box.className =
                        "checklist-phase";


                    const title =
                        document.createElement(
                            "h3"
                        );


                    title.textContent =
                        phase.title;


                    box.appendChild(
                        title
                    );


                    phase.tasks.forEach(
                        function (taskName) {

                            const taskIndex =
                                index++;


                            const row =
                                document.createElement(
                                    "label"
                                );


                            row.className =
                                "task";


                            if (
                                saved[taskIndex]
                            ) {

                                row.classList.add(
                                    "completed"
                                );

                            }


                            const checkbox =
                                document.createElement(
                                    "input"
                                );


                            checkbox.type =
                                "checkbox";


                            checkbox.dataset.index =
                                taskIndex;


                            checkbox.checked =
                                Boolean(
                                    saved[
                                        taskIndex
                                    ]
                                );


                            const text =
                                document.createElement(
                                    "span"
                                );


                            text.textContent =
                                taskName;


                            row.appendChild(
                                checkbox
                            );


                            row.appendChild(
                                text
                            );


                            box.appendChild(
                                row
                            );

                        }
                    );


                    container.appendChild(
                        box
                    );

                }
            );


            updateChecklistProgress();

        }


        /* =====================================================
           CHECKLIST PROGRESS
           ===================================================== */

        function updateChecklistProgress() {

            const saved =
                getChecklistState();


            const total =
                getTotalChecklistTasks();


            const completed =
                saved
                    .slice(
                        0,
                        total
                    )
                    .filter(
                        Boolean
                    )
                    .length;


            const percent =
                total > 0
                    ? Math.round(
                        (
                            completed /
                            total
                        ) * 100
                    )
                    : 0;


            const projectProgress =
                $("projectProgress");


            const checklistProgress =
                $("checklistProgress");


            const checklistProgressText =
                $("checklistProgressText");


            const checklistProgressBar =
                $("checklistProgressBar");


            const checklistStatus =
                $("checklistStatus");


            if (projectProgress) {

                projectProgress.textContent =
                    percent + "%";

            }


            if (checklistProgress) {

                checklistProgress.textContent =
                    percent + "%";

            }


            if (checklistProgressText) {

                checklistProgressText.textContent =
                    completed +
                    " of " +
                    total +
                    " tasks completed";

            }


            if (checklistProgressBar) {

                checklistProgressBar.style.width =
                    percent + "%";

            }


            if (!checklistStatus) {

                return;

            }


            if (
                percent === 100
            ) {

                checklistStatus.textContent =
                    "Project checklist is complete.";

            }
            else if (
                percent === 0
            ) {

                checklistStatus.textContent =
                    "Project work has not started.";

            }
            else {

                checklistStatus.textContent =
                    percent +
                    "% of the project checklist is complete.";

            }

        }


        /* =====================================================
           CHECKLIST CHANGE EVENT
           ===================================================== */

        $("checklistContainer")
            .addEventListener(
                "change",
                function (event) {


                    const checkbox =
                        event.target.closest(
                            "input[data-index]"
                        );


                    if (!checkbox) {

                        return;

                    }


                    const all =
                        readJSON(
                            CHECKLIST_KEY,
                            {}
                        );


                    const saved =
                        getChecklistState();


                    saved[
                        Number(
                            checkbox.dataset.index
                        )
                    ] =
                        checkbox.checked;


                    all[projectId] =
                        saved;


                    localStorage.setItem(
                        CHECKLIST_KEY,
                        JSON.stringify(
                            all
                        )
                    );


                    const task =
                        checkbox.closest(
                            ".task"
                        );


                    if (task) {

                        task.classList.toggle(
                            "completed",
                            checkbox.checked
                        );

                    }


                    updateChecklistProgress();

                }
            );


        /* =====================================================
           RESET CHECKLIST
           ===================================================== */

        $("resetChecklist")
            .addEventListener(
                "click",
                function () {


                    if (
                        !confirm(
                            "Reset all checklist tasks for this project?"
                        )
                    ) {

                        return;

                    }


                    const all =
                        readJSON(
                            CHECKLIST_KEY,
                            {}
                        );


                    delete all[projectId];


                    localStorage.setItem(
                        CHECKLIST_KEY,
                        JSON.stringify(
                            all
                        )
                    );


                    renderChecklist();

                }
            );


        /* =====================================================
           RECEIPTS
           ===================================================== */

        function getProjectReceipts() {

            const all =
                readJSON(
                    RECEIPTS_KEY,
                    []
                );


            if (
                !Array.isArray(all)
            ) {

                return [];

            }


            return all.filter(
                function (receipt) {


                    return String(
                        receipt.projectId ||
                        ""
                    )
                        .trim()
                        .toLowerCase() ===
                    projectId
                        .toLowerCase();

                }
            );

        }


        function getLatestReceipt() {

            const list =
                getProjectReceipts()
                    .slice()
                    .sort(
                        function (a,b) {


                            const dateA =
                                new Date(
                                    a.updatedAt ||
                                    a.date ||
                                    0
                                ).getTime();


                            const dateB =
                                new Date(
                                    b.updatedAt ||
                                    b.date ||
                                    0
                                ).getTime();


                            return dateB -
                                dateA;

                        }
                    );


            return list[0] || null;

        }


        /* =====================================================
           PROJECT INFORMATION
           ===================================================== */

        function loadProjectInformation() {

            const latestReceipt =
                getLatestReceipt();


            $("portalProjectId")
                .textContent =
                projectId;


            $("infoProjectId")
                .textContent =
                projectId;


            $("portalProjectName")
                .textContent =
                latestReceipt?.projectName ||
                "—";


            $("portalClient")
                .textContent =
                latestReceipt?.clientName ||
                "—";


            $("portalLocation")
                .textContent =
                latestReceipt?.location ||
                "—";


            $("infoProjectName")
                .textContent =
                latestReceipt?.projectName ||
                "—";


            $("infoClient")
                .textContent =
                latestReceipt?.clientName ||
                "—";


            $("infoLocation")
                .textContent =
                latestReceipt?.location ||
                "—";


            loadProjectDates();

        }


        /* =====================================================
           PROJECT DATES
           ===================================================== */

        function loadProjectDates() {

            const allDates =
                readJSON(
                    PROJECT_DATES_KEY,
                    {}
                );


            const savedDates =
                allDates[projectId] ||
                {};


            $("infoStartDate")
                .value =
                savedDates.startDate ||
                "";


            $("infoCompletion")
                .value =
                savedDates.targetCompletionDate ||
                "";

        }


        function saveProjectDates() {

            const startDate =
                $("infoStartDate")
                    .value;


            const targetCompletionDate =
                $("infoCompletion")
                    .value;


            const allDates =
                readJSON(
                    PROJECT_DATES_KEY,
                    {}
                );


            allDates[projectId] = {

                startDate:
                    startDate,

                targetCompletionDate:
                    targetCompletionDate,

                updatedAt:
                    new Date().toISOString()

            };


            localStorage.setItem(
                PROJECT_DATES_KEY,
                JSON.stringify(
                    allDates
                )
            );


            alert(
                "Project dates saved successfully."
            );

        }


        $("saveProjectDates")
            .addEventListener(
                "click",
                saveProjectDates
            );


        /* =====================================================
           FINANCIAL DATA
           ===================================================== */

        function loadFinancials() {

            const allFinancials =
                readJSON(
                    FINANCIAL_KEY,
                    {}
                );


            const oldBudgets =
                readJSON(
                    BUDGET_KEY,
                    {}
                );


            const saved =
                allFinancials[projectId] ||
                {};


            return {

                estimatedBudget:
                    parseAmount(
                        saved.estimatedBudget ??
                        oldBudgets[projectId] ??
                        0
                    ),

                receiveBudget:
                    parseAmount(
                        saved.receiveBudget
                    ),

                downPayment:
                    parseAmount(
                        saved.downPayment
                    ),

                progressBilling:
                    parseAmount(
                        saved.progressBilling
                    ),

                finalPayment:
                    parseAmount(
                        saved.finalPayment
                    )

            };

        }


        function putFinancialInputs(
            financials
        ) {

            $("totalBudget")
                .value =
                financials.estimatedBudget ||
                "";


            $("receiveBudget")
                .value =
                financials.receiveBudget ||
                "";


            $("downPayment")
                .value =
                financials.downPayment ||
                "";


            $("progressBilling")
                .value =
                financials.progressBilling ||
                "";


            $("finalPayment")
                .value =
                financials.finalPayment ||
                "";

        }


        function saveFinancials(
            showMessage
        ) {

            const data = {

                estimatedBudget:
                    parseAmount(
                        $("totalBudget")
                            .value
                    ),

                receiveBudget:
                    parseAmount(
                        $("receiveBudget")
                            .value
                    ),

                downPayment:
                    parseAmount(
                        $("downPayment")
                            .value
                    ),

                progressBilling:
                    parseAmount(
                        $("progressBilling")
                            .value
                    ),

                finalPayment:
                    parseAmount(
                        $("finalPayment")
                            .value
                    ),

                updatedAt:
                    new Date().toISOString()

            };


            const allFinancials =
                readJSON(
                    FINANCIAL_KEY,
                    {}
                );


            allFinancials[projectId] =
                data;


            localStorage.setItem(
                FINANCIAL_KEY,
                JSON.stringify(
                    allFinancials
                )
            );


            /*
             * Keep the old budget storage
             * compatible with existing data.
             */

            const oldBudgets =
                readJSON(
                    BUDGET_KEY,
                    {}
                );


            oldBudgets[projectId] =
                data.estimatedBudget;


            localStorage.setItem(
                BUDGET_KEY,
                JSON.stringify(
                    oldBudgets
                )
            );


            updateFinancialSummary();


            if (
                showMessage
            ) {

                alert(
                    "Project financial information saved successfully."
                );

            }

        }


        /* =====================================================
           FINANCIAL SUMMARY
           ===================================================== */

        function updateFinancialSummary() {

            const financials =
                loadFinancials();


            const projectReceipts =
                getProjectReceipts();


            const receiptExpenses =
                projectReceipts.reduce(
                    function (
                        total,
                        receipt
                    ) {

                        return total +
                            parseAmount(
                                receipt.total
                            );

                    },
                    0
                );


            const additionalExpenses =
                getProjectAdditionalExpenses();


            const additionalExpenseTotal =
                additionalExpenses.reduce(
                    function (
                        total,
                        expense
                    ) {

                        return total +
                            parseAmount(
                                expense.amount
                            );

                    },
                    0
                );


            const totalExpenses =
                receiptExpenses +
                additionalExpenseTotal;


            /*
             * Receivables means the actual
             * amount received from the client.
             */

            const receivables =
                financials.downPayment +
                financials.progressBilling +
                financials.finalPayment;


            /*
             * Balance due can be negative
             * if payments exceed budget.
             */

            const balanceDue =
                financials.estimatedBudget -
                receivables;


            const receivablePercent =
                financials.estimatedBudget > 0
                    ? clampPercent(
                        (
                            receivables /
                            financials.estimatedBudget
                        ) * 100
                    )
                    : 0;


            const expensePercent =
                financials.estimatedBudget > 0
                    ? clampPercent(
                        (
                            totalExpenses /
                            financials.estimatedBudget
                        ) * 100
                    )
                    : 0;


            const receiveBudgetPercent =
                financials.receiveBudget > 0
                    ? clampPercent(
                        (
                            financials.downPayment /
                            financials.receiveBudget
                        ) * 100
                    )
                    : 0;


            $("projectBudget")
                .textContent =
                formatMoney(
                    financials.estimatedBudget
                );


            $("projectBilling")
                .textContent =
                formatMoney(
                    totalExpenses
                );


            $("projectReceivables")
                .textContent =
                formatMoney(
                    receivables
                );


            $("budgetDisplay")
                .textContent =
                formatMoney(
                    financials.estimatedBudget
                );


            $("receiveBudgetDisplay")
                .textContent =
                formatMoney(
                    financials.receiveBudget
                );


            $("receivablesDisplay")
                .textContent =
                formatMoney(
                    receivables
                );


            $("billingDisplay")
                .textContent =
                formatMoney(
                    totalExpenses
                );


            $("remainingBudget")
                .textContent =
                formatMoney(
                    balanceDue
                );


            $("remainingBudget")
                .style.color =
                balanceDue < 0
                    ? "#9b0000"
                    : "";


            $("receivableProgressText")
                .textContent =
                Math.round(
                    receivablePercent
                ) + "%";


            $("receivableProgressBar")
                .style.width =
                receivablePercent +
                "%";


            $("expenseBudgetProgressText")
                .textContent =
                Math.round(
                    expensePercent
                ) + "%";


            $("expenseBudgetProgressBar")
                .style.width =
                expensePercent +
                "%";


            if (
                financials.estimatedBudget === 0
            ) {

                $("completionResult")
                    .textContent =
                    "Enter an estimated budget to view financial progress.";

            }
            else if (
                balanceDue < 0
            ) {

                $("completionResult")
                    .textContent =
                    "Client receipts exceed the estimated budget by " +
                    formatMoney(
                        Math.abs(
                            balanceDue
                        )
                    ) +
                    ". Down payment target progress: " +
                    Math.round(
                        receiveBudgetPercent
                    ) +
                    "%.";

            }
            else {

                $("completionResult")
                    .textContent =
                    "Client financial completion is " +
                    Math.round(
                        receivablePercent
                    ) +
                    "%. " +
                    formatMoney(
                        balanceDue
                    ) +
                    " remains outstanding. Down payment target progress: " +
                    Math.round(
                        receiveBudgetPercent
                    ) +
                    "%.";

            }

        }


        [
            "totalBudget",
            "receiveBudget",
            "downPayment",
            "progressBilling",
            "finalPayment"
        ]
            .forEach(
                function (id) {


                    $(id)
                        .addEventListener(
                            "input",
                            updateFinancialSummary
                        );

                }
            );


        $("saveProjectBudget")
            .addEventListener(
                "click",
                function () {

                    saveFinancials(
                        true
                    );

                }
            );


        $("resetFinancials")
            .addEventListener(
                "click",
                function () {


                    putFinancialInputs({

                        estimatedBudget: 0,

                        receiveBudget: 0,

                        downPayment: 0,

                        progressBilling: 0,

                        finalPayment: 0

                    });


                    updateFinancialSummary();

                }
            );


        /* =====================================================
           ADDITIONAL PROJECT EXPENSES
           ===================================================== */

        function getProjectAdditionalExpenses() {

            const all =
                readJSON(
                    ADDITIONAL_EXPENSES_KEY,
                    {}
                );


            const list =
                Array.isArray(
                    all[projectId]
                )
                    ? all[projectId]
                    : [];


            return list;

        }


        function saveProjectAdditionalExpenses(
            list
        ) {

            const all =
                readJSON(
                    ADDITIONAL_EXPENSES_KEY,
                    {}
                );


            all[projectId] =
                list;


            localStorage.setItem(
                ADDITIONAL_EXPENSES_KEY,
                JSON.stringify(
                    all
                )
            );

        }


        function resetAdditionalExpenseForm() {

            const form =
                $("additionalExpenseForm");


            if (form) {

                form.hidden = true;

            }


            $("additionalExpenseName")
                .value = "";


            $("additionalExpenseDescription")
                .value = "";


            $("additionalExpenseAmount")
                .value = "";


            $("additionalExpenseDate")
                .value = "";


            $("saveAdditionalExpense")
                .dataset.editId = "";


            $("saveAdditionalExpense")
                .innerHTML =
                '<i class="fa-solid fa-check"></i> Add Record';

        }


        function openAdditionalExpenseForm(
            expense
        ) {

            const form =
                $("additionalExpenseForm");


            if (!form) {

                return;

            }


            form.hidden = false;


            $("additionalExpenseName")
                .value =
                expense?.name ||
                "";


            $("additionalExpenseDescription")
                .value =
                expense?.description ||
                "";


            $("additionalExpenseAmount")
                .value =
                expense
                    ? parseAmount(expense.amount)
                    : "";


            $("additionalExpenseDate")
                .value =
                expense?.date ||
                new Date()
                    .toISOString()
                    .slice(0, 10);


            $("saveAdditionalExpense")
                .dataset.editId =
                expense?.id ||
                "";


            $("saveAdditionalExpense")
                .innerHTML =
                expense
                    ? '<i class="fa-solid fa-check"></i> Update Record'
                    : '<i class="fa-solid fa-check"></i> Add Record';


            $("additionalExpenseName")
                .focus();

        }


        function renderAdditionalExpenses() {

            const list =
                getProjectAdditionalExpenses()
                    .slice()
                    .sort(
                        function (a, b) {

                            return String(
                                b.date ||
                                b.updatedAt ||
                                ""
                            ).localeCompare(
                                String(
                                    a.date ||
                                    a.updatedAt ||
                                    ""
                                )
                            );

                        }
                    );


            const body =
                $("additionalExpensesBody");


            const empty =
                $("noAdditionalExpenses");


            const table =
                $("additionalExpenseTableWrap");


            if (!body) {

                return;

            }


            body.innerHTML = "";


            const total =
                list.reduce(
                    function (
                        sum,
                        expense
                    ) {

                        return sum +
                            parseAmount(
                                expense.amount
                            );

                    },
                    0
                );


            $("additionalExpensesTotal")
                .textContent =
                formatMoney(
                    total
                );


            if (
                list.length === 0
            ) {

                empty.style.display =
                    "block";


                table.style.display =
                    "none";

            }
            else {

                empty.style.display =
                    "block";


                empty.style.display =
                    "none";


                table.style.display =
                    "block";

            }


            list.forEach(
                function (expense) {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>
                            ${escapeHTML(
                                expense.name ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                expense.description ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                expense.date ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${formatMoney(
                                expense.amount
                            )}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="additional-expense-action"
                                data-action="edit"
                                data-id="${escapeHTML(
                                    expense.id
                                )}"
                            >
                                EDIT
                            </button>

                            <button
                                type="button"
                                class="additional-expense-action"
                                data-action="delete"
                                data-id="${escapeHTML(
                                    expense.id
                                )}"
                            >
                                DELETE
                            </button>

                        </td>

                    `;


                    body.appendChild(
                        row
                    );

                }
            );


            updateFinancialSummary();

        }


        function saveAdditionalExpense() {

            const name =
                $("additionalExpenseName")
                    .value
                    .trim();


            const description =
                $("additionalExpenseDescription")
                    .value
                    .trim();


            const amount =
                parseAmount(
                    $("additionalExpenseAmount")
                        .value
                );


            const date =
                $("additionalExpenseDate")
                    .value;


            if (!name) {

                alert(
                    "Please enter the expense or item name."
                );


                $("additionalExpenseName")
                    .focus();


                return;

            }


            if (amount <= 0) {

                alert(
                    "Please enter an amount greater than zero."
                );


                $("additionalExpenseAmount")
                    .focus();


                return;

            }


            const list =
                getProjectAdditionalExpenses();


            const editId =
                $("saveAdditionalExpense")
                    .dataset
                    .editId;


            if (editId) {

                const index =
                    list.findIndex(
                        function (item) {

                            return String(
                                item.id
                            ) ===
                            String(
                                editId
                            );

                        }
                    );


                if (index !== -1) {

                    list[index] = {

                        ...list[index],

                        name:
                            name,

                        description:
                            description,

                        amount:
                            amount,

                        date:
                            date ||
                            new Date()
                                .toISOString()
                                .slice(0, 10),

                        updatedAt:
                            new Date()
                                .toISOString()

                    };

                }

            }
            else {

                list.push({

                    id:
                        "additional-" +
                        Date.now() +
                        "-" +
                        Math.random()
                            .toString(36)
                            .slice(2, 8),

                    projectId:
                        projectId,

                    name:
                        name,

                    description:
                        description,

                    amount:
                        amount,

                    date:
                        date ||
                        new Date()
                            .toISOString()
                            .slice(0, 10),

                    createdAt:
                        new Date()
                            .toISOString(),

                    updatedAt:
                        new Date()
                            .toISOString()

                });

            }


            saveProjectAdditionalExpenses(
                list
            );


            resetAdditionalExpenseForm();


            renderAdditionalExpenses();

        }


        $("addAdditionalExpense")
            .addEventListener(
                "click",
                function () {

                    openAdditionalExpenseForm();

                }
            );


        $("cancelAdditionalExpense")
            .addEventListener(
                "click",
                function () {

                    resetAdditionalExpenseForm();

                }
            );


        $("saveAdditionalExpense")
            .addEventListener(
                "click",
                saveAdditionalExpense
            );


        $("additionalExpensesBody")
            .addEventListener(
                "click",
                function (event) {

                    const button =
                        event.target.closest(
                            "[data-action]"
                        );


                    if (!button) {

                        return;

                    }


                    const id =
                        button.dataset.id;


                    const list =
                        getProjectAdditionalExpenses();


                    const expense =
                        list.find(
                            function (item) {

                                return String(
                                    item.id
                                ) ===
                                String(
                                    id
                                );

                            }
                        );


                    if (!expense) {

                        return;

                    }


                    if (
                        button.dataset.action ===
                        "edit"
                    ) {

                        openAdditionalExpenseForm(
                            expense
                        );


                        $("additionalExpenseForm")
                            .scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                            });


                        return;

                    }


                    if (
                        button.dataset.action ===
                        "delete"
                    ) {

                        if (
                            !confirm(
                                "Delete this additional project expense?"
                            )
                        ) {

                            return;

                        }


                        const updated =
                            list.filter(
                                function (item) {

                                    return String(
                                        item.id
                                    ) !==
                                    String(
                                        id
                                    );

                                }
                            );


                        saveProjectAdditionalExpenses(
                            updated
                        );


                        renderAdditionalExpenses();

                    }

                }
            );


        /* =====================================================
           EXPENSE RECORDS
           ===================================================== */

        function renderReceiptMaterials(receipt) {

            const items =
                Array.isArray(receipt.items)
                    ? receipt.items
                    : [];

            if (items.length === 0) {
                return `
                    <div class="receipt-materials-empty">
                        No materials recorded
                    </div>
                `;
            }

            return `
                <div class="receipt-materials">
                    <div class="receipt-materials-count">
                        ${items.length} item${items.length === 1 ? "" : "s"}
                    </div>

                    <div class="receipt-material-list">
                        ${items.map(function(item, index) {

                            const description =
                                item.description ||
                                item.name ||
                                "Unnamed item";

                            const qty =
                                Number(item.qty) || 0;

                            const price =
                                Number(item.price) || 0;

                            const amount =
                                Number(item.amount) ||
                                (qty * price);

                            return `
                                <div class="receipt-material-item">

                                    <div class="receipt-material-main">

                                        <span class="receipt-material-number">
                                            ${index + 1}
                                        </span>

                                        <div class="receipt-material-description">
                                            ${escapeHTML(
                                                description
                                            )}
                                        </div>

                                    </div>

                                    <div class="receipt-material-details">

                                        <span>
                                            ${escapeHTML(
                                                String(qty)
                                            )}
                                        </span>

                                        <span>×</span>

                                        <span>
                                            ${formatMoney(price)}
                                        </span>

                                        <strong>
                                            ${formatMoney(amount)}
                                        </strong>

                                    </div>

                                </div>
                            `;

                        }).join("")}
                    </div>

                </div>
            `;

        }


        function renderExpenses() {

            const list =
                getProjectReceipts()
                    .sort(
                        function (a,b) {

                            return new Date(
                                b.date ||
                                b.updatedAt ||
                                0
                            ) -
                            new Date(
                                a.date ||
                                a.updatedAt ||
                                0
                            );

                        }
                    );


            const body =
                $("portalReceiptsBody");


            body.innerHTML = "";


            $("receiptCount")
                .textContent =
                list.length;


            const empty =
                $("noProjectReceipts");


            const table =
                body.closest(
                    ".table-wrap"
                );


            if (
                list.length === 0
            ) {

                empty.style.display =
                    "block";


                if (table) {

                    table.style.display =
                        "none";

                }

            }
            else {

                empty.style.display =
                    "none";


                if (table) {

                    table.style.display =
                        "block";

                }

            }


            list.forEach(
                function (receipt) {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    const items =
                        Array.isArray(
                            receipt.items
                        )
                            ? receipt.items
                            : [];


                    const materialsHTML =
                        items.length > 0
                            ? `
                                <div class="receipt-materials-list">

                                    ${items.map(
                                        function (
                                            item,
                                            index
                                        ) {

                                            const description =
                                                String(
                                                    item.description ||
                                                    "Material / Item"
                                                ).trim();


                                            const qty =
                                                Number(
                                                    item.qty
                                                ) || 0;


                                            const price =
                                                parseAmount(
                                                    item.price
                                                );


                                            const amount =
                                                parseAmount(
                                                    item.amount ||
                                                    (
                                                        qty *
                                                        price
                                                    )
                                                );


                                            return `

                                                <div
                                                    class="receipt-material-item"
                                                >

                                                    <div
                                                        class="receipt-material-main"
                                                    >

                                                        <span
                                                            class="receipt-material-number"
                                                        >
                                                            ${index + 1}
                                                        </span>

                                                        <div
                                                            class="receipt-material-description"
                                                        >

                                                            <strong>
                                                                ${escapeHTML(
                                                                    description
                                                                )}
                                                            </strong>

                                                            <small>
                                                                ${escapeHTML(
                                                                    String(
                                                                        qty
                                                                    )
                                                                )}
                                                                ×
                                                                ${formatMoney(
                                                                    price
                                                                )}
                                                            </small>

                                                        </div>

                                                    </div>

                                                    <strong
                                                        class="receipt-material-amount"
                                                    >
                                                        ${formatMoney(
                                                            amount
                                                        )}
                                                    </strong>

                                                </div>

                                            `;

                                        }
                                    ).join("")}

                                </div>
                            `
                            : `
                                <span
                                    class="receipt-materials-empty"
                                >
                                    No materials recorded
                                </span>
                            `;


                    row.innerHTML = `

                        <td>
                            ${escapeHTML(
                                receipt.receiptNo ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                receipt.date ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                receipt.clientName ||
                                "—"
                            )}
                        </td>

                        <td class="receipt-project-cell">

                            <strong>
                                ${escapeHTML(
                                    receipt.projectName ||
                                    "—"
                                )}
                            </strong>

                            <div class="receipt-materials">

                                <div
                                    class="receipt-materials-heading"
                                >

                                    <span>
                                        Materials / Items
                                    </span>

                                    <strong>
                                        ${items.length}
                                    </strong>

                                </div>

                                ${materialsHTML}

                            </div>

                        </td>

                        <td>
                            ${formatMoney(
                                receipt.subtotal
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
                                class="table-action"
                                data-id="${escapeHTML(
                                    receipt.id
                                )}"
                            >
                                VIEW
                            </button>

                        </td>

                    `;


                    body.appendChild(
                        row
                    );

                }
            );


            updateFinancialSummary();

        }


        $("portalReceiptsBody")
            .addEventListener(
                "click",
                function (event) {


                    const button =
                        event.target.closest(
                            "[data-id]"
                        );


                    if (!button) {

                        return;

                    }


                    const receipt =
                        getProjectReceipts()
                            .find(
                                function (item) {

                                    return String(
                                        item.id
                                    ) ===
                                    String(
                                        button.dataset.id
                                    );

                                }
                            );


                    if (!receipt) {

                        return;

                    }


                    window.location.href =
                        "index.html?projectId=" +
                        encodeURIComponent(
                            projectId
                        ) +
                        "#receipt-" +
                        encodeURIComponent(
                            receipt.id
                        );

                }
            );


        /* =====================================================
           PROJECT FILE COUNT
           ===================================================== */

        function updateFileCount() {

            if (
                !window.indexedDB
            ) {

                return;

            }


            const request =
                indexedDB.open(
                    "ArchitecturalProjectDB",
                    1
                );


            request.onsuccess =
                function () {


                    const db =
                        request.result;


                    if (
                        !db.objectStoreNames
                            .contains(
                                "files"
                            )
                    ) {

                        return;

                    }


                    const transaction =
                        db.transaction(
                            "files",
                            "readonly"
                        );


                    const store =
                        transaction.objectStore(
                            "files"
                        );


                    const getAll =
                        store.getAll();


                    getAll.onsuccess =
                        function () {


                            const files =
                                (
                                    getAll.result ||
                                    []
                                )
                                .filter(
                                    function (file) {

                                        return String(
                                            file.projectId ||
                                            ""
                                        ) ===
                                        projectId;

                                    }
                                );


                            $("fileCount")
                                .textContent =
                                files.length +
                                (
                                    files.length === 1
                                        ? " project file"
                                        : " project files"
                                );

                        };

                };

        }


        /* =====================================================
           NAVIGATION
           ===================================================== */

        function goToReceipt() {

            window.location.href =
                "index.html?projectId=" +
                encodeURIComponent(
                    projectId
                );

        }


        function goToProjectFiles() {

            window.location.href =
                "project-files.html?projectId=" +
                encodeURIComponent(
                    projectId
                );

        }


        $("backReceipt")
            .addEventListener(
                "click",
                goToReceipt
            );


        $("projectFiles")
            .addEventListener(
                "click",
                goToProjectFiles
            );


        $("openFilesCard")
            .addEventListener(
                "click",
                goToProjectFiles
            );


        $("newReceiptCard")
            .addEventListener(
                "click",
                goToReceipt
            );


        $("viewReceiptsCard")
            .addEventListener(
                "click",
                function () {


                    $("expenseRecordsSection")
                        .scrollIntoView({
                            behavior: "smooth"
                        });

                }
            );


        $("printSummaryCard")
            .addEventListener(
                "click",
                function () {

                    window.print();

                }
            );


        $("backButton")
            .addEventListener(
                "click",
                function () {


                    if (
                        window.history.length > 1
                    ) {

                        window.history.back();

                    }
                    else {

                        goToReceipt();

                    }

                }
            );


        /* =====================================================
           INITIALIZATION
           ===================================================== */

        putFinancialInputs(
            loadFinancials()
        );


        loadProjectInformation();


        renderChecklist();


        renderAdditionalExpenses();


        renderExpenses();


        updateFileCount();


        updateFinancialSummary();

    }
);