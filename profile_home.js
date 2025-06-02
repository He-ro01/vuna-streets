document.addEventListener('DOMContentLoaded', function () {
    const columnB = document.querySelector('.profile-home .column-B');

    function isAtPageBottom(padding = 5) {
        const scrollTop = window.scrollY || window.pageYOffset;
        const viewportHeight = window.innerHeight;
        const totalHeight = document.documentElement.scrollHeight;
        return scrollTop + viewportHeight >= totalHeight - padding;
    }
    //
    function isAtTop(el, padding = 5) {
        return el.scrollTop <= padding;
    }
    //
    window.addEventListener('scroll', () => {
        if (isAtPageBottom()) {
            console.log("rock bottom");
            if (columnB) {
                columnB.style.pointerEvents = 'auto';
                return;
            }
        }
        if (isAtTop(columnB)) {
            columnB.style.pointerEvents = 'none';
        }

    });
    columnB.addEventListener('scroll', () => {

        if (isAtPageBottom()) {
            console.log("rock bottom");
            if (columnB) {
                columnB.style.pointerEvents = 'auto';
                return;
            }
        }
        if (isAtTop(columnB)) {
            columnB.style.pointerEvents = 'none';
        }
    });
});