// =========================================

// Plant Care Tracker

// =========================================

// =========================================

// Plant Type Information

// =========================================

const plantTypes = {

    pothos: {

        difficulty: "Easy",

        wateringInterval: 7,

        light: "Bright indirect"

    },

    monstera: {

        difficulty: "Medium",

        wateringInterval: 7,

        light: "Bright indirect"

    },

    "snake-plant": {

        difficulty: "Easy",

        wateringInterval: 14,

        light: "Low to bright"

    },

    "peace-lily": {

        difficulty: "Medium",

        wateringInterval: 5,

        light: "Indirect"

    },

    "spider-plant": {

        difficulty: "Easy",

        wateringInterval: 7,

        light: "Bright indirect"

    },

    calathea: {

        difficulty: "Hard",

        wateringInterval: 4,

        light: "Indirect"

    },

    orchid: {

        difficulty: "Hard",

        wateringInterval: 7,

        light: "Bright indirect"

    }

};

// =========================================

// Application State

// =========================================

let plants = [];

let currentFilter = "all";

let searchTerm = "";

let currentSort = "default";

let editingPlantId = null;

let viewingPlantId = null;

// =========================================

// Start Application

// =========================================


function initializeGreeting() {
    const greetingElement = document.getElementById("greetingText");

    if (!greetingElement) {
        return;
    }

    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        greetingElement.textContent = "Good morning";
    } else if (hour >= 12 && hour < 17) {
        greetingElement.textContent = "Good afternoon";
    } else {
        greetingElement.textContent = "Good evening";
    }
}


document.addEventListener("DOMContentLoaded", () => {

    loadPlants();
    initializeTheme();
    initializeGreeting();
    initializeModal();
    initializePlantForm();
    loadCustomPlantTypes();
    initializeCustomPlantTypes();
    initializePlantTypePreview();
    initializeFilters();
    initializeSearch();
    initializeSorting();
    initializeNavigation();
    renderPlants();

});


// =========================================

// Local Storage

// =========================================

function loadPlants() {

    const savedPlants =

        localStorage.getItem("plantCarePlants");

    if (savedPlants) {

        try {

            plants = JSON.parse(savedPlants);

        } catch (error) {

            console.error(

                "Could not load saved plants:",

                error

            );

            plants = [];

        }

    } else {

        plants = [];

    }

}

function savePlants() {

    localStorage.setItem(

        "plantCarePlants",

        JSON.stringify(plants)

    );

}

// =========================================

// Date Helpers

// =========================================

function getTodayString() {

    const today = new Date();

    const year = today.getFullYear();

    const month =

        String(today.getMonth() + 1).padStart(2, "0");

    const day =

        String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}

function formatDate(dateString) {

    if (!dateString) {

        return "Unknown";

    }

    const [year, month, day] =

        dateString.split("-");

    const date = new Date(

        Number(year),

        Number(month) - 1,

        Number(day)

    );

    return date.toLocaleDateString(

        "en-US",

        {

            month: "short",

            day: "numeric",

            year: "numeric"

        }

    );

}

function calculateDaysSince(dateString) {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const [year, month, day] =

        dateString.split("-");

    const pastDate = new Date(

        Number(year),

        Number(month) - 1,

        Number(day)

    );

    pastDate.setHours(0, 0, 0, 0);

    const difference =

        today.getTime() - pastDate.getTime();

    return Math.floor(

        difference / (1000 * 60 * 60 * 24)

    );

}

// =========================================

// Plant Status

// =========================================

function getPlantStatus(plant) {

    const daysSince =

        calculateDaysSince(plant.lastWatered);

    const interval =

        Number(plant.wateringInterval);

    if (daysSince > interval) {

        return "overdue";

    }

    if (daysSince >= interval - 1) {

        return "due";

    }

    return "healthy";

}

function getStatusInfo(status) {

    const statusInfo = {

        overdue: {

            label: "Overdue",

            icon: "🔴"

        },

        due: {

            label: "Due Soon",

            icon: "🟡"

        },

        healthy: {

            label: "Healthy",

            icon: "🟢"

        }

    };

    return statusInfo[status];

}

function formatStatus(status) {

    const statusLabels = {

        overdue: "Overdue",

        due: "Due Soon",

        healthy: "Healthy"

    };

    return statusLabels[status] || "Unknown";

}

// =========================================

// Render Plants

// =========================================

function renderPlants() {

    const plantGrid =

        document.getElementById("plantGrid");

    let filteredPlants =

        plants.filter((plant) => {

            const status =

                getPlantStatus(plant);

            const matchesFilter =

                currentFilter === "all" ||

                status === currentFilter;

            const search =

                searchTerm.toLowerCase();

            const matchesSearch =

                plant.name

                    .toLowerCase()

                    .includes(search) ||

                plant.type

                    .toLowerCase()

                    .includes(search) ||

                (plant.location || "")

                    .toLowerCase()

                    .includes(search);

            return matchesFilter && matchesSearch;

        });

    // Sort:

    // Overdue → Due Soon → Healthy

    const statusOrder = {

        overdue: 1,

        due: 2,

        healthy: 3

    };

    filteredPlants.sort((a, b) => {

        return (

            statusOrder[getPlantStatus(a)] -

            statusOrder[getPlantStatus(b)]

        );

    });

    // Apply user-selected sorting

        if (currentSort === "name-asc") {

            filteredPlants.sort((a, b) =>
                a.name.localeCompare(b.name)
            );

        }

        else if (currentSort === "name-desc") {

            filteredPlants.sort((a, b) =>
                b.name.localeCompare(a.name)
            );

        }

        else if (currentSort === "next-watering") {

            filteredPlants.sort((a, b) => {

                const dateA =
                    new Date(
                        calculateNextWateringDate(a)
                    );

                const dateB =
                    new Date(
                        calculateNextWateringDate(b)
                    );

                return dateA - dateB;
            });

        }

        else if (currentSort === "difficulty") {

            const difficultyOrder = {
                Easy: 1,
                Medium: 2,
                Hard: 3
            };

            filteredPlants.sort((a, b) => {

                return (
                    difficultyOrder[a.difficulty] -
                    difficultyOrder[b.difficulty]
                );

            });
        }

    if (filteredPlants.length === 0) {

        renderEmptyState(plantGrid);

    } else {

        plantGrid.innerHTML =

            filteredPlants

                .map(createPlantCard)

                .join("");

    }

    updateSummary();

}

// =========================================

// Plant Card

// =========================================

function createPlantCard(plant) {

    const status =

        getPlantStatus(plant);

    const statusInfo =

        getStatusInfo(status);

    const daysSince =

        calculateDaysSince(plant.lastWatered);

    const nextWatering =

        calculateNextWateringDate(plant);

    const location =

        plant.location

            ? `📍 ${escapeHtml(plant.location)}`

            : "📍 Location not specified";

    return `

        <article class="plant-card">

            <div class="plant-card-top">

                <div class="plant-avatar">

                    ${

                        plant.image

                            ? `

                                <img

                                    src="${plant.image}"

                                    alt="${escapeHtml(plant.name)}"

                                >

                            `

                            : "🌿"

                    }

                </div>

                <span class="status-badge ${status}">

                    ${statusInfo.icon}

                    ${statusInfo.label}

                </span>

            </div>

            <div class="plant-card-content">

                <h3>

                    ${escapeHtml(plant.name)}

                </h3>

                <p class="plant-type">

                    ${formatPlantType(plant.type)}

                </p>

                <p class="plant-location">

                    ${location}

                </p>

                <div class="plant-info">

                    <div>

                        <span>Difficulty</span>

                        <strong>

                            ${escapeHtml(plant.difficulty)}

                        </strong>

                    </div>

                    <div>

                        <span>Water every</span>

                        <strong>

                            ${plant.wateringInterval} days

                        </strong>

                    </div>

                </div>

                <div class="watering-info">

                    <div>

                        <span>Last watered</span>

                        <strong>

                            ${formatDate(plant.lastWatered)}

                        </strong>

                    </div>

                    <div>

                        <span>Next watering</span>

                        <strong>

                            ${formatDate(nextWatering)}

                        </strong>

                    </div>

                </div>

            </div>

            <div class="plant-card-actions">

                <div class="plant-actions">

                    <button

                        class="details-button"

                        onclick="viewPlantDetails('${plant.id}')"

                    >

                        👁️ Details

                    </button>

                    <button

                        class="edit-button"

                        onclick="editPlant('${plant.id}')"

                    >

                        ✏️ Edit

                    </button>

                    <button

                        class="delete-button"

                        onclick="deletePlant('${plant.id}')"

                    >

                        🗑️ Delete

                    </button>

                </div>

                <button

                    class="water-button ${plant.lastWatered === getTodayString() ? "watered-today" : ""}"

                    onclick="waterPlant('${plant.id}')"

                    ${plant.lastWatered === getTodayString() ? "disabled" : ""}

                >

                    ${

                        plant.lastWatered === getTodayString()

                            ? "✓ Already watered today"

                            : "💧 Mark as Watered"

                    }

                </button>

            </div>

        </article>

    `;

}

// =========================================

// Empty State

// =========================================

function renderEmptyState(plantGrid) {

    if (plants.length === 0) {

        plantGrid.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">

                    🌱

                </div>

                <h3>

                    Your plant shelf is empty

                </h3>

                <p>

                    Add your first plant and start

                    tracking its care.

                </p>

                <button

                    class="primary-button"

                    id="emptyAddPlantButton"

                >

                    + Add Plant

                </button>

            </div>

        `;

        const button =

            document.getElementById(

                "emptyAddPlantButton"

            );

        button.addEventListener(

            "click",

            openPlantModal

        );

    } else {

        plantGrid.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">

                    🔍

                </div>

                <h3>

                    No plants found

                </h3>

                <p>

                    Try changing your filter

                    or search term.

                </p>

            </div>

        `;

    }

}

// =========================================

// Summary

// =========================================

function updateSummary() {

    const total =

        plants.length;

    const overdue =

        plants.filter(

            plant => getPlantStatus(plant) === "overdue"

        ).length;

    const due =

        plants.filter(

            plant => getPlantStatus(plant) === "due"

        ).length;

    const healthy =

        plants.filter(

            plant => getPlantStatus(plant) === "healthy"

        ).length;

    document.getElementById(

        "totalPlants"

    ).textContent = total;

    document.getElementById(

        "overduePlants"

    ).textContent = overdue;

    document.getElementById(

        "dueSoonPlants"

    ).textContent = due;

    document.getElementById(

        "healthyPlants"

    ).textContent = healthy;

    const countText =

        document.getElementById(

            "plantCountText"

        );

    if (total === 0) {

        countText.textContent =

            "No plants added yet";

    } else if (total === 1) {

        countText.textContent =

            "1 plant in your collection";

    } else {

        countText.textContent =

            `${total} plants in your collection`;

    }

}

// =========================================

// Calculate Next Watering

// =========================================

function calculateNextWateringDate(plant) {

    const [year, month, day] =

        plant.lastWatered.split("-");

    const nextDate = new Date(

        Number(year),

        Number(month) - 1,

        Number(day)

    );

    nextDate.setDate(

        nextDate.getDate() +

        Number(plant.wateringInterval)

    );

    const nextYear =

        nextDate.getFullYear();

    const nextMonth =

        String(nextDate.getMonth() + 1)

            .padStart(2, "0");

    const nextDay =

        String(nextDate.getDate())

            .padStart(2, "0");

    return `${nextYear}-${nextMonth}-${nextDay}`;

}

// =========================================

// Add Plant Form

// =========================================

function initializePlantForm() {

    const form =

        document.getElementById("plantForm");

    const lastWateredInput =

        document.getElementById("lastWatered");

    const imageInput =

        document.getElementById("plantImage");

    lastWateredInput.value =

        getTodayString();

    lastWateredInput.max =

        getTodayString();

    form.addEventListener(

        "submit",

        handlePlantSubmit

    );

    if (imageInput) {

        imageInput.addEventListener(

            "change",

            async () => {

                const file =

                    imageInput.files[0];

                if (!file) {

                    return;

                }

                try {

                    const imageData =

                        await readPlantImage(file);

                    const preview =

                        document.getElementById(

                            "plantImagePreview"

                        );

                    if (preview) {

                        preview.innerHTML = `

                            <img

                                src="${imageData}"

                                alt="Plant preview"

                            >

                        `;

                    }

                } catch (error) {

                    console.error(

                        "Could not load plant image:",

                        error

                    );

                    showToast(

                        "Unable to load the plant image.",

                        "⚠️"

                    );

                }

            }

        );

    }

}


function initializeCustomPlantTypes() {
    const plantTypeSelect =
        document.getElementById("plantType");

    if (!plantTypeSelect) {
        return;
    }

    plantTypeSelect.addEventListener("change", () => {
        if (plantTypeSelect.value !== "__add_custom__") {
            return;
        }

        const customTypeName = prompt(
            "Enter the name of your new plant type:"
        );

        if (!customTypeName || !customTypeName.trim()) {
            plantTypeSelect.value = "";
            return;
        }

        const typeName = customTypeName.trim();

        const typeValue = typeName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        if (!typeValue) {
            alert("Please enter a valid plant type name.");
            plantTypeSelect.value = "";
            return;
        }

        const existingOption = Array.from(
            plantTypeSelect.options
        ).find(
            option =>
                option.value !== "__add_custom__" &&
                (
                    option.value === typeValue ||
                    option.textContent.trim().toLowerCase() ===
                        typeName.toLowerCase()
                )
        );

        if (existingOption) {
            alert("This plant type already exists.");
            plantTypeSelect.value = existingOption.value;
            return;
        }

        
        const newOption = document.createElement("option");

        newOption.value = typeValue;
        newOption.textContent = typeName;

        plantTypeSelect.add(
            newOption,
            plantTypeSelect.options[
                plantTypeSelect.options.length - 1
            ]
        );

        const savedTypes = JSON.parse(
            localStorage.getItem("plantCareCustomTypes") || "[]"
        );

        savedTypes.push({
            value: typeValue,
            name: typeName
        });

        localStorage.setItem(
            "plantCareCustomTypes",
            JSON.stringify(savedTypes)
        );

        plantTypeSelect.value = typeValue;
        plantTypeSelect.dispatchEvent(new Event("change"));

    });

    const manageButton = document.getElementById(
    "managePlantTypesBtn"
    );

    if (manageButton) {
        manageButton.addEventListener("click", manageCustomPlantTypes);
    }
}


function loadCustomPlantTypes() {
    const plantTypeSelect = document.getElementById("plantType");

    if (!plantTypeSelect) {
        return;
    }

    const savedTypes = JSON.parse(
        localStorage.getItem("plantCareCustomTypes") || "[]"
    );

    savedTypes.forEach(customType => {
        const alreadyExists = Array.from(
            plantTypeSelect.options
        ).some(option => option.value === customType.value);

        if (alreadyExists) {
            return;
        }

        const newOption = document.createElement("option");

        newOption.value = customType.value;
        newOption.textContent = customType.name;

        plantTypeSelect.add(
            newOption,
            plantTypeSelect.options[
                plantTypeSelect.options.length - 1
            ]
        );
    });
}


function manageCustomPlantTypes() {
    const savedTypes = JSON.parse(
        localStorage.getItem("plantCareCustomTypes") || "[]"
    );

    if (savedTypes.length === 0) {
        showToast("There are no custom plant types to manage.", "ℹ️");
        return;
    }

    const choices = savedTypes
        .map((type, index) => `${index + 1}. ${type.name}`)
        .join("\n");

    const selection = prompt(
        `Manage Custom Plant Types:\n\n${choices}\n\nEnter the number of the type to manage, or Cancel to exit:`
    );

    if (selection === null) {
        return;
    }

    const index = Number(selection) - 1;

    if (
        !Number.isInteger(Number(selection)) ||
        index < 0 ||
        index >= savedTypes.length
    ) {
        alert("Please enter a valid number from the list.");
        return;
    }

    const selectedType = savedTypes[index];

    const action = prompt(
        `Selected: ${selectedType.name}\n\nType R to rename or D to delete:`
    );

    if (action === null) {
        return;
    }

    if (action.trim().toLowerCase() === "r") {
        const newName = prompt(
            "Enter the corrected plant type name:",
            selectedType.name
        );

        if (!newName || !newName.trim()) {
            return;
        }

        const trimmedName = newName.trim();
        const newValue = trimmedName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        if (!newValue) {
            alert("Please enter a valid plant type name.");
            return;
        }

        const duplicate = savedTypes.some(
            (type, i) =>
                i !== index &&
                (
                    type.value === newValue ||
                    type.name.toLowerCase() === trimmedName.toLowerCase()
                )
        );

        if (duplicate) {
            alert("A custom plant type with that name already exists.");
            return;
        }

        const oldValue = selectedType.value;
        selectedType.name = trimmedName;
        selectedType.value = newValue;

        localStorage.setItem(
            "plantCareCustomTypes",
            JSON.stringify(savedTypes)
        );

        plants.forEach(plant => {
            if (plant.type === oldValue) {
                plant.type = newValue;
            }
        });

        savePlants();

        const select = document.getElementById("plantType");
        const option = Array.from(select.options).find(
            item => item.value === oldValue
        );

        if (option) {
            option.value = newValue;
            option.textContent = trimmedName;
        }

        renderPlants();
        showToast(`Plant type renamed to ${trimmedName}.`, "✓");
        return;
    }

    if (action.trim().toLowerCase() === "d") {
        const confirmed = confirm(
            `Delete "${selectedType.name}" from the plant type list?\n\nExisting plants using this type will be kept, but their type will no longer be available in the dropdown.`
        );

        if (!confirmed) {
            return;
        }

        savedTypes.splice(index, 1);

        localStorage.setItem(
            "plantCareCustomTypes",
            JSON.stringify(savedTypes)
        );

        const select = document.getElementById("plantType");
        const option = Array.from(select.options).find(
            item => item.value === selectedType.value
        );

        if (option) {
            option.remove();
        }

        showToast(`Plant type "${selectedType.name}" deleted.`, "✓");
        return;
    }

    alert("Invalid choice. Enter R to rename or D to delete.");
}


async function handlePlantSubmit(event) {

    event.preventDefault();

    const name =

        document

            .getElementById("plantName")

            .value

            .trim();

    const type =

        document

            .getElementById("plantType")

            .value;

    const lastWatered =

        document

            .getElementById("lastWatered")

            .value;

    const wateringInterval =

        Number(

            document

                .getElementById("wateringInterval")

                .value

        );

    const location =

        document

            .getElementById("plantLocation")

            .value

            .trim();

    const notes =

        document

            .getElementById("plantNotes")

            .value

            .trim();

    const imageInput =

        document.getElementById("plantImage");

    const imageFile =

        imageInput

            ? imageInput.files[0]

            : null;

    let imageData = "";

    if (imageFile) {

        try {

            imageData =

                await readPlantImage(imageFile);

        } catch (error) {

            console.error(

                "Could not process plant image:",

                error

            );

            showToast(

                "Unable to load the plant image.",

                "⚠️"

            );

            return;

        }

    }

    // =========================

    // Validation

    // =========================

    if (!name) {

        showToast(

            "Please enter a plant name.",

            "⚠️"

        );

        return;

    }

    if (!type) {

        showToast(

            "Please select a plant type.",

            "⚠️"

        );

        return;

    }

    if (!lastWatered) {

        showToast(

            "Please select the last watered date.",

            "⚠️"

        );

        return;

    }

    if (lastWatered > getTodayString()) {

        showToast(

            "Last watered date cannot be in the future.",

            "⚠️"

        );

        return;

    }

    if (

        !wateringInterval ||

        wateringInterval < 1

    ) {

        showToast(

            "Watering interval must be at least 1 day.",

            "⚠️"

        );

        return;

    }

    const plantInfo = plantTypes[type] || {
        difficulty: "Medium",
        light: "Bright indirect"
    };


    // =========================================

    // Create or Update Plant

    // =========================================

    if (editingPlantId) {

        const plant =

            plants.find(

                item => item.id === editingPlantId

            );

        if (!plant) {

             return;

        }

        plant.name = name;

        plant.type = type;

        plant.lastWatered = lastWatered;

        plant.wateringInterval =

            wateringInterval;

        plant.difficulty =

            plantInfo.difficulty;

        plant.light =

            plantInfo.light;

        plant.location = location;

        plant.notes = notes;

        // Only replace the image when a new

        // image was selected.

        if (imageData) {

            plant.image = imageData;

        }

        // Make sure watering history exists.

        if (!plant.wateringHistory) {

            plant.wateringHistory = [];

        }

        // Add the date if the user changed

        // the last-watered date.

        if (

                !plant.wateringHistory.includes(

                lastWatered

            )

        ) {

            plant.wateringHistory.push(

                lastWatered

            );

        }

        showToast(

            `${name} was updated successfully!`,

            "✓"

        );

    } else {

        const newPlant = {

            id: Date.now().toString(),

            name: name,

            type: type,

            lastWatered: lastWatered,

            wateringInterval:

                wateringInterval,

                difficulty:

                    plantInfo.difficulty,

                light:

                    plantInfo.light,

                location:

                    location,

                notes:

                    notes,

                image:

                    imageData,

                wateringHistory: [

                    lastWatered

                ]

            };

            plants.push(newPlant);

            showToast(

                `${name} was added successfully!`,

                "🌱"

            );

        }

        savePlants();

        renderPlants();

        closePlantModal();

        resetPlantForm();

}

// =========================================

// Water Plant

// =========================================

function waterPlant(plantId) {

    const plant =

        plants.find(

            item => item.id === plantId

        );

    if (!plant) {

        return;

    }

    const today =

        getTodayString();

    // Already watered today

    if (plant.lastWatered === today) {

        showToast(

            "Already watered today ✓",

            "✓"

        );

        return;

    }

    // Update last watered date

    plant.lastWatered =

        today;

    // Create watering history if necessary

    if (!plant.wateringHistory) {

        plant.wateringHistory = [];

    }

    plant.wateringHistory.push(

        today

    );

    savePlants();

    renderPlants();

    showToast(

        `${plant.name} was watered!`,

        "💧"

    );

}

// =========================================

// Modal

// =========================================

function initializeModal() {

    const modal =

        document.getElementById("plantModal");

    const openButton =

        document.getElementById("addPlantButton");

    const closeButton =

        document.getElementById("closeModal");

    const cancelButton =

        document.getElementById("cancelModal");

    openButton.addEventListener(

        "click",

        openPlantModal

    );

    closeButton.addEventListener(

        "click",

        closePlantModal

    );

    cancelButton.addEventListener(

        "click",

        closePlantModal

    );

    // Add/Edit Plant modal

    modal.addEventListener(

        "click",

        (event) => {

            if (event.target === modal) {

                closePlantModal();

            }

        }

    );

    // Plant Details modal

    const detailsModal =

        document.getElementById("detailsModal");

    detailsModal.addEventListener(

        "click",

        (event) => {

            if (event.target === detailsModal) {

                detailsModal.classList.add(

                    "hidden"

                );

                viewingPlantId = null;

            }

        }

    );

}

// =========================================
// Navigation
// =========================================

function initializeNavigation() {

    const dashboardNav =
        document.getElementById("dashboardNav");

    const rankingsNav =
        document.getElementById("rankingsNav");

    const statisticsNav =
        document.getElementById("statisticsNav");

    dashboardNav.addEventListener(
        "click",
        showDashboard
    );

    rankingsNav.addEventListener(
        "click",
        showRankings
    );

    statisticsNav.addEventListener(
        "click",
        showStatistics
    );
}

function showDashboard() {

    document
        .getElementById("dashboardWelcome")
        .classList.remove("hidden");

    document
        .getElementById("dashboardSummary")
        .classList.remove("hidden");

    document
        .getElementById("dashboardPlants")
        .classList.remove("hidden");

    document
        .getElementById("rankingsSection")
        .classList.add("hidden");


    document
        .getElementById("dashboardNav")
        .classList.add("active");

    document
        .getElementById("rankingsNav")
        .classList.remove("active");
    
    document
        .getElementById("statisticsNav")
        .classList.remove("active");
}

function showRankings() {

    document
        .getElementById("dashboardWelcome")
        .classList.add("hidden");

    document
        .getElementById("dashboardSummary")
        .classList.add("hidden");

    document
        .getElementById("dashboardPlants")
        .classList.add("hidden");

    document
        .getElementById("rankingsSection")
        .classList.remove("hidden");


    document
        .getElementById("dashboardNav")
        .classList.remove("active");

    document
        .getElementById("rankingsNav")
        .classList.add("active");

    document
        .getElementById("statisticsNav")
        .classList.remove("active");


    renderRankings();
}

// =========================================
// Show Statistics
// =========================================

function showStatistics() {
    document
        .getElementById("dashboardWelcome")
        .classList.add("hidden");

    document
        .getElementById("dashboardSummary")
        .classList.add("hidden");

    document
        .getElementById("dashboardPlants")
        .classList.add("hidden");

    document
        .getElementById("rankingsSection")
        .classList.add("hidden");

    document
        .getElementById("statisticsSection")
        .classList.remove("hidden");

    document
        .getElementById("dashboardNav")
        .classList.remove("active");

    document
        .getElementById("rankingsNav")
        .classList.remove("active");

    document
        .getElementById("statisticsNav")
        .classList.add("active");

    renderStatistics();
}

// =========================================
// Rankings
// =========================================

function renderRankings() {

    const rankingsGrid =
        document.getElementById(
            "rankingsGrid"
        );

    if (!rankingsGrid) {
        return;
    }


    // -----------------------------------------
    // No plants
    // -----------------------------------------

    if (plants.length === 0) {

        rankingsGrid.innerHTML = `

            <div class="ranking-empty">

                <div class="ranking-empty-icon">
                    🌱
                </div>

                <h3>
                    No plants to rank yet
                </h3>

                <p>
                    Add some plants to your
                    collection to see rankings.
                </p>

                <button
                    class="primary-button"
                    onclick="
                        showDashboard();
                        openPlantModal();
                    "
                >
                    + Add Plant
                </button>

            </div>

        `;

        return;
    }


    // -----------------------------------------
    // Easiest Plants
    // -----------------------------------------

    const easiestPlants =
        [...plants]
            .sort((a, b) => {

                const difficultyOrder = {
                    Easy: 1,
                    Medium: 2,
                    Hard: 3
                };

                return (
                    difficultyOrder[a.difficulty] -
                    difficultyOrder[b.difficulty]
                );

            })
            .slice(0, 3);


    // -----------------------------------------
    // Most Frequent Watering
    // -----------------------------------------

    const frequentWatering =
        [...plants]
            .sort((a, b) => {

                return (
                    Number(a.wateringInterval) -
                    Number(b.wateringInterval)
                );

            })
            .slice(0, 3);


    // -----------------------------------------
    // Most Challenging
    // -----------------------------------------

    const challengingPlants =
        [...plants]
            .sort((a, b) => {

                const difficultyOrder = {
                    Hard: 1,
                    Medium: 2,
                    Easy: 3
                };

                return (
                    difficultyOrder[a.difficulty] -
                    difficultyOrder[b.difficulty]
                );

            })
            .slice(0, 3);


    // -----------------------------------------
    // Display rankings
    // -----------------------------------------

    rankingsGrid.innerHTML = `

        ${createRankingCard(
            "🌱",
            "Easiest to Care For",
            easiestPlants,
            "difficulty"
        )}

        ${createRankingCard(
            "💧",
            "Most Frequent Watering",
            frequentWatering,
            "watering"
        )}

        ${createRankingCard(
            "🌿",
            "Most Challenging",
            challengingPlants,
            "difficulty"
        )}

    `;
}

// =========================================
// Ranking Card
// =========================================

function createRankingCard(
    icon,
    title,
    rankingPlants,
    type
    ) {

    const medals = [
        "🥇",
        "🥈",
        "🥉"
    ];

    const rows = rankingPlants
        .map((plant, index) => {

            let value;

            if (type === "watering") {

                value =
                    `Every ${plant.wateringInterval} days`;

            } else {

                value =
                    plant.difficulty;

            }

            return `

                <div class="ranking-row">

                    <span class="ranking-position">
                        ${medals[index]}
                    </span>

                    <div class="ranking-plant">

                        <div class="ranking-avatar">

                            ${
                                plant.image
                                    ? `
                                        <img
                                            src="${plant.image}"
                                            alt="${escapeHtml(
                                                plant.name
                                            )}"
                                        >
                                      `
                                    : "🌿"
                            }

                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(
                                    plant.name
                                )}
                            </strong>

                            <span>
                                ${formatPlantType(
                                    plant.type
                                )}
                            </span>

                        </div>

                    </div>

                    <span class="ranking-value">
                        ${value}
                    </span>

                </div>

            `;

        })
        .join("");


    return `

        <article class="ranking-card">

            <div class="ranking-card-header">

                <span class="ranking-card-icon">
                    ${icon}
                </span>

                <div>

                    <h2>
                        ${title}
                    </h2>

                    <p>
                        Top ${rankingPlants.length}
                        plants
                    </p>

                </div>

            </div>


            <div class="ranking-list">

                ${rows}

            </div>

        </article>

    `;
}

// =========================================
// Statistics
// =========================================

function calculateStatistics() {
    const totalPlants = plants.length;

    let healthyPlants = 0;
    let dueSoonPlants = 0;
    let overduePlants = 0;

    let totalWateringEvents = 0;
    let totalWateringInterval = 0;

    plants.forEach((plant) => {
        const status = getPlantStatus(plant);

        if (status === "healthy") {
            healthyPlants++;
        } else if (status === "due") {
            dueSoonPlants++;
        } else if (status === "overdue") {
            overduePlants++;
        }

        if (Array.isArray(plant.wateringHistory)) {
            totalWateringEvents +=
                plant.wateringHistory.length;
        }

        totalWateringInterval +=
            Number(plant.wateringInterval) || 0;
    });

    const averageWateringInterval =
        totalPlants > 0
            ? Math.round(
                  totalWateringInterval /
                  totalPlants
              )
            : 0;

    return {
        totalPlants,
        healthyPlants,
        dueSoonPlants,
        overduePlants,
        totalWateringEvents,
        averageWateringInterval
    };
}

// =========================================
// Watering Overview
// =========================================

function calculateWateringOverview() {
    let totalWateringEvents = 0;
    let mostWateredPlant = null;
    let highestWateringCount = 0;

    plants.forEach((plant) => {
        const wateringHistory =
            Array.isArray(plant.wateringHistory)
                ? plant.wateringHistory
                : [];

        const wateringCount =
            wateringHistory.length;

        totalWateringEvents += wateringCount;

        if (wateringCount > highestWateringCount) {
            highestWateringCount =
                wateringCount;

            mostWateredPlant = plant;
        }
    });

    return {
        totalWateringEvents,
        mostWateredPlant,
        highestWateringCount
    };
}

// =========================================
// Render Statistics
// =========================================

function renderStatistics() {
    const statisticsGrid =
        document.getElementById("statisticsGrid");

    if (!statisticsGrid) {
        return;
    }

    const statistics =
        calculateStatistics();

    statisticsGrid.innerHTML = `
        <article class="statistic-card">
            <div class="statistic-icon">
                🌿
            </div>

            <div class="statistic-content">
                <span class="statistic-label">
                    Total Plants
                </span>

                <strong class="statistic-value">
                    ${statistics.totalPlants}
                </strong>

                <span class="statistic-description">
                    Plants in your collection
                </span>
            </div>
        </article>

        <article class="statistic-card">
            <div class="statistic-icon">
                🟢
            </div>

            <div class="statistic-content">
                <span class="statistic-label">
                    Healthy
                </span>

                <strong class="statistic-value">
                    ${statistics.healthyPlants}
                </strong>

                <span class="statistic-description">
                    Plants currently healthy
                </span>
            </div>
        </article>

        <article class="statistic-card">
            <div class="statistic-icon">
                🟡
            </div>

            <div class="statistic-content">
                <span class="statistic-label">
                    Due Soon
                </span>

                <strong class="statistic-value">
                    ${statistics.dueSoonPlants}
                </strong>

                <span class="statistic-description">
                    Plants needing water soon
                </span>
            </div>
        </article>

        <article class="statistic-card">
            <div class="statistic-icon">
                🔴
            </div>

            <div class="statistic-content">
                <span class="statistic-label">
                    Overdue
                </span>

                <strong class="statistic-value">
                    ${statistics.overduePlants}
                </strong>

                <span class="statistic-description">
                    Plants that need attention
                </span>
            </div>
        </article>

        <article class="statistic-card">
            <div class="statistic-icon">
                💧
            </div>

            <div class="statistic-content">
                <span class="statistic-label">
                    Watering Events
                </span>

                <strong class="statistic-value">
                    ${statistics.totalWateringEvents}
                </strong>

                <span class="statistic-description">
                    Recorded watering events
                </span>
            </div>
        </article>

        <article class="statistic-card">
            <div class="statistic-icon">
                📅
            </div>

            <div class="statistic-content">
                <span class="statistic-label">
                    Average Interval
                </span>

                <strong class="statistic-value">
                    ${statistics.averageWateringInterval}
                </strong>

                <span class="statistic-description">
                    Days between watering
                </span>
            </div>
        </article>
    `;

        const wateringOverview =
        document.getElementById(
            "wateringOverview"
        );

    if (!wateringOverview) {
        return;
    }

    const wateringData =
        calculateWateringOverview();

    const mostWateredPlant =
        wateringData.mostWateredPlant;

    wateringOverview.innerHTML = `
        <div class="watering-overview-header">
            <div>
                <span class="watering-overview-icon">
                    💧
                </span>

                <div>
                    <h2>
                        Watering Overview
                    </h2>

                    <p>
                        A summary of your watering activity.
                    </p>
                </div>
            </div>
        </div>

        <div class="watering-overview-grid">

            <div class="watering-stat">
                <span class="watering-stat-label">
                    Total Watering Events
                </span>

                <strong>
                    ${wateringData.totalWateringEvents}
                </strong>

                <span>
                    Recorded across all plants
                </span>
            </div>

            <div class="watering-stat">
                <span class="watering-stat-label">
                    Most Watered Plant
                </span>

                <strong>
                    ${
                        mostWateredPlant
                            ? escapeHtml(
                                  mostWateredPlant.name
                              )
                            : "None"
                    }
                </strong>

                <span>
                    ${
                        mostWateredPlant
                            ? `${wateringData.highestWateringCount} recorded events`
                            : "No watering records yet"
                    }
                </span>
            </div>

            <div class="watering-stat">
                <span class="watering-stat-label">
                    Collection Size
                </span>

                <strong>
                    ${plants.length}
                </strong>

                <span>
                    Plants being tracked
                </span>
            </div>

        </div>
    `;
}

function openPlantModal() {

    document

        .getElementById("plantModal")

        .classList.remove("hidden");

}

function closePlantModal() {

    document

        .getElementById("plantModal")

        .classList.add("hidden");

}

function resetPlantForm() {

    editingPlantId = null;

    const form =

        document.getElementById("plantForm");

    form.reset();

    document.getElementById(

        "lastWatered"

    ).value =

        getTodayString();

    document.getElementById(

        "lastWatered"

    ).max =

        getTodayString();

    document.getElementById(

        "previewDifficulty"

    ).textContent =

        "—";

    document.getElementById(

        "previewLight"

    ).textContent =

        "—";

    document.querySelector(

        ".modal-header h2"

    ).textContent =

        "Add a Plant";

    document.querySelector(

        ".modal-header .eyebrow"

    ).textContent =

        "NEW PLANT";

    const imageInput =

        document.getElementById(

            "plantImage"

        );

    if (imageInput) {

        imageInput.value = "";

    }

    const imagePreview =

        document.getElementById(

            "plantImagePreview"

        );

    if (imagePreview) {

        imagePreview.innerHTML = `

            <span>🌿</span>

        `;

    }

}

// =========================================

// Plant Type Preview

// =========================================

function initializePlantTypePreview() {

    const typeSelect =

        document.getElementById(

            "plantType"

        );

    const intervalInput =

        document.getElementById(

            "wateringInterval"

        );

    const difficulty =

        document.getElementById(

            "previewDifficulty"

        );

    const light = document.getElementById("previewLight");

        typeSelect.addEventListener("change", () => {

                
            const selectedType = plantTypes[typeSelect.value];

            if (typeSelect.value === "__add_custom__") {
                return;
            }

            if (!selectedType) {
                difficulty.textContent = "Medium";
                light.textContent = "Bright indirect";
                intervalInput.value = 7;
                return;
            }


                intervalInput.value =

                    selectedType.wateringInterval;

                difficulty.textContent =

                    selectedType.difficulty;

                light.textContent =

                    selectedType.light;

        }

    );

}

// =========================================

// Filters

// =========================================

function initializeFilters() {

    const filterButtons =

        document.querySelectorAll(

            ".filter-tab"

        );

    filterButtons.forEach(

        button => {

            button.addEventListener(

                "click",

                () => {

                    filterButtons.forEach(

                        item =>

                            item.classList.remove(

                                "active"

                            )

                    );

                    button.classList.add(

                        "active"

                    );

                    currentFilter =

                        button.dataset.filter;

                    renderPlants();

                }

            );

        }

    );

}

// =========================================

// Search

// =========================================

function initializeSearch() {

    const searchInput =

        document.getElementById(

            "searchInput"

        );

    searchInput.addEventListener(

        "input",

        () => {

            searchTerm =

                searchInput.value.trim();

            renderPlants();

        }

    );

}

// =========================================
// Sorting
// =========================================

function initializeSorting() {

    const sortSelect =
        document.getElementById("sortSelect");

    if (!sortSelect) {
        return;
    }

    sortSelect.addEventListener(
        "change",
        () => {

            currentSort =
                sortSelect.value;

            renderPlants();
        }
    );
}

// =========================================

// Dark Mode

// =========================================

function initializeTheme() {

    const themeToggle =

        document.getElementById(

            "themeToggle"

        );

    const savedTheme =

        localStorage.getItem(

            "plantCareTheme"

        );

    if (savedTheme === "dark") {

        document.body.classList.add(

            "dark-mode"

        );

        themeToggle.textContent =

            "☀️";

    }

    themeToggle.addEventListener(

        "click",

        () => {

            document.body.classList.toggle(

                "dark-mode"

            );

            const isDark =

                document.body.classList.contains(

                    "dark-mode"

                );

            localStorage.setItem(

                "plantCareTheme",

                isDark ? "dark" : "light"

            );

            themeToggle.textContent =

                isDark ? "☀️" : "🌙";

        }

    );

}

// =========================================

// Toast

// =========================================

let toastTimeout;

function showToast(

    message,

    icon = "✓"

) {

    const toast =

        document.getElementById(

            "toast"

        );

    const toastMessage =

        document.getElementById(

            "toastMessage"

        );

    const toastIcon =

        document.getElementById(

            "toastIcon"

        );

    toastMessage.textContent =

        message;

    toastIcon.textContent =

        icon;

    toast.classList.remove(

        "hidden"

    );

    clearTimeout(

        toastTimeout

    );

    toastTimeout =

        setTimeout(

            () => {

                toast.classList.add(

                    "hidden"

                );

            },

            3000

        );

}

// =========================================

// Utility

// =========================================


function formatPlantType(type) {
    const names = {
        pothos: "Pothos",
        monstera: "Monstera",
        "snake-plant": "Snake Plant",
        "peace-lily": "Peace Lily",
        "spider-plant": "Spider Plant",
        calathea: "Calathea",
        orchid: "Orchid"
    };

    if (names[type]) {
        return names[type];
    }

    const savedTypes = JSON.parse(
        localStorage.getItem("plantCareCustomTypes") || "[]"
    );

    const customType = savedTypes.find(
        item => item.value === type
    );

    return customType ? customType.name : type;
}


function escapeHtml(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(

            /"/g,

            "&quot;"

        )

        .replace(

            /'/g,

            "&#039;"

        );

}

// =========================================

// Plant Image

// =========================================

function readPlantImage(file) {

    return new Promise(

        (resolve, reject) => {

            if (!file) {

                resolve("");

                return;

            }

            const reader =

                new FileReader();

            reader.onload =

                (event) => {

                    const image =

                        new Image();

                    image.onload =

                        () => {

                            const maxSize =

                                800;

                            let width =

                                image.width;

                            let height =

                                image.height;

                            if (

                                width >

                                    maxSize ||

                                height >

                                    maxSize

                            ) {

                                if (

                                    width >

                                    height

                                ) {

                                    height =

                                        height *

                                        (maxSize /

                                            width);

                                    width =

                                        maxSize;

                                } else {

                                    width =

                                        width *

                                        (maxSize /

                                            height);

                                    height =

                                        maxSize;

                                }

                            }

                            const canvas =

                                document.createElement(

                                    "canvas"

                                );

                            canvas.width =

                                width;

                            canvas.height =

                                height;

                            const context =

                                canvas.getContext(

                                    "2d"

                                );

                            context.drawImage(

                                image,

                                0,

                                0,

                                width,

                                height

                            );

                            resolve(

                                canvas.toDataURL(

                                    "image/jpeg",

                                    0.8

                                )

                            );

                        };

                    image.onerror =

                        reject;

                    image.src =

                        event.target.result;

                };

            reader.onerror =

                reject;

            reader.readAsDataURL(

                file

            );

        }

    );

}

// =========================================

// Edit Plant

// =========================================

function editPlant(plantId) {

    const plant =

        plants.find(

            item => item.id === plantId

        );

    if (!plant) {

        return;

    }

    editingPlantId =

        plantId;

    document.querySelector(

        ".modal-header h2"

    ).textContent =

        "Edit Plant";

    document.querySelector(

        ".modal-header .eyebrow"

    ).textContent =

        "UPDATE PLANT";

    document.getElementById(

        "plantName"

    ).value =

        plant.name;

    document.getElementById(

        "plantType"

    ).value =

        plant.type;

    document.getElementById(

        "lastWatered"

    ).value =

        plant.lastWatered;

    document.getElementById(

        "wateringInterval"

    ).value =

        plant.wateringInterval;

    document.getElementById(

        "plantLocation"

    ).value =

        plant.location || "";

    document.getElementById(

        "plantNotes"

    ).value =

        plant.notes || "";

    document.getElementById(

        "previewDifficulty"

    ).textContent =

        plant.difficulty;

    document.getElementById(

        "previewLight"

    ).textContent =

        plant.light;

    const imagePreview =

        document.getElementById(

            "plantImagePreview"

        );

    if (imagePreview) {

        if (plant.image) {

            imagePreview.innerHTML = `

                <img

                    src="${plant.image}"

                    alt="${escapeHtml(

                        plant.name

                    )}"

                >

            `;

        } else {

            imagePreview.innerHTML = `

                <span>🌿</span>

            `;

        }

    }

    const imageInput =

        document.getElementById(

            "plantImage"

        );

    if (imageInput) {

        imageInput.value = "";

    }

    openPlantModal();

}

// =========================================

// Delete Plant

// =========================================

function deletePlant(plantId) {

    const plant =

        plants.find(

            item => item.id === plantId

        );

    if (!plant) {

        return;

    }

    const confirmed =

        confirm(

            `Remove ${plant.name}?`

        );

    if (!confirmed) {

        return;

    }

    plants =

        plants.filter(

            item => item.id !== plantId

        );

    savePlants();

    renderPlants();

    showToast(

        `${plant.name} was removed.`,

        "🗑️"

    );

}

function viewPlantDetails(plantId) {

    const plant =

        plants.find(

            item => item.id === plantId

        );

    if (!plant) {

        return;

    }

    viewingPlantId =

        plantId;

    document.getElementById(

        "detailsPlantName"

    ).textContent =

        plant.name;

    document.getElementById(

        "detailsPlantType"

    ).textContent =

        formatPlantType(

            plant.type

        );

    const detailsTypeHeader =

        document.getElementById(

            "detailsPlantTypeHeader"

        );

    if (detailsTypeHeader) {

        detailsTypeHeader.textContent =

            formatPlantType(

                plant.type

            );

    }

    const detailsImage =

        document.getElementById(

            "detailsPlantImage"

        );

    if (detailsImage) {

        detailsImage.innerHTML =

            plant.image

                ? `

                    <img

                        src="${plant.image}"

                        alt="${escapeHtml(

                            plant.name

                        )}"

                    >

                `

                : `

                    <span>🌿</span>

                `;

    }

    document.getElementById(

        "detailsDifficulty"

    ).textContent =

        plant.difficulty;

    document.getElementById(

        "detailsLight"

    ).textContent =

        plant.light;

    document.getElementById(

        "detailsLocation"

    ).textContent =

        plant.location ||

        "Not specified";

    document.getElementById(

        "detailsLastWatered"

    ).textContent =

        formatDate(

            plant.lastWatered

        );

    document.getElementById(

        "detailsInterval"

    ).textContent =

        `${plant.wateringInterval} days`;

    const nextWateringDate =

        calculateNextWateringDate(

            plant

        );

    document.getElementById(

        "detailsNextWatering"

    ).textContent =

        formatDate(

            nextWateringDate

        );

    const status =

        getPlantStatus(

            plant

        );

    document.getElementById(

        "detailsStatus"

    ).textContent =

        formatStatus(

            status

        );

    document.getElementById(

        "detailsNotes"

    ).textContent =

        plant.notes ||

        "No notes added.";

    renderWateringHistory(

        plant

    );

    const waterButton =

        document.getElementById(

            "detailsWaterButton"

        );

    if (

        plant.lastWatered ===

        getTodayString()

    ) {

        waterButton.disabled =

            true;

        waterButton.textContent =

            "✓ Watered Today";

    } else {

        waterButton.disabled =

            false;

        waterButton.textContent =

            "💧 Water Plant";

    }

    document.getElementById(

        "detailsModal"

    ).classList.remove(

        "hidden"

    );

}

function renderWateringHistory(plant) {
    const historyContainer =
        document.getElementById("wateringHistoryList");

    if (!historyContainer) {
        return;
    }

    const history = Array.isArray(plant.wateringHistory)
        ? plant.wateringHistory
        : [];

    if (history.length === 0) {
        historyContainer.innerHTML = `
            <div class="history-empty-state">
                <span class="history-empty-icon">💧</span>
                <p>No watering history yet.</p>
                <span>Water your plant to start its care timeline.</span>
            </div>
        `;

        return;
    }

    const sortedHistory = [...history].sort(
        (a, b) => new Date(b) - new Date(a)
    );

    historyContainer.innerHTML = `
        <div class="history-summary">
            <span>Recorded watering events</span>
            <strong>${sortedHistory.length}</strong>
        </div>

        <div class="history-timeline">
            ${sortedHistory
                .map((date, index) => `
                    <div class="history-item">
                        <div class="history-timeline-marker">
                            💧
                        </div>

                        <div class="history-item-content">
                            <span class="history-date">
                                ${formatDate(date)}
                            </span>

                            ${
                                index === 0
                                    ? `<span class="history-latest-badge">Latest</span>`
                                    : ""
                            }
                        </div>
                    </div>
                `)
                .join("")}
        </div>
    `;
}

document

    .getElementById(

        "closeDetailsModal"

    )

    .addEventListener(

        "click",

        () => {

            document

                .getElementById(

                    "detailsModal"

                )

                .classList.add(

                    "hidden"

                );

            viewingPlantId = null;

        }

    );

document

    .getElementById(

        "detailsEditButton"

    )

    .addEventListener(

        "click",

        () => {

            if (!viewingPlantId) {

                return;

            }

            const plantId =

                viewingPlantId;

            document

                .getElementById(

                    "detailsModal"

                )

                .classList.add(

                    "hidden"

                );

            editPlant(

                plantId

            );

        }

    );

document

    .getElementById(

        "detailsWaterButton"

    )

    .addEventListener(

        "click",

        () => {

            if (!viewingPlantId) {

                return;

            }

            waterPlant(

                viewingPlantId

            );

            const plant =

                plants.find(

                    item =>

                        item.id ===

                        viewingPlantId

                );

            if (plant) {

                renderWateringHistory(

                    plant

                );

            }

        }

    );
