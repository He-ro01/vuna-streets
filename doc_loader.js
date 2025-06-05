// ------------------------------
// Modified loadDocElement to accept multiple classes (including a single space‐separated string)
// ------------------------------
async function loadDocElement(docEl, ...classInputs) {
    const path = docEl.getAttribute('path');
    if (!path) return null;

    try {
        // 1) Fetch the HTML
        const response = await fetch(path);
        const html = await response.text();

        // 2) Create a container and mark its origin
        const container = document.createElement('div');
        container.setAttribute('doc-origin', path);

        // 3) Build a flat array of class names from classInputs
        const classNames = [];
        classInputs.forEach(input => {
            if (!input) return;
            if (Array.isArray(input)) {
                // If someone passed an array of class names
                classNames.push(...input);
            } else if (typeof input === 'string') {
                // If it’s a string (possibly with spaces), split on whitespace
                classNames.push(...input.trim().split(/\s+/));
            }
        });
        if (classNames.length) {
            container.classList.add(...classNames);
        }

        // 4) Parse out <script> tags so we can insert the rest of the HTML first
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const scripts = Array.from(tmp.querySelectorAll('script'));
        scripts.forEach(s => s.remove());

        // 5) Insert the non‐script HTML into the container
        container.innerHTML = tmp.innerHTML;

        // 6) Swap <doc> for our container
        docEl.replaceWith(container);

        // 7) Re‐create & execute each <script> by appending to <body>
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            for (const attr of oldScript.attributes) {
                newScript.setAttribute(attr.name, attr.value);
            }
            if (!oldScript.src) {
                newScript.textContent = oldScript.textContent;
            }
            document.body.appendChild(newScript);
        });

        return container;
    } catch (err) {
        console.error(`Failed to load ${path}:`, err);
        return null;
    }
}


// On initial DOMContentLoaded, auto‐load every <doc> NOT inside any overlay.
window.addEventListener('DOMContentLoaded', () => {
    const allDocEls = document.querySelectorAll('doc[path]');
    allDocEls.forEach(docEl => {
        // Skip any <doc> that is a descendant of .overlay
        if (!docEl.closest('.overlay')) {
            loadDocElement(docEl);
        }
    });
});


// Expose a function to lazy‐load all <doc> tags inside a given container.
// (Overlay script will call this when an overlay is opened.)
function loadDocsInContainer(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const docsInside = container.querySelectorAll('doc[path]');
    docsInside.forEach(docEl => {
        loadDocElement(docEl);
    });
}

// Make sure the above is globally available:
window.loadDocsInContainer = loadDocsInContainer;
