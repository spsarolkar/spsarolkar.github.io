// Force project cards to be visible even if Isotope is waiting for images
document.addEventListener('DOMContentLoaded', function () {
    // Check immediately in case layout is already done
    setTimeout(function () {
        forceVisibility();
    }, 100);

    // Backup check at 500ms
    setTimeout(function () {
        forceVisibility();
        console.log('Project cards visibility enforced');
    }, 500);

    function forceVisibility() {
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
    }
});
