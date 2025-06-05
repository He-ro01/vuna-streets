// ===== GLOBAL =====
let currentPageIndex = 0;
const pages = document.querySelectorAll(".street-create-page"); // General class for pages
const actve_page = pages[0];
// ===== INIT =====
function goToPage(pageIndex) {
    currentPageIndex = pageIndex;
    pages.forEach((page, index) => {
        page.classList.toggle("active", index === pageIndex);

    });
    //   console.log(pages);
}
goToPage(0); // Show Page 1 (index 0) initially

// ===== PAGE 1: Create Street Details =====
const streetCreationForm = document.getElementById("street-creation-form");
const descriptionTextarea = document.getElementById("street-preview-description");
const streetNameInput = document.getElementById("street-name-input");

descriptionTextarea.addEventListener("input", () => {
    descriptionTextarea.style.height = "auto"; // Reset height
    descriptionTextarea.style.height = descriptionTextarea.scrollHeight + "px"; // Set to scroll height
});

streetCreationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const streetName = streetNameInput.value.trim();
    const description = descriptionTextarea.value.trim();

    if (!streetName) {
        alert("Street Name cannot be empty.");
        streetNameInput.focus();
        return;
    }
    if (description.length < 16) {
        alert("Description must be at least 16 characters.");
        descriptionTextarea.focus();
        return;
    }

    document.getElementById("street-preview-name").textContent = streetName;
    document.getElementById("street-preview-description").textContent = description;

    goToPage(1); // Go to Page 2 (index 1)
});

// ===== PAGE 2: Style Street (Banner & Avatar) =====
document.getElementById("next-to-topics-page-button").addEventListener("click", () => {
    goToPage(2); // Go to Page 3 (index 2)
});

// Placeholder listeners for add banner/avatar
document.getElementById("add-banner-image-button").addEventListener("click", () => {
    alert("Add Banner Image functionality to be implemented.");
});
document.getElementById("add-avatar-image-button").addEventListener("click", () => {
    alert("Add Avatar Image functionality to be implemented.");
});


// ===== PAGE 3: Choose Street Topics =====
const selectedTopicsSet = new Set();
const selectedTopicsContainer = document.getElementById("selected-topics-container");
const selectedTopicCountSpan = document.getElementById("selected-topic-count-span");
const nextToTypePageButton = document.getElementById("next-to-type-page-button");
const MAX_TOPICS = 3;

function renderSelectedTopicTags() {
    selectedTopicsContainer.innerHTML = ""; // Clear previous tags
    selectedTopicsSet.forEach((topic) => {
        const tagElement = document.createElement("div");
        tagElement.className = "topic-tag"; // General class for styling
        tagElement.textContent = topic;

        const removeSpan = document.createElement("span");
        removeSpan.className = "topic-tag-remove"; // General class for styling remove icon
        removeSpan.innerHTML = "&times;"; // 'x' symbol
        removeSpan.onclick = (event) => {
            event.stopPropagation(); // Prevent topic item click if nested
            selectedTopicsSet.delete(topic);
            updateTopicSelectionUI();
        };
        tagElement.appendChild(removeSpan);
        selectedTopicsContainer.appendChild(tagElement);
    });
    selectedTopicCountSpan.textContent = selectedTopicsSet.size;
    nextToTypePageButton.disabled = selectedTopicsSet.size === 0;
}

function updateTopicSelectionUI() {
    renderSelectedTopicTags();
    document.querySelectorAll(".topic-item").forEach((selectorDiv) => {
        selectorDiv.classList.toggle("selected", selectedTopicsSet.has(selectorDiv.dataset.topicName));
    });
}

function loadTopicCategories() {
    const topicCategories = getTopicCategoriesData(); // Renamed function for clarity
    const topicCategoriesList = document.getElementById("topic-categories-list");

    for (const [categoryName, topicsArray] of Object.entries(topicCategories)) {
        const categoryGroupDiv = document.createElement("div");
        categoryGroupDiv.className = "topic-category-group"; // General class for styling

        const titleElement = document.createElement("h3");
        titleElement.textContent = categoryName;
        categoryGroupDiv.appendChild(titleElement);

        topicsArray.forEach((topic) => {
            const topicDiv = document.createElement("div");
            topicDiv.className = "topic-item"; // General class for styling
            topicDiv.textContent = topic;
            topicDiv.dataset.topicName = topic; // Store topic name for easy access

            topicDiv.onclick = () => {
                if (selectedTopicsSet.has(topic)) {
                    selectedTopicsSet.delete(topic);
                } else if (selectedTopicsSet.size < MAX_TOPICS) {
                    selectedTopicsSet.add(topic);
                } else {
                    alert(`You can select a maximum of ${MAX_TOPICS} topics.`);
                }
                updateTopicSelectionUI();
            };
            categoryGroupDiv.appendChild(topicDiv);
        });
        topicCategoriesList.appendChild(categoryGroupDiv);
    }
}

document.getElementById("next-to-type-page-button").addEventListener("click", () => {
    if (selectedTopicsSet.size > 0) {
        goToPage(3); // Go to Page 4 (index 3)
    } else {
        alert("Please select at least one topic.");
    }
});

loadTopicCategories(); // Initial load of topics

// ===== PAGE 4: Set Street Type =====
let selectedStreetType = null;
const streetTypeOptionItems = document.querySelectorAll(".option-item"); // General class
const finishCreationButton = document.getElementById("finish-creation-button");

streetTypeOptionItems.forEach((optionItem) => {
    optionItem.addEventListener("click", () => {
        streetTypeOptionItems.forEach((oi) => oi.classList.remove("selected")); // General class
        optionItem.classList.add("selected"); // General class
        selectedStreetType = optionItem.dataset.value;
        finishCreationButton.disabled = false;
    });
});

finishCreationButton.addEventListener("click", async () => {
    if (!selectedStreetType) {
        alert("Please select a street type.");
        return;
    }

    const user = await getUser(); // Wait for user info
    const streetData = {
        name: streetNameInput.value.trim(),
        description: descriptionTextarea.value.trim(),
        topics: Array.from(selectedTopicsSet),
        type: selectedStreetType,
        creator: user, // Should be an object with `id` and `username`
        bannerImage: "", // Optional – set if available
        avatarImage: ""  // Optional – set if available
    };

    try {
        const response = await fetch('http://localhost:5000/api/streets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(streetData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        alert(`✅ Street created successfully!\nName: ${result.name}`);
        // console.log("Server response:", result);

        // Reset logic (if you want to reset the form)
        // streetCreationForm.reset();
        // descriptionTextarea.style.height = "auto";
        // selectedTopicsSet.clear();
        // updateTopicSelectionUI();
        // streetTypeOptionItems.forEach(oi => oi.classList.remove("selected"));
        // selectedStreetType = null;
        // finishCreationButton.disabled = true;
        // goToPage(0);

    } catch (err) {
        console.error("Failed to create street:", err);
        alert("❌ Failed to create street. Check the console for more info.");
    }
});


// ===== TOPIC DATA (Utility Function) =====
function getTopicCategoriesData() {
    return {
        "Music & Entertainment": [
            "Afrobeats", "Street Rap", "Block Parties", "Dance Battles", "Traditional Drumming", "Open Mic", "Street Theatre"
        ],
        "Food & Drinks": [
            "Chop Life", "Suya Spots", "Local Bites", "Rice & Stew", "Bole & Fish", "Evening Bukas", "Street Snacks"
        ],
        "Urban Hustle": [
            "Side Hustles", "Market Life", "Keke Rides", "Okada Stories", "Street Vendors", "Night Shifts", "Mobile Repairs"
        ],
        "Culture & Language": [
            "Slangs", "Pidgin English", "Tribal Sayings", "Oral History", "Street Proverbs", "Local Greetings", "Family Clans"
        ],
        "School & Youth Life": [
            "Campus Life", "Hostel Gist", "Lecturer Wahala", "Exam Fever", "Midnight Reading", "School Politics", "Final Year Life"
        ],
        "Health & Wellness": [
            "Street Workouts", "Herbal Remedies", "Local Clinics", "Mental Health", "Clean Water", "Health Education", "Sanitation"
        ],
        "Relationships & Life": [
            "Love on the Block", "Friendship Circles", "Heartbreak Gists", "Advice Time", "Crush Confessions", "Dating in the Hood"
        ],
        "Faith & Belief": [
            "Street Preaching", "Mosque Moments", "Church Street", "Youth Fellowship", "Worship Nights", "Traditional Beliefs"
        ],
        "Tech & Trends": [
            "Mobile Hacks", "WhatsApp Broadcasts", "Online Business", "TikTok Culture", "Internet Cafes", "Crypto Talks"
        ],
        "Street Events": [
            "Carnivals", "Festivals", "Wedding Parades", "Funeral Tributes", "Birthday Blocks", "Community Projects"
        ]
    };
}