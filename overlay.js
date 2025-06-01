const sidebar_left = document.querySelector('.side-bar.left');
const toggleBtn_left = document.querySelector('.sidebar-toggle.left');

toggleBtn_left.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent bubbling up to document
    sidebar_left.classList.toggle('active');
    overlay.classList.add('active');
    enableOverlayBlocking();
});

overlay.addEventListener('click', (e) => {
    console.log(`overlay clicked`);
    // Only close if the click is directly on the overlay
    if (e.target === overlay) {
        closeOverlay();
    }
});

function closeOverlay() {
    sidebar_left.classList.remove('active');

    // Clear all .active children inside overlay
    overlay.querySelectorAll('.active').forEach(child => {
        child.classList.remove('active');
    });

    overlay.classList.remove('active');
    disableOverlayBlocking();
}

// Remove document click listener. Not needed anymore because overlay handles it.

// Optional: if needed
function blockEvent(e) {
    e.stopPropagation();
    e.preventDefault();
}

function enableOverlayBlocking() {
    overlay.addEventListener("touchmove", blockEvent, { passive: false });
}

function disableOverlayBlocking() {
    overlay.removeEventListener("touchstart", blockEvent);
    overlay.removeEventListener("touchmove", blockEvent);
    overlay.removeEventListener("pointerdown", blockEvent);
}
