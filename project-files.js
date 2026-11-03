/* =========================================================
   ARCHGEN
   PROJECT FILE LIBRARY
   ========================================================= */


/* =========================================================
   DATABASE SETTINGS
   ========================================================= */

const DB_NAME = "ArchitecturalProjectDB";
const STORE_NAME = "files";


/* =========================================================
   FILE TYPE SETTINGS
   ========================================================= */

const GENERAL_ACCEPT =
    ".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.ppt,.pptx,.rvt,.rfa,.skp,.dwg,.dxf";

const CAD_ACCEPT =
    ".dwg,.dxf";


const GENERAL_EXTENSIONS = new Set([
    "pdf",
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "doc",
    "docx",
    "ppt",
    "pptx",
    "rvt",
    "rfa",
    "skp",
    "dwg",
    "dxf"
]);


const CAD_EXTENSIONS = new Set([
    "dwg",
    "dxf"
]);


/* =========================================================
   CATEGORY LABELS
   ========================================================= */

const CATEGORY_LABELS = {

    "schematic-design":
        "Schematic Design",

    "perspective":
        "Perspective (Revit / SketchUp)",

    "schematic-floorplan":
        "Schematic Floorplan (AutoCAD / PDF)",

    "construction-drawings":
        "Construction Drawings",

    "cad-working-drawings":
        "CAD / Working Drawings",

    "approved-drawings":
        "Approved Drawings",

    "as-built-plan":
        "As-Built Plan",

    "site-title-tax":
        "Site Information - Title / Tax Declaration / Tax Receipt",

    "site-photo":
        "Site Information - Site Photo",

    "site-measurements":
        "Site Information - Site Measurements",

    "others":
        "Others"

};


/* =========================================================
   LEGACY CATEGORY SUPPORT
   ========================================================= */

const LEGACY_CATEGORIES = {

    "floor-plan":
        "schematic-floorplan",

    "sketch":
        "schematic-design",

    "rendered":
        "perspective",

    "presentation":
        "others",

    "document":
        "others"

};


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let database = null;

let allFiles = [];

let currentProjectId = "";

let currentFilter = "all";

let currentViewerIndex = -1;

let viewerObjectUrl = null;


/* =========================================================
   DOM REFERENCES
   ========================================================= */

let fileInput;
let fileGrid;
let emptyState;
let fileCount;

let projectIdInput;
let documentCategory;

let clearAll;
let addFilesButton;

let uploadNotice;
let uploadNoticeIcon;
let uploadNoticeTitle;
let uploadNoticeText;

let viewer;
let viewerClose;
let viewerCategory;
let viewerTitle;
let viewerInfo;
let viewerPrev;
let viewerNext;
let viewerDownload;
let viewerStage;


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeProjectFiles
);


async function initializeProjectFiles() {

    try {

        getDomReferences();

        bindEvents();

        loadProjectId();

        updateFileInputAccept();

        updateUploadNotice();

        await initializeDatabase();

        await loadFiles();

    } catch (error) {

        console.error(
            "Project File Library initialization failed:",
            error
        );

        showDatabaseError(error);
    }
}


/* =========================================================
   GET DOM REFERENCES
   ========================================================= */

function getDomReferences() {

    fileInput =
        document.getElementById(
            "fileInput"
        );

    fileGrid =
        document.getElementById(
            "fileGrid"
        );

    emptyState =
        document.getElementById(
            "emptyState"
        );

    fileCount =
        document.getElementById(
            "fileCount"
        );

    projectIdInput =
        document.getElementById(
            "projectId"
        );

    documentCategory =
        document.getElementById(
            "documentCategory"
        );

    clearAll =
        document.getElementById(
            "clearAll"
        );

    addFilesButton =
        document.getElementById(
            "addFilesButton"
        );

    uploadNotice =
        document.getElementById(
            "uploadNotice"
        );

    uploadNoticeIcon =
        document.getElementById(
            "uploadNoticeIcon"
        );

    uploadNoticeTitle =
        document.getElementById(
            "uploadNoticeTitle"
        );

    uploadNoticeText =
        document.getElementById(
            "uploadNoticeText"
        );

    viewer =
        document.getElementById(
            "viewer"
        );

    viewerClose =
        document.getElementById(
            "viewerClose"
        );

    viewerCategory =
        document.getElementById(
            "viewerCategory"
        );

    viewerTitle =
        document.getElementById(
            "viewerTitle"
        );

    viewerInfo =
        document.getElementById(
            "viewerInfo"
        );

    viewerPrev =
        document.getElementById(
            "viewerPrev"
        );

    viewerNext =
        document.getElementById(
            "viewerNext"
        );

    viewerDownload =
        document.getElementById(
            "viewerDownload"
        );

    viewerStage =
        document.getElementById(
            "viewerStage"
        );

}


/* =========================================================
   EVENTS
   ========================================================= */

function bindEvents() {

    if (fileInput) {

        fileInput.addEventListener(
            "change",
            handleFileSelection
        );

    }


    if (documentCategory) {

        documentCategory.addEventListener(
            "change",
            function () {

                updateFileInputAccept();

                updateUploadNotice();

                /*
                 * Prevent files selected under the previous
                 * category from accidentally being uploaded
                 * after changing category.
                 */

                if (fileInput) {
                    fileInput.value = "";
                }

            }
        );

    }


    if (projectIdInput) {

        projectIdInput.addEventListener(
            "change",
            handleProjectIdChange
        );

        projectIdInput.addEventListener(
            "blur",
            handleProjectIdChange
        );

    }


    if (clearAll) {

        clearAll.addEventListener(
            "click",
            clearCurrentProjectFiles
        );

    }


    if (viewerClose) {

        viewerClose.addEventListener(
            "click",
            closeViewer
        );

    }


    if (viewerPrev) {

        viewerPrev.addEventListener(
            "click",
            showPreviousFile
        );

    }


    if (viewerNext) {

        viewerNext.addEventListener(
            "click",
            showNextFile
        );

    }


    if (viewerDownload) {

        viewerDownload.addEventListener(
            "click",
            downloadCurrentViewerFile
        );

    }


    document
        .querySelectorAll(".filter")
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        document
                            .querySelectorAll(".filter")
                            .forEach(
                                function (item) {
                                    item.classList.remove(
                                        "active"
                                    );
                                }
                            );

                        button.classList.add(
                            "active"
                        );

                        currentFilter =
                            button.dataset.filter ||
                            "all";

                        renderFiles();

                    }
                );

            }
        );


    document.addEventListener(
        "keydown",
        function (event) {

            if (!viewer.classList.contains("show")) {
                return;
            }


            if (event.key === "Escape") {

                closeViewer();

            }


            if (event.key === "ArrowLeft") {

                showPreviousFile();

            }


            if (event.key === "ArrowRight") {

                showNextFile();

            }

        }
    );


    const backButton =
        document.getElementById(
            "backToProject"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            goToProjectPortal
        );

    }

}


/* =========================================================
   PROJECT ID
   ========================================================= */

function loadProjectId() {

    let projectId = "";

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );

        projectId =
            (
                params.get("projectId") ||
                ""
            ).trim();


        if (!projectId) {

            projectId =
                (
                    localStorage.getItem(
                        "architecturalProjectId"
                    ) ||
                    ""
                ).trim();

        }

    } catch (error) {

        console.warn(
            "Unable to read project ID:",
            error
        );

    }


    currentProjectId =
        projectId;


    if (projectIdInput) {

        projectIdInput.value =
            projectId;

    }

}


async function handleProjectIdChange() {

    const value =
        (
            projectIdInput.value ||
            ""
        ).trim();


    currentProjectId =
        value;


    try {

        localStorage.setItem(
            "architecturalProjectId",
            value
        );

    } catch (error) {

        console.warn(
            "Unable to save project ID:",
            error
        );

    }


    await loadFiles();

}


/* =========================================================
   DATABASE INITIALIZATION
   =========================================================

   IMPORTANT:
   We first open the existing database WITHOUT forcing
   a version number.

   This preserves an existing database regardless of whether
   another ARCHGEN page has already upgraded it.

   If the existing database is missing the "files" store,
   only then do we perform a small upgrade.

   Existing data is NOT deleted.
   ========================================================= */

async function initializeDatabase() {

    if (!window.indexedDB) {

        throw new Error(
            "IndexedDB is not supported by this browser."
        );

    }


    database =
        await openExistingDatabase();


    if (
        database.objectStoreNames.contains(
            STORE_NAME
        )
    ) {

        return database;

    }


    /*
     * The database exists but the files store does not.
     *
     * Upgrade only in this situation.
     */

    const currentVersion =
        database.version;


    database.close();

    database = null;


    database =
        await createMissingStore(
            currentVersion + 1
        );


    return database;

}


/* =========================================================
   OPEN EXISTING DATABASE
   ========================================================= */

function openExistingDatabase() {

    return new Promise(
        function (resolve, reject) {

            const request =
                indexedDB.open(
                    DB_NAME
                );


            request.onupgradeneeded =
                function (event) {

                    const db =
                        event.target.result;

                    /*
                     * New installation:
                     * create the files store.
                     */

                    if (
                        !db.objectStoreNames.contains(
                            STORE_NAME
                        )
                    ) {

                        createFilesStore(
                            event.target.transaction,
                            db
                        );

                    }

                };


            request.onsuccess =
                function (event) {

                    const db =
                        event.target.result;


                    db.onversionchange =
                        function () {

                            db.close();

                        };


                    resolve(db);

                };


            request.onerror =
                function () {

                    reject(
                        request.error ||
                        new Error(
                            "Unable to open ArchitecturalProjectDB."
                        )
                    );

                };


            request.onblocked =
                function () {

                    reject(
                        new Error(
                            "The project database is being used by another ARCHGEN page. Close other ARCHGEN tabs and try again."
                        )
                    );

                };

        }
    );

}


/* =========================================================
   CREATE MISSING STORE
   ========================================================= */

function createMissingStore(version) {

    return new Promise(
        function (resolve, reject) {

            const request =
                indexedDB.open(
                    DB_NAME,
                    version
                );


            request.onupgradeneeded =
                function (event) {

                    const db =
                        event.target.result;

                    const transaction =
                        event.target.transaction;


                    if (
                        !db.objectStoreNames.contains(
                            STORE_NAME
                        )
                    ) {

                        createFilesStore(
                            transaction,
                            db
                        );

                    }

                };


            request.onsuccess =
                function (event) {

                    const db =
                        event.target.result;


                    db.onversionchange =
                        function () {

                            db.close();

                        };


                    resolve(db);

                };


            request.onerror =
                function () {

                    reject(
                        request.error ||
                        new Error(
                            "Unable to repair the project file database."
                        )
                    );

                };


            request.onblocked =
                function () {

                    reject(
                        new Error(
                            "The project database is locked by another ARCHGEN tab."
                        )
                    );

                };

        }
    );

}


/* =========================================================
   CREATE FILES STORE
   ========================================================= */

function createFilesStore(
    transaction,
    db
) {

    if (
        db.objectStoreNames.contains(
            STORE_NAME
        )
    ) {

        return;

    }


    const store =
        db.createObjectStore(
            STORE_NAME,
            {
                keyPath: "id",
                autoIncrement: true
            }
        );


    store.createIndex(
        "projectId",
        "projectId",
        {
            unique: false
        }
    );


    store.createIndex(
        "category",
        "category",
        {
            unique: false
        }
    );

}


/* =========================================================
   DATABASE SAFETY CHECK
   ========================================================= */

function ensureDatabase() {

    if (!database) {

        throw new Error(
            "Project database is not initialized."
        );

    }


    if (
        !database.objectStoreNames.contains(
            STORE_NAME
        )
    ) {

        throw new Error(
            "The project file storage area is unavailable."
        );

    }


    return database;

}


/* =========================================================
   LOAD FILES
   ========================================================= */

async function loadFiles() {

    try {

        ensureDatabase();


        const records =
            await getAllRecords();


        allFiles =
            records
                .filter(
                    function (record) {

                        return sameProject(
                            record.projectId,
                            currentProjectId
                        );

                    }
                )
                .map(
                    normalizeRecord
                )
                .sort(
                    function (a, b) {

                        return (
                            getDateValue(b.date) -
                            getDateValue(a.date)
                        );

                    }
                );


        renderFiles();

        updateUploadNotice();


    } catch (error) {

        console.error(
            "Unable to load project files:",
            error
        );


        allFiles = [];


        fileGrid.innerHTML = "";


        fileCount.textContent =
            "0 files";


        emptyState.style.display =
            "block";


        emptyState.innerHTML = `

            <i class="fa-solid fa-database"></i>

            <h2>
                Project Files Could Not Be Loaded
            </h2>

            <p>
                The existing project database could not be opened.
                Your files have not been deleted.
                Refresh the page and try again.
            </p>

        `;


        setNotice(
            "DATABASE NOTICE",
            "The existing project database could not be opened. Your stored files were not deleted.",
            true
        );

    }

}


/* =========================================================
   GET ALL RECORDS
   ========================================================= */

function getAllRecords() {

    return new Promise(
        function (resolve, reject) {

            const db =
                ensureDatabase();


            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.getAll();


            request.onsuccess =
                function () {

                    resolve(
                        request.result || []
                    );

                };


            request.onerror =
                function () {

                    reject(
                        request.error ||
                        new Error(
                            "Unable to read project files."
                        )
                    );

                };

        }
    );

}


/* =========================================================
   NORMALIZE DATABASE RECORD
   ========================================================= */

function normalizeRecord(record) {

    const category =
        normalizeCategory(
            record.category
        );


    return {

        id:
            record.id,

        projectId:
            record.projectId || "",

        category:
            category,

        name:
            record.name ||
            record.fileName ||
            "Unnamed File",

        type:
            record.type ||
            record.fileType ||
            "",

        size:
            Number(
                record.size || 0
            ),

        date:
            record.date ||
            record.createdAt ||
            new Date().toISOString(),

        file:
            record.file ||
            record.blob ||
            null

    };

}


/* =========================================================
   CATEGORY NORMALIZATION
   ========================================================= */

function normalizeCategory(category) {

    const value =
        String(
            category || ""
        )
            .trim()
            .toLowerCase();


    if (
        LEGACY_CATEGORIES[value]
    ) {

        return LEGACY_CATEGORIES[value];

    }


    if (
        CATEGORY_LABELS[value]
    ) {

        return value;

    }


    return "others";

}


/* =========================================================
   RENDER FILES
   ========================================================= */

function renderFiles() {

    fileGrid.innerHTML = "";


    const visibleFiles =
        getVisibleFiles();


    fileCount.textContent =
        `${visibleFiles.length} ${
            visibleFiles.length === 1
                ? "file"
                : "files"
        }`;


    if (!visibleFiles.length) {

        emptyState.style.display =
            "block";

        emptyState.innerHTML = `

            <i class="fa-regular fa-folder-open"></i>

            <h2>
                No Project Files
            </h2>

            <p>
                Select a document category and click
                <strong>ADD FILES</strong>
                to upload project documents.
            </p>

        `;

        return;

    }


    emptyState.style.display =
        "none";


    visibleFiles.forEach(
        function (record) {

            fileGrid.appendChild(
                createFileCard(record)
            );

        }
    );

}


/* =========================================================
   GET VISIBLE FILES
   ========================================================= */

function getVisibleFiles() {

    if (
        currentFilter === "all"
    ) {

        return [
            ...allFiles
        ];

    }


    return allFiles.filter(
        function (record) {

            return (
                normalizeCategory(
                    record.category
                ) ===
                currentFilter
            );

        }
    );

}


/* =========================================================
   CREATE FILE CARD
   ========================================================= */

function createFileCard(record) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "file-card";


    const preview =
        document.createElement(
            "div"
        );


    preview.className =
        "preview";


    preview.title =
        "Click to view";


    preview.addEventListener(
        "click",
        function () {

            openViewer(
                record.id
            );

        }
    );


    const isImage =
        isImageFile(record);


    if (
        isImage &&
        record.file
    ) {

        try {

            const imageUrl =
                URL.createObjectURL(
                    record.file
                );


            const image =
                document.createElement(
                    "img"
                );


            image.src =
                imageUrl;


            image.alt =
                record.name;


            image.onload =
                function () {

                    URL.revokeObjectURL(
                        imageUrl
                    );

                };


            image.onerror =
                function () {

                    URL.revokeObjectURL(
                        imageUrl
                    );

                    preview.innerHTML = "";

                    preview.appendChild(
                        createFileTypeBadge(
                            getExtension(
                                record.name
                            )
                        )
                    );

                };


            preview.appendChild(
                image
            );

        } catch (error) {

            console.warn(
                "Unable to create image preview:",
                error
            );


            preview.appendChild(
                createFileTypeBadge(
                    getExtension(
                        record.name
                    )
                )
            );

        }

    } else {

        preview.appendChild(
            createFileTypeBadge(
                getExtension(
                    record.name
                )
            )
        );

    }


    const body =
        document.createElement(
            "div"
        );


    body.className =
        "file-card-body";


    const category =
        document.createElement(
            "div"
        );


    category.className =
        "file-category";


    category.textContent =
        CATEGORY_LABELS[
            normalizeCategory(
                record.category
            )
        ] ||
        "Others";


    const name =
        document.createElement(
            "h3"
        );


    name.className =
        "file-name";


    name.textContent =
        record.name;


    const meta =
        document.createElement(
            "div"
        );


    meta.className =
        "file-meta";


    meta.textContent =
        `${formatSize(record.size)} • ${formatDate(record.date)}`;


    const actions =
        document.createElement(
            "div"
        );


    actions.className =
        "card-actions";


    const viewButton =
        document.createElement(
            "button"
        );


    viewButton.type =
        "button";


    viewButton.textContent =
        "VIEW";


    viewButton.addEventListener(
        "click",
        function () {

            openViewer(
                record.id
            );

        }
    );


    const downloadButton =
        document.createElement(
            "button"
        );


    downloadButton.type =
        "button";


    downloadButton.textContent =
        "DOWNLOAD";


    downloadButton.addEventListener(
        "click",
        function () {

            downloadRecord(
                record
            );

        }
    );


    const deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.type =
        "button";


    deleteButton.textContent =
        "DELETE";


    deleteButton.addEventListener(
        "click",
        function () {

            deleteRecord(
                record.id
            );

        }
    );


    actions.appendChild(
        viewButton
    );


    actions.appendChild(
        downloadButton
    );


    actions.appendChild(
        deleteButton
    );


    body.appendChild(
        category
    );


    body.appendChild(
        name
    );


    body.appendChild(
        meta
    );


    body.appendChild(
        actions
    );


    card.appendChild(
        preview
    );


    card.appendChild(
        body
    );


    return card;

}


/* =========================================================
   FILE TYPE BADGE
   ========================================================= */

function createFileTypeBadge(
    extension
) {

    const badge =
        document.createElement(
            "div"
        );


    badge.className =
        "file-type";


    badge.textContent =
        extension
            ? extension.toUpperCase()
            : "FILE";


    return badge;

}


/* =========================================================
   IMAGE CHECK
   ========================================================= */

function isImageFile(record) {

    const type =
        String(
            record.type || ""
        ).toLowerCase();


    if (
        type.startsWith(
            "image/"
        )
    ) {

        return true;

    }


    return [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "gif"
    ].includes(
        getExtension(
            record.name
        )
    );

}


/* =========================================================
   PDF CHECK
   ========================================================= */

function isPdfFile(record) {

    const type =
        String(
            record.type || ""
        ).toLowerCase();


    return (
        type === "application/pdf" ||
        getExtension(record.name) === "pdf"
    );

}


/* =========================================================
   FILE EXTENSION
   ========================================================= */

function getExtension(name) {

    const value =
        String(
            name || ""
        );


    const parts =
        value.split(".");


    if (
        parts.length < 2
    ) {

        return "";

    }


    return parts
        .pop()
        .toLowerCase();

}


/* =========================================================
   UPDATE FILE INPUT
   ========================================================= */

function updateFileInputAccept() {

    if (!fileInput) {
        return;
    }


    if (
        documentCategory.value ===
        "cad-working-drawings"
    ) {

        fileInput.accept =
            CAD_ACCEPT;

    } else {

        fileInput.accept =
            GENERAL_ACCEPT;

    }

}


/* =========================================================
   UPLOAD NOTICE
   ========================================================= */

function updateUploadNotice() {

    if (
        documentCategory.value ===
        "cad-working-drawings"
    ) {

        setNotice(
            "CAD / WORKING DRAWINGS",
            "This category accepts CAD files only: DWG and DXF.",
            false
        );

    } else {

        setNotice(
            "PROJECT FILE UPLOAD",
            "PDF is accepted, along with supported images, documents, presentations, BIM files, and other project file formats.",
            false
        );

    }

}


/* =========================================================
   NOTICE DISPLAY
   ========================================================= */

function setNotice(
    title,
    message,
    isError
) {

    if (!uploadNotice) {
        return;
    }


    uploadNotice.classList.toggle(
        "error",
        Boolean(isError)
    );


    uploadNoticeTitle.textContent =
        title;


    uploadNoticeText.textContent =
        message;


    if (uploadNoticeIcon) {

        uploadNoticeIcon.className =
            isError
                ? "fa-solid fa-triangle-exclamation"
                : "fa-solid fa-circle-info";

    }

}


/* =========================================================
   FILE VALIDATION
   ========================================================= */

function isAllowedFile(file) {

    const extension =
        getExtension(
            file.name
        );


    if (
        documentCategory.value ===
        "cad-working-drawings"
    ) {

        return CAD_EXTENSIONS.has(
            extension
        );

    }


    return GENERAL_EXTENSIONS.has(
        extension
    );

}


/* =========================================================
   HANDLE FILE SELECTION
   ========================================================= */

async function handleFileSelection(event) {

    const selectedFiles =
        Array.from(
            event.target.files || []
        );


    if (!selectedFiles.length) {
        return;
    }


    if (
        !currentProjectId
    ) {

        alert(
            "Please enter a Project ID before uploading files."
        );


        fileInput.value =
            "";


        return;

    }


    const invalidFiles =
        selectedFiles.filter(
            function (file) {

                return !isAllowedFile(
                    file
                );

            }
        );


    if (
        invalidFiles.length
    ) {

        let message;


        if (
            documentCategory.value ===
            "cad-working-drawings"
        ) {

            message =
                "CAD / Working Drawings accepts CAD files only.\n\nAllowed: DWG and DXF.\n\nInvalid file(s):\n" +
                invalidFiles
                    .map(
                        function (file) {
                            return file.name;
                        }
                    )
                    .join("\n");

        } else {

            message =
                "One or more selected files are not supported.\n\nInvalid file(s):\n" +
                invalidFiles
                    .map(
                        function (file) {
                            return file.name;
                        }
                    )
                    .join("\n");

        }


        alert(
            message
        );


        fileInput.value =
            "";


        return;

    }


    try {

        await uploadFiles(
            selectedFiles
        );


        fileInput.value =
            "";


    } catch (error) {

        console.error(
            "File upload failed:",
            error
        );


        alert(
            "Unable to save the selected files. Please try again."
        );

    }

}


/* =========================================================
   UPLOAD FILES
   ========================================================= */

async function uploadFiles(
    selectedFiles
) {

    const db =
        ensureDatabase();


    const category =
        normalizeCategory(
            documentCategory.value
        );


    const transaction =
        db.transaction(
            STORE_NAME,
            "readwrite"
        );


    const store =
        transaction.objectStore(
            STORE_NAME
        );


    selectedFiles.forEach(
        function (file) {

            /*
             * Store a real Blob/File copy.
             * This makes the attachment persist after
             * the browser page is closed.
             */

            const blob =
                new Blob(
                    [file],
                    {
                        type:
                            file.type ||
                            "application/octet-stream"
                    }
                );


            store.add({

                projectId:
                    currentProjectId,

                category:
                    category,

                name:
                    file.name,

                type:
                    file.type ||
                    "application/octet-stream",

                size:
                    file.size,

                date:
                    new Date().toISOString(),

                file:
                    blob

            });

        }
    );


    await transactionComplete(
        transaction
    );


    await loadFiles();

}


/* =========================================================
   TRANSACTION COMPLETE
   ========================================================= */

function transactionComplete(
    transaction
) {

    return new Promise(
        function (resolve, reject) {

            transaction.oncomplete =
                function () {

                    resolve();

                };


            transaction.onerror =
                function () {

                    reject(
                        transaction.error ||
                        new Error(
                            "Database transaction failed."
                        )
                    );

                };


            transaction.onabort =
                function () {

                    reject(
                        transaction.error ||
                        new Error(
                            "Database transaction was aborted."
                        )
                    );

                };

        }
    );

}


/* =========================================================
   DOWNLOAD RECORD
   ========================================================= */

function downloadRecord(
    record
) {

    if (!record.file) {

        alert(
            "The stored file data is unavailable."
        );

        return;

    }


    const url =
        URL.createObjectURL(
            record.file
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        record.name ||
        "project-file";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    setTimeout(
        function () {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );

}


/* =========================================================
   DELETE RECORD
   ========================================================= */

async function deleteRecord(
    id
) {

    const record =
        allFiles.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!record) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${record.name}" from this project?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const db =
            ensureDatabase();


        const transaction =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );


        const store =
            transaction.objectStore(
                STORE_NAME
            );


        store.delete(
            id
        );


        await transactionComplete(
            transaction
        );


        await loadFiles();


    } catch (error) {

        console.error(
            "Unable to delete file:",
            error
        );


        alert(
            "Unable to delete the selected file."
        );

    }

}


/* =========================================================
   CLEAR CURRENT PROJECT
   ========================================================= */

async function clearCurrentProjectFiles() {

    if (
        !currentProjectId
    ) {

        alert(
            "Please enter a Project ID first."
        );

        return;

    }


    if (
        !allFiles.length
    ) {

        alert(
            "There are no files to clear for this project."
        );

        return;

    }


    const confirmed =
        confirm(
            `Delete ALL ${allFiles.length} file(s) from project "${currentProjectId}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const db =
            ensureDatabase();


        const transaction =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );


        const store =
            transaction.objectStore(
                STORE_NAME
            );


        allFiles.forEach(
            function (record) {

                store.delete(
                    record.id
                );

            }
        );


        await transactionComplete(
            transaction
        );


        await loadFiles();


    } catch (error) {

        console.error(
            "Unable to clear project files:",
            error
        );


        alert(
            "Unable to clear the project files."
        );

    }

}


/* =========================================================
   VIEWER
   ========================================================= */

function openViewer(
    id
) {

    const visibleFiles =
        getVisibleFiles();


    const index =
        visibleFiles.findIndex(
            function (record) {

                return record.id === id;

            }
        );


    if (
        index < 0
    ) {

        return;

    }


    currentViewerIndex =
        index;


    renderViewer();

}


function renderViewer() {

    const visibleFiles =
        getVisibleFiles();


    if (
        currentViewerIndex < 0 ||
        currentViewerIndex >= visibleFiles.length
    ) {

        return;

    }


    const record =
        visibleFiles[
            currentViewerIndex
        ];


    if (
        viewerObjectUrl
    ) {

        URL.revokeObjectURL(
            viewerObjectUrl
        );

        viewerObjectUrl =
            null;

    }


    viewerStage.innerHTML =
        "";


    viewerCategory.textContent =
        CATEGORY_LABELS[
            normalizeCategory(
                record.category
            )
        ] ||
        "Others";


    viewerTitle.textContent =
        record.name;


    viewerInfo.textContent =
        `${formatSize(record.size)} • ${formatDate(record.date)}`;


    viewerPrev.disabled =
        currentViewerIndex <= 0;


    viewerNext.disabled =
        currentViewerIndex >=
        visibleFiles.length - 1;


    if (!record.file) {

        showViewerMessage(
            "File data unavailable",
            "The stored attachment data could not be read."
        );

    } else if (
        isImageFile(record)
    ) {

        viewerObjectUrl =
            URL.createObjectURL(
                record.file
            );


        const image =
            document.createElement(
                "img"
            );


        image.src =
            viewerObjectUrl;


        image.alt =
            record.name;


        image.onload =
            function () {

                /*
                 * The CSS controls the viewer dimensions.
                 * No intrinsic width/height is assigned.
                 */

            };


        image.onerror =
            function () {

                showViewerMessage(
                    "Preview unavailable",
                    "This image could not be displayed."
                );

            };


        viewerStage.appendChild(
            image
        );

    } else if (
        isPdfFile(record)
    ) {

        viewerObjectUrl =
            URL.createObjectURL(
                record.file
            );


        const iframe =
            document.createElement(
                "iframe"
            );


        iframe.src =
            viewerObjectUrl;


        iframe.title =
            record.name;


        viewerStage.appendChild(
            iframe
        );

    } else {

        showViewerMessage(
            "Preview unavailable",
            "This file type cannot be previewed directly in the browser. Use DOWNLOAD to open the original file."
        );

    }


    viewer.classList.add(
        "show"
    );


    viewer.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


function showViewerMessage(
    title,
    message
) {

    const box =
        document.createElement(
            "div"
        );


    box.className =
        "viewer-message";


    box.innerHTML = `

        <i class="fa-solid fa-file"></i>

        <h3></h3>

        <p></p>

    `;


    box.querySelector(
        "h3"
    ).textContent =
        title;


    box.querySelector(
        "p"
    ).textContent =
        message;


    viewerStage.appendChild(
        box
    );

}


/* =========================================================
   PREVIOUS / NEXT
   ========================================================= */

function showPreviousFile() {

    if (
        currentViewerIndex <= 0
    ) {

        return;

    }


    currentViewerIndex--;

    renderViewer();

}


function showNextFile() {

    const visibleFiles =
        getVisibleFiles();


    if (
        currentViewerIndex >=
        visibleFiles.length - 1
    ) {

        return;

    }


    currentViewerIndex++;

    renderViewer();

}


/* =========================================================
   VIEWER DOWNLOAD
   ========================================================= */

function downloadCurrentViewerFile() {

    const visibleFiles =
        getVisibleFiles();


    if (
        currentViewerIndex < 0 ||
        currentViewerIndex >= visibleFiles.length
    ) {

        return;

    }


    downloadRecord(
        visibleFiles[
            currentViewerIndex
        ]
    );

}


/* =========================================================
   CLOSE VIEWER
   ========================================================= */

function closeViewer() {

    if (
        viewerObjectUrl
    ) {

        URL.revokeObjectURL(
            viewerObjectUrl
        );

        viewerObjectUrl =
            null;

    }


    viewerStage.innerHTML =
        "";


    viewer.classList.remove(
        "show"
    );


    viewer.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   FORMAT FILE SIZE
   ========================================================= */

function formatSize(
    bytes
) {

    const value =
        Number(bytes);


    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {

        return "0 KB";

    }


    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.min(
            Math.floor(
                Math.log(value) /
                Math.log(1024)
            ),
            units.length - 1
        );


    const size =
        value /
        Math.pow(
            1024,
            index
        );


    return `${size.toFixed(
        index === 0 ? 0 : 1
    )} ${units[index]}`;

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(
    value
) {

    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unknown date";

    }


    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


/* =========================================================
   DATE VALUE
   ========================================================= */

function getDateValue(
    value
) {

    const date =
        new Date(
            value
        );


    const timestamp =
        date.getTime();


    return Number.isNaN(
        timestamp
    )
        ? 0
        : timestamp;

}


/* =========================================================
   PROJECT COMPARISON
   ========================================================= */

function sameProject(
    first,
    second
) {

    return (
        String(
            first || ""
        )
            .trim()
            .toLowerCase()
        ===
        String(
            second || ""
        )
            .trim()
            .toLowerCase()
    );

}


/* =========================================================
   DATABASE ERROR
   ========================================================= */

function showDatabaseError(
    error
) {

    console.error(
        "DATABASE ERROR:",
        error
    );


    if (fileGrid) {

        fileGrid.innerHTML =
            "";

    }


    if (emptyState) {

        emptyState.style.display =
            "block";


        emptyState.innerHTML = `

            <i class="fa-solid fa-triangle-exclamation"></i>

            <h2>
                Project File Library Unavailable
            </h2>

            <p>
                The browser could not open the ARCHGEN project
                file database. Existing project files were not
                intentionally deleted. Close duplicate ARCHGEN
                tabs and refresh this page.
            </p>

        `;

    }


    if (fileCount) {

        fileCount.textContent =
            "Database unavailable";

    }


    if (uploadNotice) {

        setNotice(
            "DATABASE NOTICE",
            "The project file database could not be opened. Existing stored files were not deleted.",
            true
        );

    }

}


/* =========================================================
   GO TO PROJECT PORTAL
   ========================================================= */

function goToProjectPortal() {

    const projectId =
        (
            projectIdInput.value ||
            currentProjectId ||
            ""
        ).trim();


    try {

        localStorage.setItem(
            "architecturalProjectId",
            projectId
        );

    } catch (error) {

        console.warn(
            "Unable to save project ID:",
            error
        );

    }


    if (projectId) {

        window.location.href =
            `project-portal.html?projectId=${encodeURIComponent(
                projectId
            )}`;

    } else {

        window.location.href =
            "project-portal.html";

    }

}