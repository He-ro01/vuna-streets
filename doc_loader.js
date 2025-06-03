window.addEventListener('DOMContentLoaded', async () => {
    const docElements = document.querySelectorAll('doc[path]');

    for (const el of docElements) {
        const path = el.getAttribute('path');
        console.log(path);

        try {
            const response = await fetch(path);
            const html = await response.text();
            console.log(html);
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;

            // Replace <doc> with loaded content
            el.replaceWith(...wrapper.childNodes);
        } catch (e) {
            console.error(`Failed to load ${path}`, e);
        }
    }
});