streets_list_popup = document.getElementById('streets-list-popup')
let isOpen = false;
  function toggleStreets() {
    const container = document.getElementById('community-select');
    container.innerHTML = ''; // Clear current contents

    if (isOpen) {
      // Closed state
      container.innerHTML = '<span>"s/street"</span>';
    } else {
      // Open state with 5 street spans
      for (let i = 1; i <= 5; i++) {
        const span = document.createElement('span');
        span.textContent = `"street${i}"`;
        container.appendChild(span);
      }
    }

    isOpen = !isOpen;
  }