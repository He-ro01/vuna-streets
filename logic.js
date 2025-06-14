const container = document.getElementById("feed-container");
const overlay = document.querySelector(`.overlay`);
const user_menu_toggle = document.getElementById(`user-menu-toggle`);
const cursor_street_name = '';
const cursor_user_name = '';

/*let startY = 0;
let dragging = false;
let isAtEdge = false;
let offsetY = 0;

container.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
    dragging = true;
});

container.addEventListener("touchmove", (e) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    const atTop = container.scrollTop === 0;
    const atBottom = container.scrollTop + container.offsetHeight >= container.scrollHeight;

    // Only stretch if at edge
    if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
        isAtEdge = true;
        offsetY = deltaY * 0.4; // Dampened drag effect
        container.style.transform = `translateY(${ offsetY }px)`;
        e.preventDefault();
    }
});

container.addEventListener("touchend", () => {
    if (isAtEdge) {
        container.style.transition = "transform 0.3s ease-out";
        container.style.transform = "translateY(0)";
    }

    setTimeout(() => {
        container.style.transition = "";
        isAtEdge = false;
        dragging = false;
        offsetY = 0;
    }, 300);
});
*/ let lastScrollY = window.scrollY;
const footer = document.getElementById("page-footer");
const header = document.getElementById("page-header");
streets_list = document.getElementById(`streets-list-popup`);

window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {
        // Scrolling down
        header.classList.add("hide")
        footer.classList.add("hide");
    } else {
        // Scrolling up
        header.classList.remove("hide")
        footer.classList.remove("hide");
    }

    lastScrollY = currentScrollY;
});
function openStreetsList() {
    if (!streets_list)
        streets_list = document.getElementById(`streets-list-popup`);
    streets_list.style.display = `block`;
}

