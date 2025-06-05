const sidebar_left = document.querySelector('.side-bar.left-fixed');
const toggleBtn_left = document.querySelector('.sidebar-toggle.left');

toggleBtn_left.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent bubbling up to document
    sidebar_left.classList.toggle('active');
    overlay.classList.add('active');
    enableOverlayBlocking();
});
user_menu_toggle.addEventListener(`click`, (e) => {
    e.stopPropagation(); // prevent bubbling up to document
     sidebar_left.classList.toggle('active');
    overlay.classList.add('active');
    enableOverlayBlocking();
});

