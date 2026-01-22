// Force project cards to be visible even if Isotope is waiting for images
document.addEventListener('DOMContentLoaded', function () {
    // Wait a bit for Isotope to try initializing
    setTimeout(function () {
        const gridItems = document.querySelectorAll('.grid-item, .col[data-animate]');

        // Force visibility if cards are still hidden
        gridItems.forEach(function (item) {
            const computedStyle = window.getComputedStyle(item);
            if (computedStyle.opacity === '0' || computedStyle.visibility === 'hidden') {
                item.style.opacity = '1';
                item.style.visibility = 'visible';
                item.style.transform = 'none';
            }
        });

        console.log('Project cards visibility forced');
    }, 2000); // Wait 2 seconds for Isotope
});
