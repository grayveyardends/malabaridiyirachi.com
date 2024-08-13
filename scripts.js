// Function to toggle the visibility of the product description
function toggleDescription(id) {
    console.log(`Clicked on product with description ID: ${id}`);

    // Get the currently active grid item and its description
    const currentActive = document.querySelector('.grid-item.active');
    const currentDescription = document.querySelector('.description.active');

    if (currentActive) {
        currentActive.classList.remove('active');
        if (currentDescription) {
            currentDescription.classList.remove('active');
        }
    }

    // Toggle the 'active' class on the clicked grid item and its description
    const gridItem = document.querySelector(`#${id}`).parentElement;
    const description = document.getElementById(id);

    gridItem.classList.toggle('active');
    description.classList.toggle('active');
}

document.querySelectorAll('.grid-item').forEach(item => {
    item.addEventListener('click', () => {
        const descriptionId = item.querySelector('.description').id;
        toggleDescription(descriptionId);
    });
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('main');

    if (sidebar.style.width === '250px') {
        closeSidebar();
    } else {
        openSidebar();
    }
}

function openSidebar() {
    const sidebar = document.getElementById("sidebar");
    const main = document.querySelector('main');
    
    sidebar.style.width = "250px";
    document.getElementById("call-us").style.display = "block"; 
    main.style.marginLeft = "250px"; // Adjust main content
}

// Function to close the sidebar
function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    const main = document.querySelector('main');
    
    sidebar.style.width = "0";
    document.getElementById("call-us").style.display = "none"; // Hide "Call Us" when sidebar closes
    main.style.marginLeft = "0"; // Reset main content
}
var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
(function() {
    var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/66ba299b0cca4f8a7a74fec7/default';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);
})();

Tawk_API = Tawk_API || {};
Tawk_API.onLoad = function() {
    document.getElementById('chat-launcher').style.display = 'block';
};

