// ------------------------------
// Overlay Script (with <doc> load & revert logic)
// ------------------------------

// 1) Query essential elements:

const sidebar_right = document.querySelector('.side-bar.right-fixed');
const toggleBtn_left = document.querySelector('.sidebar-toggle.left');

// 2) Block‐event utility (to prevent background interactions when overlay is active).
function blockEvent(e) {
    e.stopPropagation();
    e.preventDefault();
}

// 3) Enable/disable touch & pointer blocking on the overlay.
function enableOverlayBlocking() {
    overlay.addEventListener('touchmove', blockEvent, { passive: false });
    overlay.addEventListener('pointerdown', blockEvent, { passive: false });
}
function disableOverlayBlocking() {
    overlay.removeEventListener('touchmove', blockEvent);
    overlay.removeEventListener('pointerdown', blockEvent);
}


// ------------------------------
//  openOverlay: activates the overlay, then loads any <doc> inside it.
//  If the overlayElement itself is a <doc>, we load it immediately.
// ------------------------------
function openOverlay(id) {
    // 1) First, close any already‐open overlay layers:
    closeOverlay();

    // 2) Find the target overlay element (by selector or ID).
    const overlayElement = document.querySelector(`.${id}`);
    if (!overlayElement || !overlay) {
        console.error('Overlay or element with ID not found');
        return;
    }

    // 3) Activate classes
    overlayElement.classList.add('active');
    overlay.classList.add('active');
    enableOverlayBlocking();

    // 4) If the overlayElement is itself a <doc path="…">, load it now:
    if (overlayElement.tagName.toLowerCase() === 'doc') {
        loadDocElement(overlayElement, `active overlay-element ${id}`);
    }

    // 5) Load any nested <doc> tags inside this overlayElement:
    const docsInside = overlayElement.querySelectorAll('doc[path]');
    docsInside.forEach(docEl => loadDocElement(docEl));
}


// ------------------------------
//  closeOverlay: hides the overlay & reverts any already‐loaded content.
//  Every <div> with doc-origin="…" inside the overlay is replaced back to <doc path="…">.
// ------------------------------
function closeOverlay() {
    if (!overlay) return;

    // 1) Find all containers that were inserted by loadDocElement (they have doc-origin="…").
    const loadedContainers = overlay.querySelectorAll('[doc-origin]');
    loadedContainers.forEach(container => {
        const originalPath = container.getAttribute('doc-origin');
        const docEl = document.createElement('doc');
        docEl.setAttribute('path', originalPath);
        container.replaceWith(docEl);
    });

    // 2) Remove any “active” class from immediate children of the overlay.
    overlay.querySelectorAll(':scope > .active').forEach(child => {
        child.classList.remove('active');
    });

    // 3) Hide the overlay itself.
    overlay.classList.remove('active');
    disableOverlayBlocking();
}


// ------------------------------
//  Event listeners for opening & closing overlays.
// ------------------------------
toggleBtn_left.addEventListener('click', (e) => {
    openOverlay('sidebar-left');
});

user_menu_toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar_right.classList.toggle('active');
    overlay.classList.add('active');
    enableOverlayBlocking();

    // If sidebar_right itself contains a <doc>, load it now:
    if (sidebar_right.tagName.toLowerCase() === 'doc') {
        loadDocElement(sidebar_right);
    }
    // And load any nested <doc> inside sidebar_right:
    sidebar_right.querySelectorAll('doc[path]').forEach(docEl => loadDocElement(docEl));
});

overlay.addEventListener('click', (e) => {
    // Only close if the click is directly on the overlay backdrop
    if (e.target === overlay) {
        closeOverlay();
    }
});
